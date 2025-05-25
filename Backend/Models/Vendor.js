const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    businessName: {
		type: String,
		required: true,
	},
    contactPerson: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	delivery: {
		type: String,
		required: true,
		
	},
    location: {
        type:String,
    }  
})

module.exports = mongoose.model("Vendor",VendorSchema);