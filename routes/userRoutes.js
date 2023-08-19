const express = require("express");
const bcrypt = require('bcrypt');
const { UserModel } = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { blackListModel } = require("../model/blacklistModel");
const sendEmail = require("../utils/sendEmail");
require('dotenv').config();
const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *  name: User
 *  description: All the end points related to user.
 */

/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          properties:
 *              id:
 *                type: string
 *                description: It is auth generated id of ther user
 *              name:
 *                type: string
 *                description: user name
 *              email:
 *                type: string
 *                description: user email
 *              pass:
 *                type: string
 *                description: user password 
 */


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - pass
 *     responses:
 *       200:
 *         description: The new user has been registered"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 registeredUser:
 *                   $ref: '#/components/schemas/User'
 *                 issue:
 *                   type: boolean
 *       400:
 *         description: Bad request or user registration issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 issue:
 *                   type: boolean
 */

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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *             required:
 *               - email
 *               - pass
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 token:
 *                   type: string
 *                 issue:
 *                   type: boolean
 *       400:
 *         description: Bad request or login issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 issue:
 *                   type: boolean
 */
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

/**
 * @swagger
 * /forgot:
 *   post:
 *     summary: Initiate password reset for a user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 resetToken:
 *                   type: string
 *       400:
 *         description: Bad request or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


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


/**
 * @swagger
 * /resetpassword/{token}:
 *   post:
 *     summary: Reset user password using a reset token
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset token sent to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pass:
 *                 type: string
 *             required:
 *               - pass
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


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

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out a user and invalidate the provided token
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User has been successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       400:
 *         description: Bad request or an error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     securitySchemes:
 *       BearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */


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