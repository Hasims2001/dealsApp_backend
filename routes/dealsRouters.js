const express = require("express");
const { auth } = require("../middleware/auth.middleware");
const { dealsModel } = require("../model/dealsModel");


const dealsRouter = express.Router();

/**
 * @swagger
 * /deals:
 *   get:
 *     summary: Get a list of deals
 *     tags:
 *       - Deals
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved deals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Deal'
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

dealsRouter.get("/", auth, async (req, res) => {
    try {
        let dealss = await dealsModel.find();
        res.status(200).json(dealss);
    } catch (error) {
        res.status(400).json({ "error": error.message })

    }
})

/**
 * @swagger
 * /deals/add:
 *   post:
 *     summary: Add a new deal
 *     tags:
 *       - Deals
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               author:
 *                 type: string
 *               publishing_year:
 *                 type: integer
 *             required:
 *               - title
 *               - genre
 *               - author
 *               - publishing_year
 *     responses:
 *       200:
 *         description: Successfully added a new deal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 addeddeals:
 *                   $ref: '#/components/schemas/Deal'
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

dealsRouter.post("/add", auth, async (req, res) => {

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

/**
 * @swagger
 * /deals/update/{id}:
 *   patch:
 *     summary: Update a deal by ID
 *     tags:
 *       - Deals
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deal to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               author:
 *                 type: string
 *               publishing_year:
 *                 type: integer
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Deal updated successfully
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

/**
 * @swagger
 * /deals/delete/{id}:
 *   delete:
 *     summary: Delete a deal by ID
 *     tags:
 *       - Deals
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deal to delete
 *     responses:
 *       200:
 *         description: Deal deleted successfully
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