const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SponsorshipSchema = new Schema({
    bannerURL: {
        type: Schema.Types.String,
        required: true,
        validate: {
            validator: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test
        }
    },
    landingPageURL: {
        type: Schema.Types.String,
        required: true,
        validate: {
            validator: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test
        }
    },
    sponsorID: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    tripID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    isPaid: {
        type: Schema.Types.Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model("Sponsorship", SponsorshipSchema);
