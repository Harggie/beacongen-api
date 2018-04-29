// Area model
const mongoose = require('mongoose');
const AreaSchema = new mongoose.Schema({
    floor_id: String,
    polygon_coordinates: String,
    color: String,
    user_id: String
});
mongoose.model('Area', AreaSchema);

module.exports = {
    Area: mongoose.model('Area'),
}