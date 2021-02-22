const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SponsorshipSchema = new Schema({
    bannerURL: Schema.Types.String,
    landingPageURL: Schema.Types.String,
    sponsorID: Schema.Types.ObjectId,
    tripID: Schema.Types.ObjectId,
    isPaid: Schema.Types.Boolean,
});

module.exports = mongoose.model("Sponsorship", SponsorshipSchema);
