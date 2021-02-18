import mongoose from "mongoose";

const Schema = mongoose.Schema
mongoose.set("useCreateIndex", true)

const ApplicationSchema = new Schema({
    status: {
        type: String,
        enum: ['PENDING', 'REJECTED', 'DUE','ACCEPTED', 'CANCELLED'],
        default: 'PENDING',
        required: [true]
    },
    comments: {
        type: Array,
    },
    rejectReason: {
        type: String,
    }
}, {
    timestamps: {
        createdAt: 'timeStamp'
    }
})