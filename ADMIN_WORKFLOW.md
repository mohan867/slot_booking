# 🔄 ADMIN WORKFLOW DIAGRAM

## 📊 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SLOT BOOKING SYSTEM                          │
│                     (Admin Process Overview)                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        STEP 1: ADMIN LOGIN                           │
└─────────────────────────────────────────────────────────────────────┘

    Customer Side                           Admin Side
    ┌─────────────┐                        ┌─────────────┐
    │   User      │                        │   Admin     │
    │  Register   │                        │   Login     │
    │  & Login    │                        │             │
    └──────┬──────┘                        └──────┬──────┘
           │                                      │
           │                                      ├─→ Email: admin@rmk.com
           │                                      ├─→ Password: admin123
           │                                      │
           ▼                                      ▼
    ┌─────────────┐                        ┌─────────────┐
    │   User      │                        │   Admin     │
    │ Dashboard   │                        │  Dashboard  │
    └─────────────┘                        └─────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     STEP 2: CUSTOMER BOOKING                         │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │ Customer Actions     │
    └──────────────────────┘
            │
            ├─→ 1. Select Service Date
            │
            ├─→ 2. Check Available Slots
            │       └─→ View capacity (3 max per slot)
            │
            ├─→ 3. Choose Time Slot
            │       └─→ 09:00 AM - 06:00 PM
            │
            ├─→ 4. Enter Vehicle Number
            │       └─→ Min 5 characters
            │
            ├─→ 5. Select Issue Categories
            │       ├─→ Engine Problem
            │       ├─→ Brake Issue
            │       ├─→ Tire Replacement
            │       ├─→ Oil Change
            │       ├─→ Battery Issue
            │       └─→ Other
            │
            ├─→ 6. Write Issue Description (optional)
            │
            └─→ 7. Submit Booking
                    │
                    ▼
            ┌──────────────────┐
            │ Status: PENDING  │◄────── Stored in Database
            └──────────────────┘
                    │
                    │ Notification sent to Admin Dashboard
                    │
                    ▼


┌─────────────────────────────────────────────────────────────────────┐
│                  STEP 3: ADMIN REVIEW & ACTION                       │
└─────────────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────────────┐
    │         Admin Dashboard Auto-Loads             │
    │              All Bookings                      │
    └────────────────────────────────────────────────┘
                        │
                        ▼
    ┌────────────────────────────────────────────────┐
    │        Admin Reviews Booking Details           │
    ├────────────────────────────────────────────────┤
    │  • Customer Name                               │
    │  • Vehicle Number                              │
    │  • Service Date & Time                         │
    │  • Issue Categories                            │
    │  • Issue Description                           │
    │  • Current Status                              │
    └────────────────────────────────────────────────┘
                        │
                        ▼
                   ┌────────┐
                   │Decision│
                   └───┬────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ▼                              ▼
┌───────────────┐              ┌───────────────┐
│ ACCEPT BOOKING│              │ REJECT BOOKING│
└───────┬───────┘              └───────┬───────┘
        │                              │
        ├─→ Click Accept               ├─→ Click Reject
        ├─→ Status: ACCEPTED           ├─→ Status: REJECTED
        ├─→ Slot Reserved              ├─→ Slot Freed
        └─→ Customer Notified          └─→ Customer Notified


┌─────────────────────────────────────────────────────────────────────┐
│                     STEP 4: STATUS UPDATES                           │
└─────────────────────────────────────────────────────────────────────┘

    Database Updates                    UI Updates
    ┌─────────────┐                    ┌─────────────┐
    │   Booking   │                    │   Admin     │
    │   Status    │────────────────────│  Dashboard  │
    │   Changed   │   Real-time        │   Refresh   │
    └─────────────┘                    └─────────────┘
           │                                   │
           │                                   │
           ▼                                   ▼
    ┌─────────────┐                    ┌─────────────┐
    │   Customer  │◄───────────────────│   Status    │
    │  Dashboard  │   Customer sees    │   Colors    │
    │   Updates   │   new status       │             │
    └─────────────┘                    └─────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                   STATUS COLOR INDICATORS                            │
└─────────────────────────────────────────────────────────────────────┘

    🟡 PENDING
    ┌──────────────────────────────────────────┐
    │ • Yellow Background                      │
    │ • Awaiting Admin Action                  │
    │ • Counts Toward Slot Capacity            │
    │ • Customer Can Edit/Cancel               │
    └──────────────────────────────────────────┘

    🟢 ACCEPTED
    ┌──────────────────────────────────────────┐
    │ • Green Background                       │
    │ • Booking Confirmed                      │
    │ • Slot Reserved                          │
    │ • Customer Cannot Edit                   │
    └──────────────────────────────────────────┘

    🔴 REJECTED
    ┌──────────────────────────────────────────┐
    │ • Red Background                         │
    │ • Booking Declined                       │
    │ • Slot Freed                             │
    │ • Does Not Count Toward Capacity         │
    └──────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     API FLOW DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────┘

CUSTOMER CREATES BOOKING:
    Frontend                    Backend                    Database
    ┌──────┐                  ┌────────┐                  ┌────────┐
    │ POST │───────────────→  │ Verify │───────────────→  │ Insert │
    │/create│  Booking Data   │ Slot   │  Save Booking   │Booking │
    └──────┘                  │Availa- │                  └────────┘
                              │bility  │
                              └────────┘
                                  │
                                  └──→ Check: Count < 3?
                                       ✓ Yes → Save
                                       ✗ No  → Error


