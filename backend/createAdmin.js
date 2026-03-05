const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
require("dotenv").config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@rmk.com" });

        if (existingAdmin) {
            console.log("⚠️  Admin user already exists!");
            console.log("📧 Email: admin@rmk.com");
            console.log("🔐 Password: admin123");

            // Update to ensure role is admin
            if (existingAdmin.role !== "admin") {
                existingAdmin.role = "admin";
                await existingAdmin.save();
                console.log("✅ Updated existing user to admin role");
            }
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin123", salt);

            const adminUser = new User({
                name: "Admin",
                email: "admin@rmk.com",
                password: hashedPassword,
                role: "admin"
            });

            await adminUser.save();
            console.log("✅ Admin user created successfully!");
            console.log("📧 Email: admin@rmk.com");
            console.log("🔐 Password: admin123");
            console.log("⚠️  IMPORTANT: Change this password after first login!");
        }

        // Display all users for verification
        const allUsers = await User.find({}, "name email role");
        console.log("\n📋 All Users in Database:");
        console.table(allUsers.map(u => ({
            Name: u.name,
            Email: u.email,
            Role: u.role
        })));

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n✅ Database connection closed");
        process.exit(0);
    }
};

createAdminUser();
