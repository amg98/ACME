const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set("useCreateIndex", true);

const TripSchema = new Schema(
  {
    managerID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    ticker: {
      type: String,
      required: [true],
      validate: {
        validator: function (v) {
          return /(\d{6})-([A-Z]{4})/.test(v);
        },
        message: "The ticker format is not valid",
      },
      unique: true,
    },
    title: {
      type: String,
      required: [true],
    },
    description: Schema.Types.String,
    requirements: [String],
    startDate: {
      type: Date,
      required: [true],
    },
    endDate: {
      type: Date,
      required: [true],
    },
    pictures: [String],
    cancelReason: {
      type: String,
      required: [false],
      default: "",
    },
    isCancelled: {
      type: Boolean,
      required: [false],
      default: false,
    },
    isPublished: {
      type: Boolean,
      required: [false],
      default: false,
    },
    stages: [
      {
        title: {
          type: String,
          required: [true],
        },
        description: {
          type: String,
          required: [true],
        },
        price: {
          type: Number,
          required: [true],
          min: [0],
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: "timeStamp",
    },
  }
);

TripSchema.virtual("price").get(function () {
  return this.stages.reduce(function (acc, val) {
    return acc + val.price;
  }, 0);
});

module.exports = mongoose.model("Trip", TripSchema);
