// Building model
const mongoose = require('mongoose');
const BuildingSchema = new mongoose.Schema({
    title: String,
    description: String,
    featured_image: String,
    user_id: String
});
mongoose.model('Building', BuildingSchema);

module.exports = {
    Building: mongoose.model('Building'),
}