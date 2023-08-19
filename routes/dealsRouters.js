const express = require("express");
const { auth } = require("../middleware/auth.middleware");
const { dealsModel } = require("../model/dealsModel");


const dealsRouter = express.Router();
dealsRouter.get("/", auth, async (req, res) => {
    try {
        let dealss = await dealsModel.find();
        res.status(200).json(dealss);
    } catch (error) {
        res.status(400).json({ "error": error.message })

    }
})

dealsRouter.post("/add", auth, async (req, res) => {
    // title ==> deals's title
    // genre ==> deals's genre
    // author ==> deals's author
    // publishing_year ==> year in which deals was published

    const { title, genre, author, publishing_year } = req.body;

    if (!title || !genre || !author || !publishing_year) {
        res.status(400).json({ "error": "all the fields are requried" });

    } else {
        try {
            let deals = new dealsModel(req.body);
            await deals.save();
            res.status(200).json({
                "msg": "deals added", "addeddeals": req.body
            });
        } catch (error) {
            res.status(400).json({ "error": error.message })
        }

    }

})


dealsRouter.patch("/update/:id", auth, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        let deals = await dealsModel.findOne({ _id: id });

        res.status(200).json({ "msg": "deals has been updated" });

    } catch (error) {
        res.status(400).json({ "error": error.message })
    }
})

dealsRouter.delete("/delete/:id", auth, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        let deals = await dealsModel.deleteOne({ _id: id });
        res.status(200).json({ "msg": "deals has been deleted" });

    } catch (error) {
        res.status(400).json({ "error": error.message })
    }
})


module.exports = {
    dealsRouter
}