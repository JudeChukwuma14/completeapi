const joi = require("joi")


const createUser = (data) => {
    const schema = joi.object({
        username: joi.string().alphanum().min(5).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().alphanum().min(8).max(30).required(),
        confirmPassword: joi.ref('password')
    })
    return schema.validate(data)
}

const loginUser = (data) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().alphanum().min(8).max(30).required(),

    })
    return schema.validate(data)
}

const productValidation = (data) => {
    const schema = joi.object({
        title: joi.string().required(),
        price: joi.number().required(),
        description: joi.string().required(),
        category: joi.string().required()
    })
    return schema.validate(data)
}


module.exports.createUser = createUser
module.exports.loginUser = loginUser

module.exports.productValidation = productValidation