ADMIN VIEWS BOOKINGS:
    Frontend                    Backend                    Database
    ┌──────┐                  ┌────────┐                  ┌────────┐
    │  GET │───────────────→  │ Check  │───────────────→  │ Fetch  │
    │/admin│ Request          │ Admin  │  Query All      │  All   │
    │/book │                  │ Role   │                  │Bookings│
    │ings  │                  └────────┘                  └────────┘
    └──────┘                       │                          │
       ▲                           │                          │
       │                           ├─→ isAuthenticated?       │
       │                           ├─→ isAdmin?               │
       │                           └─→ Return Bookings ◄──────┘
       │
       └──────────────── Display in Table


ADMIN ACCEPTS/REJECTS:
    Frontend                    Backend                    Database
    ┌──────┐                  ┌────────┐                  ┌────────┐
    │  PUT │───────────────→  │ Check  │───────────────→  │ Update │
    │/admin│  Booking ID     │ Admin  │  Update Status  │ Status │
    │/book │  + Action       │ Role   │                  │ Field  │
    │ing/  │                  └────────┘                  └────────┘
    │accept│                       │
    │or    │                       │
    │reject│                       ├─→ Find Booking
    └──────┘                       ├─→ Validate Exists
       ▲                           ├─→ Update Status
       │                           └─→ Save & Return
       │
       └──────────────── Update UI Real-time


┌─────────────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE SECURITY FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

    Request
       │
       ▼
┌─────────────────┐
│ isAuthenticated │
│   Middleware    │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Session │
    │ Exists? │
    └────┬────┘
         │
    ┌────┴─────┐
    │   Yes    │   No ──→ 401 Unauthorized
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│    isAdmin      │
│   Middleware    │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Role   │
    │  Admin? │
    └────┬────┘
         │
    ┌────┴─────┐
    │   Yes    │   No ──→ 403 Forbidden
    └────┬─────┘
         │
         ▼
  ┌────────────┐
  │   Allow    │
  │  Access    │
  └────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                   SLOT CAPACITY MANAGEMENT                           │
└─────────────────────────────────────────────────────────────────────┘

Time Slot: 09:00 AM - 10:00 AM

┌───────────────────────────────────────┐
│         Capacity: 3 / 3               │
├───────────────────────────────────────┤
│ Booking 1: [ACCEPTED] ✓               │
│ Booking 2: [PENDING]  ⏳              │
│ Booking 3: [ACCEPTED] ✓               │
├───────────────────────────────────────┤
│ New Booking? ❌ SLOT FULL             │
└───────────────────────────────────────┘

After Admin Rejects Booking 2:

┌───────────────────────────────────────┐
│         Capacity: 2 / 3               │
├───────────────────────────────────────┤
│ Booking 1: [ACCEPTED] ✓               │
│ Booking 2: [REJECTED] ✗ (doesn't count)│
│ Booking 3: [ACCEPTED] ✓               │
├───────────────────────────────────────┤
│ New Booking? ✅ 1 SLOT AVAILABLE     │
└───────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     SYSTEM ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                          │
│                      http://localhost:3000                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐    │
│  │   Login     │  │  User Dashboard  │  │ Admin Dashboard │    │
│  │    Page     │  │                  │  │                 │    │
│  └──────┬──────┘  └────────┬─────────┘  └────────┬────────┘    │
│         │                  │                      │              │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
          │    ┌─────────────┴──────────────────────┘
          │    │
          ▼    ▼
    ┌────────────────┐
    │  Axios (API)   │
    │  /api/auth     │
    │  /api/booking  │
    │  /api/admin    │
    └────────┬───────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                         │
│                      http://localhost:5000                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Auth Routes   │  │ Booking Routes │  │  Admin Routes    │  │
│  │  /api/auth     │  │ /api/booking   │  │  /api/admin      │  │
│  └───────┬────────┘  └───────┬────────┘  └─────────┬────────┘  │
│          │                   │                       │           │
│          └───────────────────┴───────────────────────┘           │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    ▼                   ▼                         │
│          ┌──────────────────┐  ┌──────────────┐                │
│          │  Middleware      │  │   Models     │                │
│          │  • Auth          │  │   • User     │                │
│          │  • Admin         │  │   • Booking  │                │
│          └──────────────────┘  └──────────────┘                │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   MongoDB Database    │
                    │   (Cloud - Atlas)     │
                    ├───────────────────────┤
                    │  Collections:         │
                    │  • users              │
                    │  • bookings           │
                    └───────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                  END-TO-END PROCESS SUMMARY                          │
└─────────────────────────────────────────────────────────────────────┘

1. INITIALIZATION
   └─→ Admin account created (admin@rmk.com / admin123)

2. CUSTOMER JOURNEY
   ├─→ Register/Login
   ├─→ Select date & time
   ├─→ Enter vehicle & issue details
   ├─→ Submit booking (Status: PENDING)
   └─→ Wait for admin approval

3. ADMIN WORKFLOW
   ├─→ Login to Admin Dashboard
   ├─→ View all pending bookings
   ├─→ Review details (vehicle, issues, schedule)
   ├─→ Accept ✓ or Reject ✗
   └─→ Status updated in real-time

4. RESULT
   ├─→ Customer sees updated status
   ├─→ Accepted: Service confirmed
   ├─→ Rejected: Slot freed for others
   └─→ System maintains capacity (3/slot)

═════════════════════════════════════════════════════════════════════

                          🎯 SYSTEM READY
                    Admin: admin@rmk.com
                    Password: admin123

═════════════════════════════════════════════════════════════════════
