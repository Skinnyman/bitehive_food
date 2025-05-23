const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			//ref: "user",
			required: true,
		},
		businessId: {
			type: mongoose.Schema.Types.ObjectId,
			//ref: "Vendor",
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed", "cancelled"],
			default: "pending",
		},
		orderType: {
			type: String,
			enum: ["delivery", "pickup"],
			required: true,
		},
		deliveryAddress: {
			type: String,
			default: "",
		},
		deliveryCharge: {
			type: Number,
			required: true,
			default: 0,
		},
		acceptedByVendor: {
			type: Boolean,
			required: true,
			default: false,
		},
		markedAsCompleted: {
			type: Boolean,
			required: true,
			default: false,
		},
        awaitingDelivery: {
            type: Boolean,
            required: true,
            default: true,
        },
		rating: {
			type: Number,
			default: null,
			min: 0,
			max: 5,
		},
	},
    { timestamps: true }  
  
)


module.exports = mongoose.model("Order",OrderSchema)