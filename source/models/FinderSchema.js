const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TripSchema = require("./TripSchema");

const FinderSchema = new Schema({
    keyword: Schema.Types.String,
    minPrice: Schema.Types.Number,
    maxPrice: Schema.Types.Number,
    startDate: Schema.Types.Date,
    endDate: Schema.Types.Date,
    trips: {
        type: [Schema.Types.ObjectId],
        ref: 'Trip'
    },
    actorID: Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Finder", FinderSchema);
