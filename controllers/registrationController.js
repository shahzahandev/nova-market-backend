const User = require('../models/userModelSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")

const { mailVerification, resetPassword } = require('../utils/email');
const { tokenGenerator } = require('../utils/tokenGenerator');
const { emptyFillValidation } = require('../utils/validation');


let registrationController = async (req, res) => {
    const { email, password, confirmPassword, terms } = req.body

    try {
        // <=== Access user by Email ===>
        let existingUser = await User.findOne({ email: email })

        // <=== If User already Avaiable ===>
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account already exists with this email address."
            });
        }

        // <=== if email, password & confirm password terms are empty ===>
        emptyFillValidation(res, email, password, confirmPassword, terms)

        // <=== if password & Confirm password don't match ===>
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match."
            });
        }

        // <=== if terms is false ===>
        if (!terms) {
            return res.status(400).json({
                success: false,
                message: "You must accept the terms and conditions to continue."
            });
        }
        // <=== MongoDB saving proccess START ===>
        const hash = bcrypt.hashSync(password, 10);
        let user = new User({
            email, 
            password: hash, 
            terms
        });
        await user.save();

        // <=== Token Genarate ===>
        let token = tokenGenerator({
            id: user._id,
            email: user.email
        }, 
        process.env.TOKEN_SECRET,
        process.env.JWT_EXPIRES
    )

        // <===  Mail Verification ===>
        mailVerification(token, email)

        return res.status(201).json({
            success: true,
            message: "Account created successfully. Please verify your email.",
            userEmail: user.email
        })
        // <=== MongoDB saving proccess END ===>
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}

let loginController = async (req, res) => {
    const { email, password } = req.body

    try {
        // <=== Access user by Email ===>
        let existingUser = await User.findOne({ email: email })

        // <=== If User already Avaiable ===>
        if (!existingUser) {
           return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            })
        }

        // <=== if email & password are empty ===>
        emptyFillValidation(res, email, password)

        // <=== Password matching proccess ===>
        let pass = bcrypt.compareSync(password, existingUser.password);
        if (!pass) {
            // <=== If password not matching ===> 
               return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            })
        } else {
            // <=== If password matching ===> 
           return res.status(200).json({
            success: true,
            message: "Login completed successfully.",
            data: {
                userId: existingUser._id,
                email: existingUser.email
            }
        })
        }
    } catch (error) {
        // <=== Server Error ===>
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}

let forgotPasswordController = async (req, res) => {
    let { email } = req.body

    try {
        // <=== Access user by Email ===>
        let existingUser = await User.findOne({ email})

        // <=== If User already Avaiable ===>
        if (!existingUser) {
             return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            })
        }

        // <=== When email is empty ===>
        emptyFillValidation(res, email)

        // <=== Token Genarate ===>
        let token = tokenGenerator({
            id: existingUser._id,
            email: existingUser.email
        }, process.env.TOKEN_SECRET,
            process.env.JWT_EXPIRES)

        // <===  Mail Verification ===>
        await resetPassword(token, email)

       // <=== Success Response ===>
        return res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email address."
        })
    } catch (error) {
        // <=== Server Error ===>
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}

// with out test in postman
let reSetPasswordController = async(req, res) => {
    let { newPassword, confirmPassword } = req.body
    let { token } = req.params

    try {
        if (newPassword !== confirmPassword) {
            return res.send({
                success: false,
                message: "Don't match password."
            })
        }

        // <=== token decoded ===>
        jwt.verify(token, process.env.TOKEN_SECRET, async function (err, decoded) {
            console.log(token);
            
            if (err) {
                console.log(err);
                
                return res.send({
                    success: false,
                    message: "Unauthorized." 
                })
                
            } else {
                console.log(decoded);
                
                let hash = bcrypt.hashSync(newPassword, 10)
                let updateData = await User.findByIdAndUpdate(decoded.id, { password: hash })
                return res.send({
                    success: true,
                    message: 'Password updated.'
                })
            }
        });
    } catch (error) {
        return res.send({
            success: false,
            message: 'Server error',
            error: error
        })
    }
}

let resendEmailVerificationController = async (req, res) => {
    let { email } = req.body

    try {
        // <=== Access user by Email ===>
        let existingUser = await User.findOne({ email: email })

        // <=== Token Genarate ===>
        let token = tokenGenerator({
            id: existingUser._id,
            email: existingUser.email
        }, process.env.TOKEN_SECRET,
            process.env.JWT_EXPIRES)

        // <===  Mail Verification ===>
        mailVerification(token, email)

        // <===If everything is ok, then Response message ===>
        return res.send({
            success: true,
            message: 'Check your email for Verification'
        })
    } catch (error) {
        return res.send({
            success: false,
            message: 'Server error',
            error: error
        })
    }
}

let verifyEmailController = async (req, res) => {
    const { token } = req.params

    try {
        jwt.verify(token, process.env.TOKEN_SECRET, async function (err, decoded) {
            if (err) {
                return res.send({ message: "Unauthorization." })
            } else {
                const userId = decoded.id
                let findUser = await User.findById(userId)
                if (findUser.isVerified) {
                    return res.send({
                        success: true,
                        message: 'User already verified.'
                    })
                } else {
                    findUser.isVerified = true
                    findUser.save()
                    return res.send({
                        success: true,
                        message: 'Email verified successfully.'
                    })
                }
            }
        });
        
    } catch (error) {
        return res.send({
            success: false,
            message: 'Server error',
            error: error
        })
    }
}




module.exports = { registrationController, loginController, forgotPasswordController, reSetPasswordController, resendEmailVerificationController, verifyEmailController }

// ndmt uxan reaf igve