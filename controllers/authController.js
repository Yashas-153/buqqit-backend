require("dotenv").config;
// const user = require('../models/user-sql')
const bcrypt = require("bcrypt")
const {signUpSchema} = require("../utils/emailVerification")
const {transporter} = require("../utils/emailVerification")
const { v4: uuidv4 } = require('uuid'); 
const prisma = require('../database/prismaPostgress')
const sendCookieToken = require('../utils/cookieToken');


module.exports.signUp = async (req, res, next) => {
    console.log("Reached signup Controller");
    const {name, email, password, phoneNumber,userType} = req.body;
    console.log(req.body);
    const { error } = signUpSchema.validate(req.body);
    if (error) {    
        return res.status(400).json({ error: error.details[0].message });
    }
    console.log(email, "format is validated");
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = uuidv4();
        const user = await prisma.user.create({
            data:{
                name:name ,
                email:email,
                password : hashedPassword,
                phone_number: phoneNumber,
                user_type:userType,
                verified:false,
                verification_token:verificationToken
            }
        });

        // const verificationLink = `http://localhost:${process.env.NODE_PORT}/auth/verify-email?token=${verificationToken}`;
        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: 'Email Verification',
        //     text: `Please verify your email by clicking the following link: ${verificationLink}`
        // };

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         return console.log(error);
        //     }
        //     console.log('Verification email sent: ' + info.response);
        // });
        sendCookieToken(user,res)
        // res.status(200).json({ msg: 'Account Created Successfully. Please verify your email.',user });
    } catch (err) {
        console.log(err);
        res.json({ err });
    }
};



module.exports.signIn = async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            cookieToken(user,res)
            // res.status(200).json({ token: token });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    console.log("Reached verify email controller");
    try {
        const verifiedUser = await prisma.user.update({
            where:{
                verification_token:token
            },
            data:{
                verification_token:None,
                verified:true
            }
        })
        res.status(200).json({ message: 'Email verified successfully'});
        console.log("User verified successfully, user details: ", verifiedUser)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    console.log("Requesting password reset for email:", email);
    try {
        // const existingUser = await user.getUserByEmail(email);
        const existingUser = await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resetToken = uuidv4();
        const expires = new Date(Date.now() + 1 * 15 * 60 * 1000); // 15 mins from now
        await prisma.user.update({
            where:{
                id:id,
            },
            data:{
                password_reset_token:resetToken,
                password_reset_expires:expires
            }
        })
        
        const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`; // we have to encode this URL into somthing else and reset token in body instead of query.
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset',
            text: `You can reset your password by clicking the following link: ${resetLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Password reset email sent: ' + info.response);
        });

        res.status(200).json({ msg: 'Password reset link sent. Please check your email.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.resetPassword = async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    console.log("reached reset password controller")
    try {
        
        const userWithToken = await prisma.user.findUnique({
            where:{
                password_reset_token:token
            }
        });
        
        if (!userWithToken) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where:{
                id:existingUser.id
            },
            data:{
                password:hashedPassword,
                password_reset_token:null,
                password_reset_expires:null  
            }
        })

        res.status(200).json({ msg: 'Password reset successfully' });
        console.log("Password reset successfully", hashedPassword);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};