const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const User = require('../models/userModel')

const { mailVerification, resetPassword } = require('../utils/email');
const { tokenGenerator } = require('../utils/tokenGenerator');
const { emptyFillValidation } = require('../utils/validation');


exports.registrationController = async (req, res) => {
    const { name, email, password, confirmPassword, terms } = req.body

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

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Fill the all field please."
            });
        }

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
            name,
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
            process.env.JWT_SECRET_KEY,
            process.env.JWT_ACCESS_TOKEN_EXPIRY
        )

        // <===  Mail Verification ===>
        mailVerification(token, email)

        return res.status(201).json({
            success: true,
            message: "Account created successfully. Please verify your email.",
            name: user.name,
            email: user.email,

        })
        // <=== MongoDB saving proccess END ===>
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
}

exports.loginController = async (req, res) => {
    const { email, password } = req.body;

    try {
        let existingUser = await User.findOne({ email: email }).select("+password");

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            })
        }
        // <=== if email & password are empty ===>
        // emptyFillValidation(res, email, password)
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // <=== Password matching proccess ===>
        let pass = bcrypt.compareSync(password, existingUser.password);
        if (!pass) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }
        res.status(200).json({
            success: true,
            message: "Login completed successfully.",
            existingUser: {
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                phone: existingUser.phone,
                address: existingUser.address,
                city: existingUser.city,
                postalCode: existingUser.postalCode,
            }
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        })
    }
}

exports.forgotPasswordController = async (req, res) => {
    let { email } = req.body;

    try {
        let existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            });
        }

        // <=== When email is empty ===>
        // emptyFillValidation(res, email)
        if(!email){
              return res.status(404).json({
                success: false,
                message: "fill the input."
            });
        }

        // <=== Token Genarate ===>
        let token = tokenGenerator({
            id: existingUser._id,
            email: existingUser.email
        }, process.env.JWT_SECRET_KEY,
            process.env.JWT_ACCESS_TOKEN_EXPIRY)

        // <===  Mail Verification ===>
        await resetPassword(token, email)
        // <=== Success Response ===>
        return res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email address."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
}

exports.reSetPasswordController = async (req, res) => {
    let { newPassword, confirmPassword } = req.body;
    let { token } = req.params;

    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Don't match password."
            });
        }
        // <=== token decoded ===>
        jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, decoded) {
            console.log(token);
            if (err) {
                console.log(err);
                return res.status(400).json({
                    success: false,
                    message: "Unauthorized."
                });

            } else {
                console.log(decoded);
                let hash = bcrypt.hashSync(newPassword, 10)
                let updateData = await User.findByIdAndUpdate(decoded.id, { password: hash })
                return res.status(200).json({
                    success: true,
                    message: 'Password updated.'
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.resendEmailVerificationController = async (req, res) => {
    let { email } = req.body

    try {
        // <=== Access user by Email ===>
        let existingUser = await User.findOne({ email: email })

        // <=== Token Genarate ===>
        let token = tokenGenerator({
            id: existingUser._id,
            email: existingUser.email
        }, process.env.JWT_SECRET_KEY,
            process.env.JWT_ACCESS_TOKEN_EXPIRY
        )

        // <===  Mail Verification ===>
        mailVerification(token, email)

        // <===If everything is ok, then Response message ===>
        return res.status(200).json({
            success: true,
            message: 'Check your email for Verification'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.verifyEmailController = async (req, res) => {
    const { token } = req.params;

    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, decoded) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Unauthorization."
                });
            } else {
                const userId = decoded.id
                let findUser = await User.findById(userId)
                if (findUser.isVerified) {
                    return res.status(400).json({
                        success: false,
                        message: 'User already verified.'
                    });
                } else {
                    findUser.isVerified = true
                    await findUser.save();
                    return res.status(200).json({
                        success: true,
                        message: 'Email verified successfully.'
                    });
                }
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        })
    }
}

