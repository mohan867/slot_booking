// ═══════════════════════════════════════════════════════════════
//  Firebase Service Layer — replaces Express/MongoDB backend
//  All auth via Firebase Authentication
//  All data via Firebase Realtime Database
// ═══════════════════════════════════════════════════════════════
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
} from "firebase/database";
import { auth, db } from "../firebase";

/* ─────────────────────────────────────────────
   HELPER — generate unique ID
───────────────────────────────────────────── */
const uid = () => push(ref(db, "_tmp")).key;

const createNotification = async ({
  recipientUid = null,
  recipientRole = null,
  type = "info",
  title,
  message,
  bookingId = null,
}) => {
  const newRef = push(ref(db, "notifications"));
  const payload = {
    id: newRef.key,
    _id: newRef.key,
    recipientUid,
    recipientRole,
    type,
    title,
    message,
    bookingId,
    seen: false,
    createdAt: new Date().toISOString(),
  };
  await set(newRef, payload);
  return payload;
};

/* ─────────────────────────────────────────────
   AUTH SERVICES
───────────────────────────────────────────── */

/** Register a new user (stores profile in DB under users/) */
export const registerUser = async ({ name, email, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const userRef = ref(db, `users/${cred.user.uid}`);
  await set(userRef, {
    uid: cred.user.uid,
    name,
    email,
    role: "user",
    createdAt: new Date().toISOString(),
  });
  return { uid: cred.user.uid, name, email, role: "user" };
};

/** Login existing user */
export const loginUser = async ({ email, password }) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await get(ref(db, `users/${cred.user.uid}`));
  if (snap.exists()) return snap.val();
  // fallback — user exists in auth but not db (admin/staff created manually)
  return { uid: cred.user.uid, name: cred.user.displayName, email, role: "user" };
};

/** Logout */
export const logoutUser = () => signOut(auth);

/** Reset password email */
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

/** Get current user profile from DB */
export const getCurrentUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await get(ref(db, `users/${user.uid}`));
  return snap.exists() ? snap.val() : null;
};

/* ─────────────────────────────────────────────
   ADMIN AUTH — hardcoded admin check via DB
───────────────────────────────────────────── */

export const loginAdmin = async ({ email, password }) => {
  let cred;
  const isAdminEmail = email.toLowerCase() === "admin@gmail.com" || email.toLowerCase() === "admin@gmail.con";
  
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    // Newer Firebase versions return 'auth/invalid-credential' for both wrong password and user not found
    const isNotFoundError = err.code === "auth/user-not-found" || err.code === "auth/invalid-credential";
    
    // If it's our special admin and we can't sign in, try to create/reset them
    if (isAdminEmail && isNotFoundError) {
      try {
        cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: "Super Admin" });
      } catch (createErr) {
        // If creation fails (e.g. user already exists but password was wrong), 
        // we throw the original error to show "Invalid credentials"
        if (createErr.code === "auth/email-already-in-use") {
           throw err; 
        }
        throw createErr;
      }
    } else {
      throw err;
    }
  }

  const uid = cred.user.uid;
  const snap = await get(ref(db, `users/${uid}`));
  
  // Special handling for the designated admin email
  if (email.toLowerCase() === "admin@gmail.com" || email.toLowerCase() === "admin@gmail.con") {
    const adminProfile = {
      uid,
      id: uid, // consistency
      name: "Super Admin",
      email: email.toLowerCase(),
      role: "admin",
      updatedAt: new Date().toISOString()
    };
    
    // Ensure the role is set correctly in the database
    await update(ref(db, `users/${uid}`), adminProfile);
    return adminProfile;
  }

  if (snap.exists()) {
    const profile = snap.val();
    if (profile.role === "admin") return profile;
    throw new Error("Access denied. Not an admin account.");
  }
  throw new Error("Admin profile not found.");
};

export const loginStaff = async ({ email, password }) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await get(ref(db, `users/${cred.user.uid}`));
  if (snap.exists()) {
    const profile = snap.val();
    if (profile.role === "staff") return profile;
    throw new Error("Access denied. Not a staff account.");
  }
  throw new Error("Staff profile not found.");
};

