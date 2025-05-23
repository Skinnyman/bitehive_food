const { default: mongoose } = require("mongoose")
const moongose = require("mongoose")

const favoriteSchema = new moongose.Schema({
    vendorId: String,
    customerId: String,
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Favorite', favoriteSchema)