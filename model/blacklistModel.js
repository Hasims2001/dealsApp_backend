
const mongoose = require('mongoose');

const dealsSchema = mongoose.Schema({
    name: String,
    blacklist: [String]
})

const blackListModel = mongoose.model("blacklist", dealsSchema);

module.exports = {
    blackListModel
}