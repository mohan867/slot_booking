# 🔐 Admin Login & System Guide

## Admin Login Credentials

### Default Admin Account
```
Email: admin@rmk.com
Password: admin123
```

**⚠️ IMPORTANT:** Change this password immediately after first login for security purposes.

---

## 📋 Complete Admin Process Guide

### 1️⃣ **Admin Authentication**

#### Login Process
1. Navigate to the login page
2. Enter admin credentials:
   - Email: `admin@rmk.com`
   - Password: `admin123`
3. The system checks if user role is "admin"
4. Upon successful login, redirected to Admin Dashboard

#### How It Works (Backend)
- Route: `POST /api/auth/login`
- File: `backend/routes/authRoutes.js`
- Validates credentials using bcrypt
- Creates session with user role
- Returns user object with role information

---

### 2️⃣ **Admin Dashboard Features**

The Admin Dashboard (`frontend/src/pages/AdminDashboard.js`) provides comprehensive booking management.

#### **Feature A: View All Bookings**

**Process:**
1. On dashboard load, automatically fetches all bookings
2. Displays in a table format with:
   - Vehicle Number
   - Customer Name
   - Service Date & Time
   - Issue Categories
   - Issue Description
   - Current Status
   - Action Buttons

**Backend:**
- Route: `GET /api/admin/bookings`
- File: `backend/routes/adminRoutes.js`
- Middleware: `isAuthenticated`, `isAdmin`
- Returns all bookings sorted by creation date (newest first)
- Populates user information (name, email)

**Code Flow:**
```javascript
// Frontend Request
const res = await API.get("/admin/bookings");

// Backend Processing
1. Check if user is authenticated ✓
2. Check if user role is "admin" ✓
3. Fetch all bookings from database
4. Populate user details
5. Sort by createdAt descending
6. Return JSON response
```

---

#### **Feature B: Accept Booking**

**Process:**
1. Admin clicks "Accept" button on a pending booking
2. Status updates to "Accepted"
3. UI updates in real-time without page reload

**Backend:**
- Route: `PUT /api/admin/booking/accept/:id`
- File: `backend/routes/adminRoutes.js`
- Middleware: `isAuthenticated`, `isAdmin`

**Code Flow:**
```javascript
// Frontend Request
await API.put(`/admin/booking/accept/${bookingId}`);

// Backend Processing
1. Check authentication & admin role ✓
2. Find booking by ID
3. Validate booking exists
4. Update status to "Accepted"
5. Save to database
6. Return success message
```

**Use Cases:**
- Customer booked a valid slot
- All information is correct
- Admin confirms service availability
- Slot is within capacity

---

#### **Feature C: Reject Booking**

**Process:**
1. Admin clicks "Reject" button on a pending booking
2. Status updates to "Rejected"
3. Rejected bookings don't count toward slot capacity

**Backend:**
- Route: `PUT /api/admin/booking/reject/:id`
- File: `backend/routes/adminRoutes.js`
- Middleware: `isAuthenticated`, `isAdmin`

**Code Flow:**
```javascript
// Frontend Request
await API.put(`/admin/booking/reject/${bookingId}`);

// Backend Processing
1. Check authentication & admin role ✓
2. Find booking by ID
3. Validate booking exists
4. Update status to "Rejected"
5. Save to database
6. Return success message
```

**Use Cases:**
- Invalid vehicle number
- Duplicate booking
- Service not available
- Customer requested cancellation

---

#### **Feature D: Real-time Status Display**

**Visual Status Indicators:**
- 🟡 **Pending**: Yellow background - Awaiting admin action
- 🟢 **Accepted**: Green background - Confirmed booking
- 🔴 **Rejected**: Red background - Declined booking

**Status Colors:**
```javascript
Pending  → bg-yellow-100 text-yellow-800
Accepted → bg-green-100 text-green-800
Rejected → bg-red-100 text-red-800
```

---

### 3️⃣ **Booking Management System**

#### **Time Slots Configuration**
- **Available Hours:** 9:00 AM - 6:00 PM
- **Slot Duration:** 1 hour each
- **Total Slots per Day:** 9 slots
- **Maximum Bookings per Slot:** 3 bookings

#### **Slot Capacity Logic**
```javascript
// File: backend/routes/bookingRoutes.js
const MAX_BOOKINGS_PER_SLOT = 3;

TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM"
]
```

**Key Rules:**
- Rejected bookings don't count toward capacity
- Each slot can have max 3 active bookings
- Capacity checked in real-time during booking
- Rescheduling also validates slot availability

---

### 4️⃣ **User Booking Process (What Admin Reviews)**

#### Customer Journey:
1. **Register/Login** → User creates account
2. **Select Date** → Choose service date
3. **Check Available Slots** → View slot availability
4. **Enter Details:**
   - Vehicle Number (minimum 5 characters)
   - Issue Description (optional)
   - Issue Categories (checkboxes):
     - Engine Problem
     - Brake Issue
     - Tire Replacement
     - Oil Change
     - Battery Issue
     - Other
5. **Book Slot** → Submit booking (Status: Pending)
6. **Wait for Admin** → Admin accepts/rejects
7. **View Status** → Check booking status in dashboard

#### What Admins See:
- All booking details submitted by user
- User's name and email
- Vehicle information
- Selected issues and categories
- Preferred date and time
- Current status

---

### 5️⃣ **Middleware & Security**

#### **Authentication Middleware**
**File:** `backend/middleware/authmiddleware.js`
```javascript
// Checks if user is logged in
- Validates session exists
- Verifies user session is active
- Protects all booking routes
```

