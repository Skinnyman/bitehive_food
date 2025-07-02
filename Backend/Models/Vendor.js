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
	network: {
		type: String,
		required: true,
		
	},
	location: {
		latitude: String,
		longitude: String,
		address: String, 
	  } ,
	  recipientCode: { 
		type: String 
	},
	  subaccountCode: {
		type: String,
		default: ""
	  },
})

module.exports = mongoose.model("Vendor",VendorSchema);