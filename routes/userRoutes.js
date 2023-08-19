const express = require("express");
const bcrypt = require('bcrypt');
const { UserModel } = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { blackListModel } = require("../model/blacklistModel");
const sendEmail = require("../utils/sendEmail");
require('dotenv').config();
const userRouter = express.Router();


userRouter.post("/register", async (req, res) => {

    const { name, email, pass } = req.body;
    if (!name || !email || !pass) {
        res.status(400).json({ "error": "all the fields are requried" });
    } else {

        try {
            let user = await UserModel.findOne({ email: email });

            if (user) {
                res.status(400).json({ "error": "User has already registered", "issue": true })
            } else {
                bcrypt.hash(pass, 5, async (err, hash) => {
                    if (err) return err;
                    req.body.pass = hash;
                    let newuser = new UserModel(req.body);
                    await newuser.save();
                    res.status(200).json({ "msg": "The new user has been registered", "registeredUser": req.body, "issue": false });
                })

            }
        } catch (error) {
            res.status(400).json({ "error": error.message, "issue": true })
        }

    }



})


userRouter.post("/login", async (req, res) => {
    const { pass, email } = req.body;
    if (!pass || !email) {
        res.status(400).json({ "error": "all the fields are requried" });
    } else {
        try {
            let user = await UserModel.findOne({ email });
            if (user) {
                bcrypt.compare(pass, user.pass, (err, result) => {
                    if (err) {
                        res.status(400).json({ "error": err.message, "issue": true })
                    }
                    if (result) {
                        const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY);

                        res.status(200).json({ "msg": "Login successful!", "token": token, "issue": false })
                    } else {
                        res.status(400).json({ "error": "Password is incorrect!", "issue": true })
                    }
                })
            } else {
                res.status(400).json({ "error": "User Not Found!", "issue": true })
            }
        } catch (error) {
            res.status(400).json({ "error": error.message, "issue": true })
        }
    }

})

// send mail for forgot password
userRouter.post("/forgot", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ "error": "all the fields are requried" });
    } else {
        try {
            let user = await UserModel.findOne({ email });
            if (user) {
                const reset = jwt.sign({ _id: user._id }, process.env.JWT_RESET_KEY);
                user.resetToken = reset;
                await user.save();

                const text = `share link of reset with token`;
                const result = await sendEmail(user.email, "Forgot Password", text);
                if (!result.issue) {
                    res.send({ issue: false, msg: "password reset link sent to your email account", resetToken: reset });
                } else {
                    res.status(400).json({ issue: true, "error": result.err });
                }
            } else {
                res.status(400).json({ "error": "User Not Found!" })
            }
        } catch (error) {
            res.status(400).json({ "error": error.message })
        }
    }

})

userRouter.post("/resetpassword/:token", async (req, res) => {
    const { pass, } = req.body;
    const { token } = req.params;
    if (!token) {
        res.status(400).json({ "error": "token is require" });
    } else {
        try {
            let user = await UserModel.findOne({ resetToken: token });
            if (user) {
                user.pass = pass;
                delete user.resetToken;
                await user.save();
                res.send("password reset sucessfully.");
            } else {
                res.status(400).json({ "error": "User Not Found!" })
            }
        } catch (error) {
            res.status(400).json({ "error": error.message })
        }
    }

})
userRouter.get("/logout", async (req, res) => {
    const token = req.headers.auth;
    try {
        let obj = await blackListModel.findOne({ name: "users" });
        obj.blacklist.push(token);
        await obj.save();

        res.status(200).json({ "msg": "User has been logged out" })
    } catch (error) {
        res.status(400).json({ "error": error.message })
    }

})


module.exports = {
    userRouter
}