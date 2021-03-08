const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tripSchema = require("./TripSchema");

const FinderSchema = new Schema({
    keyword: Schema.Types.String,
    minPrice: Schema.Types.Number,
    maxPrice: Schema.Types.Number,
    dateInit: Schema.Types.Date,
    dateEnd: Schema.Types.Date,
    trips: {
        //type: [tripSchema],
        type: Schema.Types.Mixed,       // TODO Corregir
        expires: 3600
    }
});

module.exports = mongoose.model("Finder", FinderSchema);
