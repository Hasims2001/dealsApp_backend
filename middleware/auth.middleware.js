const jwt = require("jsonwebtoken");
const { blackListModel } = require("../model/blacklistModel");

const auth = async (req, res, next) => {
    const token = req.headers.auth;

    if (token) {

        try {
            let obj = await blackListModel.findOne({ name: "users" });
            if (obj.blacklist.includes(token)) {
                res.status(200).json({ "error": "Login again..." });
            } else {

                try {

                    jwt.verify(token, "verified", (err, decoded) => {
                        if (err) return err;

                        console.log("passed");
                        next();

                    })
                } catch (error) {
                    res.status(400).json({ "error": "Token is expire...generate token again..." });
                }
            }

        } catch (error) {
            res.status(400).json({ "error": error.message })
        }
    } else {
        res.status(400).json({ "error": "Login again..." });
    }
}

module.exports = {
    auth
}