# 🎯 ADMIN QUICK REFERENCE CARD

## 🔐 LOGIN CREDENTIALS
```
Email:    admin@rmk.com
Password: admin123
```

---

## 🚀 QUICK START
1. Open browser: http://localhost:3000
2. Click "Login"
3. Enter admin credentials
4. Access Admin Dashboard

---

## 📊 ADMIN DASHBOARD FEATURES

### ✅ Accept Booking
- Click green "Accept" button
- Status changes to "Accepted"
- Customer gets confirmed slot

### ❌ Reject Booking
- Click red "Reject" button
- Status changes to "Rejected"
- Frees up slot capacity

### 👀 View All Bookings
- Automatically loaded on dashboard
- Shows all customer bookings
- Displays:
  * Vehicle number
  * Customer name
  * Service date & time
  * Issue categories
  * Current status

---

## 📋 BOOKING STATUSES

| Status | Color | Meaning |
|--------|-------|---------|
| 🟡 **Pending** | Yellow | Awaiting admin approval |
| 🟢 **Accepted** | Green | Confirmed booking |
| 🔴 **Rejected** | Red | Declined booking |

---

## ⏰ TIME SLOTS
- **Operating Hours:** 9:00 AM - 6:00 PM
- **Slot Duration:** 1 hour
- **Max Bookings per Slot:** 3 customers
- **Total Daily Slots:** 9 slots

### Available Time Slots:
- 09:00 AM - 10:00 AM
- 10:00 AM - 11:00 AM
- 11:00 AM - 12:00 PM
- 12:00 PM - 01:00 PM
- 01:00 PM - 02:00 PM
- 02:00 PM - 03:00 PM
- 03:00 PM - 04:00 PM
- 04:00 PM - 05:00 PM
- 05:00 PM - 06:00 PM

---

## 🔧 ADMIN PROCESSES

### Process 1: Daily Booking Management
```
1. Login to admin dashboard
2. Review pending bookings
3. Check vehicle & issue details
4. Accept valid bookings
5. Reject invalid/duplicate bookings
```

### Process 2: Slot Capacity Management
```
- System auto-prevents overbooking
- Each slot: Max 3 bookings
- Rejected bookings free slots
- Real-time updates
```

### Process 3: Customer Service
```
1. View customer details
2. Review issue categories:
   - Engine Problem
   - Brake Issue
   - Tire Replacement
   - Oil Change
   - Battery Issue
   - Other
3. Plan service resources
4. Confirm or decline booking
```

---

## 🎛️ ADMIN APIs

### View All Bookings
```
GET /api/admin/bookings
```

### Accept Booking
```
PUT /api/admin/booking/accept/:id
```

### Reject Booking
```
PUT /api/admin/booking/reject/:id
```

---

## 🛠️ SYSTEM COMMANDS

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend
npm start
```

### Create/Reset Admin User
```bash
cd backend
node createAdmin.js
```

---

## ⚠️ IMPORTANT NOTES
- ✅ Both frontend & backend must be running
- ✅ MongoDB must be connected
- ✅ Admin role required for dashboard access
- ✅ Change default password after first login
- ✅ Regular users cannot access admin features

---

## 🔍 TROUBLESHOOTING

### Can't Login?
1. Verify backend is running (port 5000)
2. Check MongoDB connection
3. Confirm admin user exists
4. Use correct credentials

### Can't See Bookings?
1. Check browser console (F12)
2. Verify you're logged in as admin
3. Refresh the dashboard
4. Check backend terminal for errors

### Actions Not Working?
1. Check network tab in DevTools
2. Verify session is active
3. Refresh and try again
4. Check backend logs

---

## 📁 KEY FILES

```
backend/
├── routes/adminRoutes.js      # Admin endpoints
├── middleware/adminmiddleware.js  # Admin verification
└── createAdmin.js             # Admin creation script

frontend/
└── src/pages/AdminDashboard.js   # Admin UI
```

---

## 📞 QUICK HELP

**Full Documentation:** See `ADMIN_GUIDE.md`  
**Backend Running:** http://localhost:5000  
**Frontend Running:** http://localhost:3000  
**Admin Dashboard:** http://localhost:3000 (login as admin)

---

**Last Updated:** February 7, 2026  
**Version:** 1.0
