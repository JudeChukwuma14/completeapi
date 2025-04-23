const express = require('express')
require("dotenv").config()
const app = express()
app.use(express.json())
const userRoute = require("./router/userRouter")
const cookie = require("cookie-parser")
const cors = require('cors')
// Connect to MongoDB
const mongoose = require('mongoose')
const MongoDB = process.env.MONGODB_URL
mongoose.connect(MongoDB).then(() => {
    console.log('Connected to MongoDB!!!')
})
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message)
    })
app.use(cors())
app.use(express.json())
app.use(cookie())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1", userRoute)
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})