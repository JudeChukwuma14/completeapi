const mongoose = require('mongoose')

const authShema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        default: null,

    },
    otpExpires: {
        type: Date,
        default: null,
    }
}, { timestamps: true })

module.exports = mongoose.model("Auth", authShema)