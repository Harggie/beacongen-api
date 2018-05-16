// Point model
const mongoose = require('mongoose');
const PointSchema = new mongoose.Schema({
    x: Number,
    y: Number,
    floor_id: String,
});
mongoose.model('Point', PointSchema);

module.exports = {
    Point: mongoose.model('Point'),
}