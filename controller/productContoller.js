const productSchema = require('../model/productModel');
const userAuth = require('../model/authModel');
const { productValidation } = require('../middleware/joiVaildation');
const cloudinary = require("../lib/cloudinary")

const postProduct = async (req, res) => {
    try {
        if (req.user) {
            const accountId = req.user.id
            const checkUser = await userAuth.findOne({ _id: accountId })
            if (checkUser.role === "admin") {
                const { error } = productValidation(req.body)
                if (error) return res.status(400).json({ message: error.details[0].message, success: false });
                const { title, price, description, category } = req.body
                let images = []
                if (req.files && Array.isArray(req.files)) {
                    const fileArray = req.files.slice(0, 5)
                    for (const file of fileArray) {
                        const uploadedImage = await cloudinary.uploader.upload(file.path)
                        images.push(uploadedImage.secure_url)
                    }
                }
                await productSchema.create({
                    title,
                    price,
                    category,
                    description,
                    images: images,

                })
                return res.status(200).json({ message: "Product created successfully", success: true });

            } else {
                return res.status(401).json({ message: "Unauthorized you are not an admin", success: false });
            }
        } else {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
}

const updateProduct = async (req, res) => {
    try {
        if (req.user) {
            const accountId = req.user.id
            const checkUser = await userAuth.findOne({ _id: accountId })
            if (checkUser.role === "admin") {
                const updateId = req.params.productId
                const checkProduct = await productSchema.findOne({ _id: updateId })
                if (!checkProduct) {
                    return res.status(404).json({ message: "Product not found", success: false });
                }
                const { title, description, price } = req.body
                if (title) {
                    checkProduct.title = title
                }
                if (description) {
                    checkProduct.description = description
                }
                if (price) {
                    checkProduct.price = price
                }
                await checkProduct.save()
                return res.status(200).json({ message: "Product updated successfully", success: true });
            } else {
                return res.status(401).json({ message: "Unauthorized you are not an admin", success: false });
            }
        } else {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
}

const deleteProduct = async (req, res) => {
    try {
        if (req.user) {
            const accountId = req.user.id
            const checkUser = await userAuth.findOne({ _id: accountId })
            if (checkUser.role === "admin") {
                const deleteId = req.params.productId
                const checkProduct = await productSchema.findOne({ _id: deleteId })
                if (!checkProduct) {
                    return res.status(404).json({ message: "Product not found", success: false });
                }
               await productSchema.findOneAndDelete(checkProduct._id)
                return res.status(200).json({ message: "Product deleted successfully", success: true });
            } else {
                return res.status(401).json({ message: "Unauthorized you are not an admin", success: false });
            }
        } else {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
}

const getAllProduct = async (req, res) => {
    try {
        const allProducts = await productSchema.find()
        const products = allProducts.map((item)=>{
            return{
                ...item.toObject(),
                oneImageUrl: item.images[0]|| ""
            }
        })
        return res.status(200).json({ products, success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
}

const getProductById = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await productSchema.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        return res.status(200).json({ product, success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
}

const searchProduct = async(req,res)=>{
    try {
        const {query, minPrice, maxPrice} = req.query
        let filter = {}
        if(query){
            filter.$or=[
                {title: {$regex: query, $options: 'i'}},
                {description: {$regex: query, $options: 'i'}},
                {category: {$regex: query, $options: 'i'}}
            ]
        }
        if(minPrice || maxPrice){
            filter.price={}
            if(minPrice){
                filter.price.$gte= parseFloat(minPrice)
            }
            if(maxPrice){
                filter.price.$lte= parseFloat(maxPrice)
            }
        }

        const products = await productSchema.find(filter)
        return res.status(200).json({ products, success: true });

    } catch (error) {
        res.status(400).json({ message: error.message, success: false }); 
    }
}
module.exports = { postProduct, updateProduct, deleteProduct,  getAllProduct, getProductById, searchProduct}