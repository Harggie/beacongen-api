// Reading model
const mongoose = require('mongoose');
const ReadingSchema = new mongoose.Schema({
    timestamp_nanos: Number,
    rssi: Number,
    address: String,
    name: String,
    scan_id: String
});
mongoose.model('Reading', ReadingSchema);

module.exports = {
    Reading: mongoose.model('Reading'),
}