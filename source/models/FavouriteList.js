const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavouriteListSchema = new Schema({
    explorerID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    timestamp: {
        type: Schema.Types.Date,
        required: true
    },
    favouriteLists: [{
        name: {
            type: Schema.Types.String,
            required: true
        },
        trips: [{
            type: Schema.Types.ObjectId
        }],
    }]
})

module.exports = mongoose.model("FavouriteList", FavouriteListSchema);