#### **Admin Middleware**
**File:** `backend/middleware/adminmiddleware.js`
```javascript
// Checks if user has admin role
- Validates user.role === "admin"
- Prevents customer access to admin routes
- Used on all admin endpoints
```

**Protected Admin Routes:**
- `GET /api/admin/bookings` ✓
- `PUT /api/admin/booking/accept/:id` ✓
- `PUT /api/admin/booking/reject/:id` ✓

---

### 6️⃣ **Database Schema**

#### **User Model** (`backend/models/user.js`)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (default: "customer"),
  timestamps: true
}
```

#### **Booking Model** (`backend/models/booking.js`)
```javascript
{
  userId: ObjectId (ref: User),
  vehicleNumber: String (required),
  issue: String,
  issueCategories: [String],
  serviceDate: String (required),
  serviceTime: String (required),
  status: String (default: "Pending"),
  timestamps: true
}

Status Options: "Pending", "Accepted", "Rejected"
```

---

### 7️⃣ **Admin Dashboard UI Features**

#### **Header Section**
- Title: "RMK Admin Portal"
- Sign Out button (refreshes page/clears session)

#### **Statistics**
- Total Bookings count
- Real-time updates

#### **Booking Table**
- **Columns:**
  1. Vehicle Info (Number + Customer Name)
  2. Schedule (Date + Time)
  3. Issues (Categories + Description)
  4. Status (Color-coded badge)
  5. Actions (Accept/Reject buttons)

#### **Interactive Elements**
- Hover effects on table rows
- Button state management (disabled while loading)
- Color-coded status badges
- Responsive design

---

### 8️⃣ **API Endpoints Summary**

#### **Authentication Routes** (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | No |

#### **Booking Routes** (`/api/booking`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/available-slots?date=YYYY-MM-DD` | Get available time slots | Yes | No |
| POST | `/create` | Create new booking | Yes | No |
| GET | `/user` | Get user's bookings | Yes | No |
| PUT | `/update/:id` | Update/reschedule booking | Yes | No |
| DELETE | `/cancel/:id` | Cancel pending booking | Yes | No |

#### **Admin Routes** (`/api/admin`)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/bookings` | View all bookings | Yes | **Yes** |
| PUT | `/booking/accept/:id` | Accept booking | Yes | **Yes** |
| PUT | `/booking/reject/:id` | Reject booking | Yes | **Yes** |

---

### 9️⃣ **Common Admin Tasks**

#### **Task 1: Managing Daily Bookings**
1. Log in to admin dashboard
2. Review all pending bookings for the day
3. Check vehicle numbers and issue descriptions
4. Accept valid bookings
5. Reject invalid or duplicate bookings

#### **Task 2: Handling Slot Capacity**
- System automatically prevents overbooking
- Each slot shows capacity (3 max)
- Rejected bookings free up slots
- Real-time availability updates

#### **Task 3: Managing Customer Requests**
1. Review issue categories selected
2. Read detailed issue descriptions
3. Plan service resources accordingly
4. Accept if capacity available
5. Reject if slot full or invalid request

---

### 🔟 **How to Create Admin User**

There are two ways to create an admin user:

#### **Method 1: Database Direct (Recommended)**
Use the provided script to create admin account:

```bash
cd backend
node createAdmin.js
```

#### **Method 2: Manual Database Update**
1. Register normally as a user
2. Connect to MongoDB database
3. Find the user document
4. Update the `role` field from "customer" to "admin"

**MongoDB Command:**
```javascript
db.users.updateOne(
  { email: "admin@rmk.com" },
  { $set: { role: "admin" } }
)
```

---

### 1️⃣1️⃣ **Troubleshooting**

#### **Can't Login as Admin**
- ✓ Check if admin user exists in database
- ✓ Verify role is set to "admin" (not "customer")
- ✓ Ensure correct password
- ✓ Check backend is running

#### **Can't Access Admin Dashboard**
- ✓ Verify you're logged in as admin
- ✓ Check if admin middleware is working
- ✓ Verify session is active
- ✓ Check browser console for errors

#### **Bookings Not Showing**
- ✓ Check database connection
- ✓ Verify backend is running on port 5000
- ✓ Check Network tab in browser DevTools
- ✓ Verify API endpoint is correct

---

### 1️⃣2️⃣ **File Structure Reference**

```
slot booking/
├── backend/
│   ├── middleware/
│   │   ├── authmiddleware.js    # Session authentication
│   │   └── adminmiddleware.js   # Admin role verification
│   ├── models/
│   │   ├── user.js              # User schema
│   │   └── booking.js           # Booking schema
│   ├── routes/
│   │   ├── authRoutes.js        # Login/Register/Logout
│   │   ├── bookingRoutes.js     # Booking CRUD operations
│   │   └── adminRoutes.js       # Admin booking management
│   ├── server.js                # Express server setup
│   └── .env                     # Environment variables
└── frontend/
    └── src/
        ├── pages/
        │   ├── login.js             # Login page
        │   ├── UserDashboard.js     # Customer dashboard
        │   └── AdminDashboard.js    # Admin dashboard
        └── services/
            └── api.js               # Axios configuration
```

---

## 🎯 Quick Start Checklist for Admins

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Admin user created with role "admin"
- [ ] Login with admin credentials
- [ ] Access admin dashboard
- [ ] View all bookings
- [ ] Test accept/reject functionality

---

## 📞 Support

For any issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend terminal for API errors
4. Verify database connection

---

**Last Updated:** February 7, 2026  
**System Version:** 1.0  
**Maintained by:** RMK Development Team