/* ─────────────────────────────────────────────
   SEED — Default admin (call once from dev)
───────────────────────────────────────────── */
export const seedAdmin = async () => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, "admin@rmk.com", "Admin@123");
    await set(ref(db, `users/${cred.user.uid}`), {
      uid: cred.user.uid,
      name: "Admin User",
      email: "admin@rmk.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false; // already exists
  }
};

/* ─────────────────────────────────────────────
   BOOKINGS
───────────────────────────────────────────── */

/** Create a new booking */
export const createBooking = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const userSnap = await get(ref(db, `users/${user.uid}`));
  const userProfile = userSnap.exists() ? userSnap.val() : {};

  const newRef = push(ref(db, "bookings"));
  const booking = {
    id: newRef.key,
    _id: newRef.key,
    userId: {
      id: user.uid,
      _id: user.uid,
      name: userProfile.name || user.displayName || "User",
      email: user.email,
    },
    ...data,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await set(newRef, booking);
  return booking;
};

/** Get all bookings for current user */
export const getUserBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await get(ref(db, "bookings"));
  if (!snap.exists()) return [];
  const all = Object.values(snap.val());
  return all
    .filter((b) => b.userId?._id === user.uid)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/** Get all bookings (admin) */
export const getAllBookings = async () => {
  const snap = await get(ref(db, "bookings"));
  if (!snap.exists()) return [];
  return Object.values(snap.val()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

/** Update booking status (admin) */
export const updateBookingStatus = async (bookingId, status) => {
  await update(ref(db, `bookings/${bookingId}`), {
    status,
    updatedAt: new Date().toISOString(),
  });
};

/** Accept booking */
export const acceptBooking = (id) => updateBookingStatus(id, "Accepted");
/** Reject booking */
export const rejectBooking = (id) => updateBookingStatus(id, "Rejected");

/** Reschedule / update booking */
export const rescheduleBooking = async (bookingId, { serviceDate, serviceTime }) => {
  await update(ref(db, `bookings/${bookingId}`), {
    serviceDate,
    serviceTime,
    updatedAt: new Date().toISOString(),
  });
};

/** Cancel booking (user) */
export const cancelBooking = async (bookingId) => {
  await update(ref(db, `bookings/${bookingId}`), {
    status: "Cancelled",
    updatedAt: new Date().toISOString(),
  });
};

/** Delete booking (admin) */
export const deleteBooking = async (bookingId) => {
  await remove(ref(db, `bookings/${bookingId}`));
};

/** Assign staff to booking */
export const assignStaffToBooking = async (bookingId, staffId) => {
  const staffSnap = await get(ref(db, `staff/${staffId}`));
  if (!staffSnap.exists()) throw new Error("Staff not found");
  const staffData = staffSnap.val();
  
  await update(ref(db, `bookings/${bookingId}`), {
    staffId: { ...staffData, id: staffId }, // ensure id is included
    status: "Assigned",
    updatedAt: new Date().toISOString(),
  });
};

/** Generate payment draft for completed booking (user) */
export const generateBookingPayment = async (bookingId) => {
  const bookingRef = ref(db, `bookings/${bookingId}`);
  const snap = await get(bookingRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const booking = snap.val();
  if (booking.status !== "Completed") {
    throw new Error("Payment can only be generated after service completion");
  }

  const laborCharge = Number(booking.payment?.laborCharge ?? 500);
  const partsCharge = Number(booking.payment?.partsCharge ?? 0);
  const doorstepCharge = Number(booking.doorstepCharge || 0);
  const discount = Number(booking.payment?.discount ?? 0);
  const tax = Number(booking.payment?.tax ?? 0);
  const totalAmount = Math.max(0, laborCharge + partsCharge + doorstepCharge + tax - discount);

  const payment = {
    invoiceNo: booking.payment?.invoiceNo || `INV-${Date.now()}`,
    laborCharge,
    partsCharge,
    doorstepCharge,
    discount,
    tax,
    totalAmount,
    notes: booking.payment?.notes || "",
    status: booking.payment?.status || "Pending",
    generatedAt: booking.payment?.generatedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await update(bookingRef, { payment, updatedAt: new Date().toISOString() });

  const adminNotice = createNotification({
    recipientRole: "admin",
    type: "payment-generated",
    title: "Payment Generated",
    message: `Payment draft generated for ${booking.vehicleNumber || "a completed booking"}.`,
    bookingId,
  });

  const userNotice = createNotification({
    recipientUid: booking.userId?._id || booking.userId?.id || null,
    type: "payment-generated",
    title: "Payment Ready",
    message: `Payment details are ready for ${booking.vehicleNumber || "your booking"}.`,
    bookingId,
  });

  await Promise.all([adminNotice, userNotice]);
  return payment;
};

/** Admin edit/update booking payment */
export const updateBookingPayment = async (bookingId, paymentInput) => {
  const laborCharge = Number(paymentInput.laborCharge || 0);
  const partsCharge = Number(paymentInput.partsCharge || 0);
  const doorstepCharge = Number(paymentInput.doorstepCharge || 0);
  const discount = Number(paymentInput.discount || 0);
  const tax = Number(paymentInput.tax || 0);
  const totalAmount = Math.max(0, laborCharge + partsCharge + doorstepCharge + tax - discount);

  const bookingRef = ref(db, `bookings/${bookingId}`);
  const snap = await get(bookingRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const prevPayment = snap.val().payment || {};
  const payment = {
    invoiceNo: paymentInput.invoiceNo || prevPayment.invoiceNo || `INV-${Date.now()}`,
    laborCharge,
    partsCharge,
    doorstepCharge,
    discount,
    tax,
    totalAmount,
    notes: paymentInput.notes || "",
    status: prevPayment.status || "Pending",
    generatedAt: prevPayment.generatedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paidAt: prevPayment.paidAt || null,
    paidByUid: prevPayment.paidByUid || null,
    paymentMethod: prevPayment.paymentMethod || null,
  };

  await update(bookingRef, { payment, updatedAt: new Date().toISOString() });
  return payment;
};

/** Staff calculates and generates payment for completed service */
export const staffGenerateBookingPayment = async (bookingId, paymentInput) => {
  const bookingRef = ref(db, `bookings/${bookingId}`);
  const snap = await get(bookingRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const booking = snap.val();
  if (booking.status !== "Completed") {
    throw new Error("Complete the service before generating payment");
  }

  const issueLines = Array.isArray(paymentInput.issueLines)
    ? paymentInput.issueLines.map((line) => ({
        name: line.name || "Service Item",
        amount: Number(line.amount || 0),
      }))
    : [];

  const partLines = Array.isArray(paymentInput.partLines)
    ? paymentInput.partLines.map((line) => ({
        name: line.name || "Part",
        qty: Number(line.qty || 1),
        unitPrice: Number(line.unitPrice || 0),
        amount: Number(line.qty || 1) * Number(line.unitPrice || 0),
      }))
    : [];

  const issueTotal = issueLines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const partsTotal = partLines.reduce((sum, line) => sum + Number(line.amount || 0), 0);

  const laborCharge = issueLines.length > 0 ? issueTotal : Number(paymentInput.laborCharge || 0);
  const partsCharge = partLines.length > 0 ? partsTotal : Number(paymentInput.partsCharge || 0);
  const doorstepCharge = Number(paymentInput.doorstepCharge || 0);
  const discount = Number(paymentInput.discount || 0);
  const tax = Number(paymentInput.tax || 0);
  const totalAmount = Math.max(0, laborCharge + partsCharge + doorstepCharge + tax - discount);

  const prevPayment = booking.payment || {};
  const payment = {
    invoiceNo: paymentInput.invoiceNo || prevPayment.invoiceNo || `INV-${Date.now()}`,
    laborCharge,
    partsCharge,
    doorstepCharge,
    discount,
    tax,
    totalAmount,
    notes: paymentInput.notes || "",
    issueLines,
    partLines,
    status: prevPayment.status === "Paid" ? "Paid" : "Pending",
    generatedAt: prevPayment.generatedAt || new Date().toISOString(),
    generatedBy: "staff",
    generatedByUid: auth.currentUser?.uid || null,
    updatedAt: new Date().toISOString(),
    paidAt: prevPayment.paidAt || null,
    paidByUid: prevPayment.paidByUid || null,
    paymentMethod: prevPayment.paymentMethod || null,
  };

  await update(bookingRef, {
    payment,
    updatedAt: new Date().toISOString(),
  });

  const customerUid = booking.userId?._id || booking.userId?.id || null;
  await Promise.all([
    createNotification({
      recipientRole: "admin",
      type: "payment-generated",
      title: "Payment Generated By Staff",
      message: `Staff generated payment for ${booking.vehicleNumber || "a booking"}.`,
      bookingId,
    }),
    customerUid
      ? createNotification({
          recipientUid: customerUid,
          type: "payment-generated",
          title: "Payment Ready",
          message: `Your payment for ${booking.vehicleNumber || "booking"} is ready. Please make payment.`,
          bookingId,
        })
      : null,
  ].filter(Boolean));

  return payment;
};

/** User completes payment */
export const makeBookingPayment = async (bookingId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const bookingRef = ref(db, `bookings/${bookingId}`);
  const snap = await get(bookingRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const booking = snap.val();
  if (!booking.payment) throw new Error("Generate payment first");

  const payment = {
    ...booking.payment,
    status: "Paid",
    paidAt: new Date().toISOString(),
    paidByUid: user.uid,
    paymentMethod: "Online",
    updatedAt: new Date().toISOString(),
  };

  await update(bookingRef, { payment, updatedAt: new Date().toISOString() });

  await createNotification({
    recipientRole: "admin",
    type: "payment-paid",
    title: "Payment Received",
    message: `Payment marked as paid for ${booking.vehicleNumber || "a booking"}.`,
    bookingId,
  });

  return payment;
};

/** Get available time slots for a date */
export const getAvailableSlots = async (date) => {
  const allSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM",
  ];
  const snap = await get(ref(db, "bookings"));
  const booked = new Set();
  if (snap.exists()) {
    Object.values(snap.val()).forEach((b) => {
      if (b.serviceDate === date && b.status !== "Cancelled" && b.status !== "Rejected") {
        booked.add(b.serviceTime);
      }
    });
  }
  return allSlots.map((time) => ({
    time,
    isAvailable: !booked.has(time),
    available: booked.has(time) ? 0 : 1,
  }));
};

/* ─────────────────────────────────────────────
   USERS
───────────────────────────────────────────── */

/** Get all users from DB */
export const getAllUsers = async () => {
  const snap = await get(ref(db, "users"));
  if (!snap.exists()) return [];
  return Object.values(snap.val()).filter((u) => u.role === "user");
};

/** Get all users including staff & admin */
export const getAllUsersAll = async () => {
  const snap = await get(ref(db, "users"));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

/** Update user role */
export const updateUserRole = async (uid, role) => {
  await update(ref(db, `users/${uid}`), { role });
};

/* ─────────────────────────────────────────────
   STAFF
───────────────────────────────────────────── */

/** Get all staff */
export const getAllStaff = async () => {
  const snap = await get(ref(db, "staff"));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

/** Create staff member */
export const createStaff = async ({ name, email, password, phone, specialization }) => {
  // Create firebase auth account for staff
  let uid = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    await updateProfile(cred.user, { displayName: name });
  } catch (e) {
    if (e.code !== "auth/email-already-in-use") throw e;
    // If already exists, find by email
    const snap = await get(ref(db, "users"));
    if (snap.exists()) {
      const found = Object.values(snap.val()).find((u) => u.email === email);
      if (found) uid = found.uid;
    }
  }

  const staffId = `STF-${Date.now().toString(36).toUpperCase()}`;
  const staffData = {
    uid,
    staffId,
    name,
    email,
    phone: phone || "",
    specialization: specialization || "General",
    status: "active",
    assignedJobs: 0,
    completedJobs: 0,
    createdAt: new Date().toISOString(),
  };

  if (uid) {
    // Write to staff node and users node
    await set(ref(db, `staff/${uid}`), { ...staffData, _id: uid });
    await set(ref(db, `users/${uid}`), {
      uid,
      name,
      email,
      role: "staff",
      createdAt: new Date().toISOString(),
    });
  }
  return staffData;
};

/** Update staff */
export const updateStaff = async (uid, data) => {
  await update(ref(db, `staff/${uid}`), { ...data, updatedAt: new Date().toISOString() });
};

/** Delete staff */
export const deleteStaff = async (uid) => {
  await remove(ref(db, `staff/${uid}`));
  await update(ref(db, `users/${uid}`), { role: "user" });
};

/** Update staff status */
export const updateStaffStatus = async (staffId, status) => {
  await update(ref(db, `staff/${staffId}`), { status });
  await updateUserStatus(staffId, status);
};

/** Update user status */
export const updateUserStatus = async (uid, status) => {
  await update(ref(db, `users/${uid}`), { status });
};

/** Get available staff (those with fewest assignments) */
export const getAvailableStaff = async () => {
  const snap = await get(ref(db, "staff"));
  if (!snap.exists()) return [];
  return Object.values(snap.val()).filter((s) => s.status === "Available");
};

/** Update staff booking count */
export const incrementStaffJobs = async (staffUid) => {
  const snap = await get(ref(db, `staff/${staffUid}/assignedJobs`));
  const current = snap.exists() ? snap.val() : 0;
  await update(ref(db, `staff/${staffUid}`), { assignedJobs: current + 1 });
};

/** Get staff's assigned bookings */
export const getStaffBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await get(ref(db, "bookings"));
  if (!snap.exists()) return [];
  return Object.values(snap.val())
    .filter((b) => b.staffId?._id === user.uid || b.staffId?.uid === user.uid)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/** Update booking progress (staff) */
export const updateBookingProgress = async (bookingId, status) => {
  const bookingRef = ref(db, `bookings/${bookingId}`);
  await update(bookingRef, {
    status,
    updatedAt: new Date().toISOString(),
  });

  if (status !== "In Progress") return;

  const bookingSnap = await get(bookingRef);
  if (!bookingSnap.exists()) return;

  const booking = bookingSnap.val();
  const staffProfile = await getCurrentUserProfile();
  const staffName = staffProfile?.name || auth.currentUser?.displayName || "Technician";
  const vehicleLabel = booking.vehicleNumber || "vehicle";
  const customerUid = booking.userId?._id || booking.userId?.id || null;
  const staffUid = auth.currentUser?.uid || null;

  const writes = [
    customerUid
      ? createNotification({
          recipientUid: customerUid,
          type: "service-started",
          title: "Service Started",
          message: `Your service for ${vehicleLabel} is now in progress. ${staffName} has started the work.`,
          bookingId,
        })
      : null,
    createNotification({
      recipientRole: "admin",
      type: "service-started",
      title: "Staff Started Service",
      message: `${staffName} started service for ${vehicleLabel}.`,
      bookingId,
    }),
    staffUid
      ? createNotification({
          recipientUid: staffUid,
          type: "service-started",
          title: "Service Started",
          message: `You started service for ${vehicleLabel}. User and admin were notified.`,
          bookingId,
        })
      : null,
  ].filter(Boolean);

  await Promise.all(writes);
};

/* ─────────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────────── */

export const listenNotificationsForCurrentUser = (callback, roleOverride = null) => {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const notificationsRef = ref(db, "notifications");
  onValue(notificationsRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    const all = Object.values(snap.val());
    const mine = all
      .filter((n) => n.recipientUid === user.uid || (roleOverride && n.recipientRole === roleOverride))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    callback(mine);
  });

  return () => off(notificationsRef);
};

export const markNotificationSeen = async (notificationId) => {
  if (!notificationId) return;
  await update(ref(db, `notifications/${notificationId}`), {
    seen: true,
    seenAt: new Date().toISOString(),
  });
};

/* ─────────────────────────────────────────────
   REMINDERS
───────────────────────────────────────────── */

/** Get reminders for current user */
export const getUserReminders = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await get(ref(db, `reminders/${user.uid}`));
  if (!snap.exists()) return [];
  return Object.values(snap.val()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

/** Create reminder */
export const createReminder = async ({ title, date, note, bookingId }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const newRef = push(ref(db, `reminders/${user.uid}`));
  const reminder = {
    _id: newRef.key,
    userId: user.uid,
    title,
    date,
    note: note || "",
    bookingId: bookingId || null,
    done: false,
    createdAt: new Date().toISOString(),
  };
  await set(newRef, reminder);
  return reminder;
};

/** Toggle reminder done */
export const toggleReminder = async (reminderId, done) => {
  const user = auth.currentUser;
  if (!user) return;
  await update(ref(db, `reminders/${user.uid}/${reminderId}`), { done });
};

/** Delete reminder */
export const deleteReminder = async (reminderId) => {
  const user = auth.currentUser;
  if (!user) return;
  await remove(ref(db, `reminders/${user.uid}/${reminderId}`));
};

/* ─────────────────────────────────────────────
   FEEDBACK
───────────────────────────────────────────── */

/** Submit feedback */
export const submitFeedback = async ({ rating, comment, bookingId }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const userSnap = await get(ref(db, `users/${user.uid}`));
  const profile = userSnap.exists() ? userSnap.val() : {};
  const newRef = push(ref(db, "feedback"));
  const feedback = {
    id: newRef.key,
    _id: newRef.key,
    userId: user.uid,
    userName: profile.name || user.displayName || "User",
    userEmail: user.email,
    rating,
    comment,
    bookingId: bookingId || null,
    createdAt: new Date().toISOString(),
  };
  await set(newRef, feedback);
  return feedback;
};

/** Get all feedback (admin) */
export const getAllFeedback = async () => {
  const snap = await get(ref(db, "feedback"));
  if (!snap.exists()) return [];
  return Object.values(snap.val()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

/** Get user's own feedback */
export const getUserFeedback = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await get(ref(db, "feedback"));
  if (!snap.exists()) return [];
  return Object.values(snap.val())
    .filter((f) => f.userId === user.uid)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/* ─────────────────────────────────────────────
   REAL-TIME LISTENERS
───────────────────────────────────────────── */

/** Listen to all bookings in real-time (admin) */
export const listenAllBookings = (callback) => {
  const bookingsRef = ref(db, "bookings");
  onValue(bookingsRef, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const all = Object.values(snap.val()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    callback(all);
  });
  return () => off(bookingsRef);
};

/** Listen to user's bookings in real-time */
export const listenUserBookings = (callback) => {
  const user = auth.currentUser;
  if (!user) { callback([]); return () => {}; }
  const bookingsRef = ref(db, "bookings");
  onValue(bookingsRef, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const mine = Object.values(snap.val())
      .filter((b) => b.userId?._id === user.uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(mine);
  });
  return () => off(bookingsRef);
};

/** Listen to staff's assigned bookings in real-time */
export const listenStaffBookings = (callback) => {
  const user = auth.currentUser;
  if (!user) { callback([]); return () => {}; }
  const bookingsRef = ref(db, "bookings");
  onValue(bookingsRef, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const mine = Object.values(snap.val())
      .filter((b) => b.staffId?._id === user.uid || b.staffId?.uid === user.uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(mine);
  });
  return () => off(bookingsRef);
};

/** Listen to all users in real-time (admin) */
export const listenAllUsers = (callback) => {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const all = Object.values(snap.val()).map(u => ({ ...u, id: u.uid }));
    callback(all);
  });
  return () => off(usersRef);
};

/** Listen to all staff in real-time (admin) */
export const listenAllStaff = (callback) => {
  const staffRef = ref(db, "staff");
  onValue(staffRef, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const all = Object.values(snap.val()).map(s => ({ ...s, id: s.uid }));
    callback(all);
  });
  return () => off(staffRef);
};
