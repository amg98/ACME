const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MonthCubeSchema = new Schema({
    amount: {
        type: Number,
        min: 0
    },
    month: {
        type: Number,
        min: 1,
        max: 36
    }, 
    explorerID: {
        type: Schema.Types.ObjectId,
        required: true,
    }
});

module.exports = mongoose.model("MonthCube", MonthCubeSchema);