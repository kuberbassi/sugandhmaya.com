// server/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This line reads the MONGO_URI from your .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully.');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        // Exit the process with a failure code
        process.exit(1);
    }
};

module.exports = connectDB;