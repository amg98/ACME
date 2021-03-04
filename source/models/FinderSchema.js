import TripSchema from "Trip.js";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FinderSchema = new Schema({
    keyword: Schema.Types.String,
    minPrice: Schema.Types.Number,
    maxPrice: Schema.Types.Number,
    dateInit: Schema.Types.Date,
    dateEnd: Schema.Types.Date,
    trips: [TripSchema]
});

module.exports = mongoose.model("Finder", FinderSchema);
