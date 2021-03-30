const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FinderSchema = new Schema({
    keyword: Schema.Types.String,
    minPrice: Schema.Types.Number,
    maxPrice: Schema.Types.Number,
    startDate: Schema.Types.Date,
    endDate: Schema.Types.Date,
    trips: {
        type: Schema.Types.ObjectId,
        ref: 'FinderResults'
    },
    actorID: Schema.Types.ObjectId
});

module.exports = mongoose.model("Finder", FinderSchema);
