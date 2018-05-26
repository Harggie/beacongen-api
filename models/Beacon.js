// Beacon model
const mongoose = require('mongoose');
const BeaconSchema = new mongoose.Schema({
    name: String,
    address: String,
    x: Number,
    y: Number,
    floor_id: String,
});
mongoose.model('Beacon', BeaconSchema);

module.exports = {
    Beacon: mongoose.model('Beacon'),
}