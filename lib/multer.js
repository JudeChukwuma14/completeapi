const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        // Directory to save file
        cb(null, "./uploads")  
    },
    filename: (req, file, cb)=>[
        // give your file a unqiue name
        cb(null, `${Date.now()}-${file.originalname}`)
    ],
})

// This is for filting your file type
const fileFilter = (req, file, cb)=>{
    const allowedType = ["image/jpeg", "image/png", "image/jpg"]
    if(allowedType.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(new Error("Only image of JPEG, PNG, JPG are allow"),false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10,
    }
}).array("images", 5)


module.exports = upload