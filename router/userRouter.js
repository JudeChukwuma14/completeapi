const express = require('express');
const send = require('../controller/userController');
const { registerAccount, loginAccount, forgetPassword, verifyOtp, resetPassword, logout } = require('../controller/authController');
const { postProduct, updateProduct, deleteProduct, getAllProduct, getProductById, searchProduct } = require('../controller/productContoller');

const upload = require('../lib/multer');
const { verifyToken } = require('../middleware/verifyToken');
const router = express.Router();

router.get("/send", send)
router.get("/allproduct", getAllProduct)
router.get("/productbyid/:id", getProductById)
router.get("/product/search", searchProduct)
router.post("/signup", registerAccount)
router.post("/login", loginAccount)
router.post("/forgetpassword", forgetPassword)
router.post("/logout", logout)
router.post("/checkotp", verifyOtp)
router.post("/resetpassword/:otp", resetPassword)
router.post("/postproduct",verifyToken,upload,postProduct)
router.patch("/updateproduct/:productId",verifyToken,updateProduct)
router.delete("/deleteproduct/:productId",verifyToken,deleteProduct)
module.exports = router