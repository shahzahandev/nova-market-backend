const nodemailer = require("nodemailer");

// <=== Verification email proccess START ===>
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});


let mailVerification = async(token, email) => {
    try {
        const info = await transporter.sendMail({
            from: `"Nova Market Ecommerce", ${process.env.EMAIL_PASSWORD}`, // sender address
            to: email,
            subject: "Pleace, Verify your email And Login ", // subject line
            html: `<body style=margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif><table cellpadding=0 cellspacing=0 style="padding:20px 10px"width=100%><tr><td align=center><table cellpadding=0 cellspacing=0 style=background:#fff;border-radius:10px;overflow:hidden width=600><tr><td style=background:#28a745;padding:25px;text-align:center;color:#fff><h1 style=margin:0>Nova Market</h1><p style="margin:5px 0">Best Electronic items<tr><td style=padding:30px;text-align:center><h2 style=color:#333>Verify Your Email</h2><p style=color:#555;line-height:1.6;font-size:15px>Welcome to <strong>Nova Market</strong> <br>Please confirm your email address to activate your account.<div style="margin:30px 0"><a href="http://localhost:5173/verifyemail/${token}" style="background:#28a745;color:#fff;padding:14px 30px;text-decoration:none;border-radius:6px;font-weight:700;display:inline-block">Verify Email</a></div><p style=color:#777;font-size:13px>If the button doesn't work, copy and paste this link into your browser:<p style=color:#28a745;font-size:13px;word-break:break-all>"http://localhost:5173/verifyemail/${token}"<p style=color:#999;font-size:13px;margin-top:20px>This link will expire soon for security reasons.<p style=color:#999;font-size:13px>If you didn’t create an account, you can safely ignore this email.<tr><td style=background:#f1f1f1;padding:20px;text-align:center;font-size:12px;color:#777><p style=margin:5px>© 2026 Eco Bazar. All rights reserved.<p style=margin:5px>Dhaka, Bangladesh<br>support@novamarket.com</table></table></body>`,
        });
        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
    // <=== Verification email proccess END ===>
}






let resetPassword = async(token, email) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER, // sender address
            to: email,
            subject: "Please, Reset your password and Login", // subject line
            html: `<body style=margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif><table cellpadding=0 cellspacing=0 style="background:#f4f4f4;padding:40px 0"width=100%><tr><td align=center><table cellpadding=0 cellspacing=0 style=background:#fff;border-radius:10px;overflow:hidden width=600><tr><td align=center style=background:#00b207;padding:30px><h1 style=color:#fff;margin:0;font-size:32px>Nova Market</h1><p style=color:#eaffea;margin-top:8px;font-size:14px>Best Electronic items<tr><td style=padding:40px;color:#333><h2 style=margin-top:0;font-size:26px>Reset Your Password</h2><p style=font-size:16px;line-height:1.7>Hello,<p style=font-size:16px;line-height:1.7>We received a request to reset your Nova Matket account password. Click the button below to create a new password.<table cellpadding=0 cellspacing=0 style="margin:30px 0"><tr><td align=center style=border-radius:6px bgcolor=#00B207><a href="http://localhost:5173/resetpassword/${token}" style="display:inline-block;padding:14px 30px;color:#fff;text-decoration:none;font-size:16px;font-weight:700">Reset Password</a></table><p style=font-size:15px;line-height:1.7;color:#666>This password reset link will expire in 10 minutes.<p style=font-size:15px;line-height:1.7;color:#666>If you did not request a password reset, you can safely ignore this email.<hr style="border:none;border-top:1px solid #eee;margin:35px 0"><p style=font-size:14px;color:#888;line-height:1.6>Need help? Contact our support team anytime.<tr><td align=center style=background:#fafafa;padding:25px><p style=margin:0;font-size:14px;color:#777>© 2026 nova market. All rights reserved.</table></table></body>`,
        });
        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
    // <=== Verification email proccess END ===>
}

module.exports = {mailVerification, resetPassword}