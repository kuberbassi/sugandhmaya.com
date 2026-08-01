const mongoose = require('mongoose');

let retryTimer;
let connectionAttempt;

const connectDB = async ({ retry = true } = {}) => {
    if (mongoose.connection.readyState === 1) return true;
    if (connectionAttempt) return connectionAttempt;

    if (!process.env.MONGO_URI) {
        console.warn('MongoDB is disabled: MONGO_URI is not configured.');
        return false;
    }

    connectionAttempt = mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    }).then(() => {
        console.log('MongoDB connected.');
        if (retryTimer) clearTimeout(retryTimer);
        return true;
    }).catch(error => {
        console.warn(`MongoDB unavailable (${error.code || 'connection error'}). The local catalogue fallback is active.`);
        if (retry && !retryTimer) {
            retryTimer = setTimeout(() => {
                retryTimer = undefined;
                connectDB({ retry: true });
            }, 30000);
            retryTimer.unref();
        }
        return false;
    }).finally(() => {
        connectionAttempt = undefined;
    });

    return connectionAttempt;
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isDatabaseReady = isDatabaseReady;
