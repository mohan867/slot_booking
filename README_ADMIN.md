# 📋 ADMIN DOCUMENTATION INDEX

Welcome to the RMK Slot Booking System Admin Portal!

This folder contains all the documentation you need to manage the system as an administrator.

---

## 📚 Documentation Files

### 1. **ADMIN_QUICK_REFERENCE.md** 
**👉 START HERE - Quick Reference Card**
- Admin login credentials
- Essential features overview
- Common tasks
- Troubleshooting
- Best for: Daily operations

### 2. **ADMIN_GUIDE.md** 
**📖 Complete Documentation**
- Detailed admin login process
- All admin features explained
- Step-by-step processes
- API documentation
- Database schema
- Security details
- File structure
- Best for: In-depth understanding

### 3. **ADMIN_WORKFLOW.md** 
**🔄 Visual Process Flows**
- System architecture diagrams
- Workflow visualizations
- API flow charts
- Security flow
- Capacity management
- Best for: Understanding data flow

### 4. **createAdmin.js** (Backend Script)
**🔧 Admin User Creation Tool**
- Creates admin user in database
- Sets default credentials
- Displays all users
- Run: `cd backend && node createAdmin.js`

---

## 🚀 Quick Start Guide

### Step 1: Verify System is Running
```bash
# Backend should be running
cd c:\slot booking\backend
npm start

# Frontend should be running  
cd c:\slot booking\frontend
npm start
```

### Step 2: Create Admin User (First Time Only)
```bash
cd c:\slot booking\backend
node createAdmin.js
```

### Step 3: Login as Admin
1. Open browser: http://localhost:3000
2. Use credentials:
   - Email: `admin@rmk.com`
   - Password: `admin123`

### Step 4: Access Admin Dashboard
- After login, you'll see the Admin Dashboard
- View all bookings
- Accept or reject bookings
- Manage slot capacity

---

## 🔐 Admin Credentials

```
Email:    admin@rmk.com
Password: admin123
```

**⚠️ SECURITY:** Change this password after first login!

---

## 📊 Admin Features Overview

### 1. View All Bookings
- See all customer bookings in one place
- Filter by status (Pending, Accepted, Rejected)
- View customer details
- Check schedule and issues

### 2. Accept Bookings
- Approve valid customer requests
- Confirm service slots
- Update status to "Accepted"
- Customer gets notification

### 3. Reject Bookings
- Decline invalid requests
- Free up slot capacity
- Update status to "Rejected"
- Customer gets notification

### 4. Manage Slot Capacity
- Automatic capacity management
- 3 bookings max per time slot
- Real-time availability updates
- Prevent overbooking

---

## 🎯 Common Admin Tasks

### Daily Operations
1. **Morning Review**
   - Login to admin dashboard
   - Check pending bookings for today
   - Accept valid bookings
   - Reject invalid ones

2. **Capacity Management**
   - Monitor slot availability
   - Ensure no overbooking
   - Balance workload across slots

3. **Customer Service**
   - Review issue descriptions
   - Plan service resources
   - Ensure quality service delivery

---

## 📞 System Information

- **Frontend URL:** http://localhost:3000
- **Backend URL:** http://localhost:5000
- **Database:** MongoDB Atlas (Cloud)
- **Backend Port:** 5000
- **Frontend Port:** 3000

---

## 🛠️ Technical Details

### API Endpoints

#### Admin Routes (Requires Admin Role)
- `GET /api/admin/bookings` - View all bookings
- `PUT /api/admin/booking/accept/:id` - Accept booking
- `PUT /api/admin/booking/reject/:id` - Reject booking

#### Auth Routes
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/logout` - Logout

### Middleware
- `isAuthenticated` - Verifies user is logged in
- `isAdmin` - Verifies user has admin role

### Database Models
- **User Model**: name, email, password, role
- **Booking Model**: userId, vehicleNumber, issue, issueCategories, serviceDate, serviceTime, status

---

## 🔍 Troubleshooting

### Problem: Can't login as admin
- **Solution:** Run `node createAdmin.js` in backend folder
- Verify database connection
- Check credentials are correct

### Problem: Can't see bookings
- **Solution:** Verify you're logged in as admin
- Check backend is running
- Look at browser console for errors

### Problem: Accept/Reject not working
- **Solution:** Check network tab in browser
- Verify admin role in session
- Restart backend if needed

---

## 📖 How to Use This Documentation

1. **First Time Setup:**
   - Read ADMIN_QUICK_REFERENCE.md
   - Run createAdmin.js script
   - Login and test features

2. **Daily Use:**
   - Keep ADMIN_QUICK_REFERENCE.md handy
   - Use for quick credential lookup
   - Reference for common tasks

3. **Learning System:**
   - Read ADMIN_GUIDE.md thoroughly
   - Study ADMIN_WORKFLOW.md diagrams
   - Understand data flow

4. **Troubleshooting:**
   - Check troubleshooting sections
   - Review error messages
   - Verify system status

---

## 🎓 Training Checklist

- [ ] Read ADMIN_QUICK_REFERENCE.md
- [ ] Create admin user with script
- [ ] Login successfully
- [ ] View all bookings
- [ ] Practice accepting a booking
- [ ] Practice rejecting a booking
- [ ] Understand slot capacity
- [ ] Review ADMIN_GUIDE.md
- [ ] Study ADMIN_WORKFLOW.md
- [ ] Test troubleshooting steps

---

## 📝 Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| ADMIN_QUICK_REFERENCE.md | 1.0 | Feb 7, 2026 |
| ADMIN_GUIDE.md | 1.0 | Feb 7, 2026 |
| ADMIN_WORKFLOW.md | 1.0 | Feb 7, 2026 |
| createAdmin.js | 1.0 | Feb 7, 2026 |

---

## 🆘 Support

For issues or questions:
1. Review documentation files
2. Check troubleshooting sections
3. Verify system is running properly
4. Review backend logs for errors

---

## 🎯 Next Steps

1. ✅ Create admin user
2. ✅ Login to admin dashboard
3. ✅ Familiarize with interface
4. ✅ Test accept/reject functions
5. ✅ Review daily workflow
6. ✅ Change default password
7. ✅ Start managing bookings!

---

**System Status:** ✅ Ready for Use  
**Admin Account:** ✅ Created  
**Documentation:** ✅ Complete  

**You're all set to start managing the slot booking system!**

---

Last Updated: February 7, 2026  
Maintained by: RMK Development Team
