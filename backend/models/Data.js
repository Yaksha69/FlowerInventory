const mongoose = require('mongoose')

const Schema = mongoose.Schema

const DataSchema = new Schema({
    Product: {
        type: String,
        required: true,
        unique: true
    },
    Quantity: {
        type: Number,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true,
    }
    

}, {timestamps: true})

module.exports = mongoose.model('Data', DataSchema)