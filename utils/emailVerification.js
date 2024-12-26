const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const Joi = require('joi'); //Joi is used for string validation (for now)

const signUpSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    userType: Joi.string().required()
});

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = {signUpSchema, transporter}



