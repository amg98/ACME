const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActorSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "The email format is not valid"
        },
        unique: true
    },

    phoneNumber: String,

    address: String,

    password: {
        type: String,
        required: true,
        minLength: 5
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    rol: {
        type: String,
        enum: ['MANAGER', 'EXPLORER', 'SPONSOR', 'ADMINISTRATOR'],
        required: true
    }

});

module.exports = mongoose.model("Actor", ActorSchema);
