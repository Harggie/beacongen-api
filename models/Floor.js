// Floor model
const mongoose = require('mongoose');
const FloorSchema = new mongoose.Schema({
    title: String,
    description: String,
    building_id: String,
    svg_path: String,
    res_horizontal: Number,
    res_vertical: Number,
    scale_horizontal: Number,
    scale_vertical: Number,
    user_id: String
});
mongoose.model('Floor', FloorSchema);

module.exports = {
    Floor: mongoose.model('Floor'),
}