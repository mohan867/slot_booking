const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const users = await User.find({}, { email: 1, role: 1 });
        console.log("Registered Users:");
        console.log(JSON.stringify(users, null, 2));
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        mongoose.connection.close();
    });
