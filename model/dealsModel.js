
const mongoose = require('mongoose');

const dealsSchema = mongoose.Schema({
    title: String,
    genre: String,
    author: String,
    publishing_year: String,
})

const dealsModel = mongoose.model("deals", dealsSchema);

module.exports = {
    dealsModel
}