const { createUser, loginUser } = require("../middleware/joiVaildation")
const userAuth = require("../model/authModel")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const otpGenerator = require("../middleware/otpGenerator")
const SendingMail = require("../middleware/emailSetup")

const registerAccount = async (req, res) => {
    try {
        const { error } = createUser(req.body)
        if (error) {
            return res.status(401).json({ message: error.details[0].message, success: false })
        }
        const { username, email, password, confirmPassword } = req.body

        const checkEmail = await userAuth.findOne({ email: email })
        if (checkEmail) {
            return res.status(409).json({ message: "Email already exists", success: false })
        }
        if (password !== confirmPassword) {
            return res.status(401).json({ message: "Passwords do not match", success: false })
        }
        const hashedPassword = bcryptjs.hashSync(password, 10)
        await userAuth.create({
            username,
            email,
            password: hashedPassword
        })
        return res.status(201).json({ message: "Account created successfully", success: true })
    } catch (error) {
        return res.status(500).json({ message: "Oops!!, an error occurred while registering", success: false, error: error.message })
    }
}

const loginAccount = async (req, res) => {
    try {
        const { error } = loginUser(req.body)
        if (error) {
            return res.status(401).json({ message: error.details[0].message, success: false })
        }
        const { email, password } = req.body
        const user = await userAuth.findOne({ email: email })
        if (!user) {
            return res.status(409).json({ message: "Email and Password Mismatch", success: false })
        }
        const validPassword = bcryptjs.compareSync(password, user.password)
        if (!validPassword) {
            return res.status(409).json({ message: "Wrong credentials", success: false })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY)
        res.cookie("JANAPI", token, { expiresIn: "1hr", httpOnly: true }).status(200).json({ data:req.body, success: true, token: token})

    } catch (error) {
        return res.status(500).json({ message: "Oops!!, an error occurred while registering", success: false, error: error.message })
    }
}

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(401).json({ message: "Email is required", success: false })
        }
        const checkEmail = await userAuth.findOne({ email: email })
        if (!checkEmail) {
            return res.status(409).json({ message: "Email not found", success: false })
        }
        const otp = await otpGenerator(email)
        checkEmail.otp = otp
        const date = new Date()
        date.setMinutes(date.getMinutes() + 5)
        checkEmail.otpExpires = date

        const option = {
            email: email,
            subject: "Password Reset OTP",
            message: `Your OTP is ${otp}. It will expire in 5 minutes.`
        }

        await SendingMail(option)
        await checkEmail.save()
        res.status(200).json({ message: "OTP sent successfully", success: true })
    } catch (error) {
        return res.status(500).json({ message: "Oops!!, an error occurred while", success: false, error: error.message })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body
        if (!otp) {
            return res.status(401).json({ message: "OTP is required", success: false })
        }
        const checkOtp = await userAuth.findOne({ otp: otp })
        if (!checkOtp) {
            return res.status(409).json({ message: "Invalid OTP", success: false })
        }
        const date = new Date()
        if (date >= checkOtp.otpExpires) {
            return res.status(409).json({ message: "OTP expired", success: false })
        } else {
            return res.status(200).json({ message: "OTP verified successfully", success: true })
        }
    } catch (error) {
        return res.status(500).json({ message: "Oops!!, an error occurred while", success: false, error: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const otp = req.params.otp
        if (!otp) {
            return res.status(401).json({ message: "OTP is required, fail to reset password", success: false })
        }
        const { password, newPassword } = req.body
        if (!password || !newPassword || password.trim() === "" || newPassword.trim() === "") {
            return res.status(401).json({ message: "Password and new password are required", success: false })
        }
        if (password !== newPassword) {
            return res.status(401).json({ message: "Passwords do not match", success: false })
        }
        const checkOtp = await userAuth.findOne({ otp: otp })
        if (!checkOtp) {
            return res.status(409).json({ message: "Invalid OTP fail to reset password", success: false })
        }
        const date = new Date()
        if (date >= checkOtp.otpExpires) {
            return res.status(409).json({ message: "OTP expired", success: false })
        } else {
            checkOtp.password = bcryptjs.hashSync(newPassword, 10)
            checkOtp.otp = ""
            checkOtp.otpExpires = ""
            await checkOtp.save()
            return res.status(200).json({ message: "Password reset successfully", success: true })
        }

    } catch (error) {
        return res.status(500).json({ message: "Oops!!, an error occurred while", success: false, error: error.message })
    }
}
const logout = async (req, res) => {
    try {
        res.cookie("JANAPI", "", { maxAge: 0 })
        res.status(200).json({ message: 'Logged out successfully.' })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Server error.', error: error.message })
    }
}

module.exports = {
    registerAccount,
    loginAccount,
    forgetPassword,
    verifyOtp,
    resetPassword,
    logout

}