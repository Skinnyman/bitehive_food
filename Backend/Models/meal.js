const mongoose = require("mongoose");
const accompaniment = require("./accompaniment");


const MealSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: {
		type: String,
		required: true,
	}, 
    image: {
        type: String,
        required: true,
    },
	price: {
		type: Number,
		required: true,
		default: 0,
	},
	mealType: {
		type: String,
		enum: ["breakfast", "lunch", "dinner", "snack"],
		required: true,
		default: "snack",
        lowercase: true,
	},
	description: {
		type: String,
		default: "",
	},
	chargeType: {
		type: String,
		enum: ["quantity", "free"],
		required: true,
		default: "quantity",
        lowercase: true,
	},
    accompaniment:{
        name: {
                type: String,
               
            },
            price: {
                type: Number,
                default: 0,
            },
            isFree: {
                type: String,
            },
    }   
})


module.exports = mongoose.model("Meal",MealSchema)
