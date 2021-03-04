const Trip = require("../models/TripSchema");
const Validators = require("../middlewares/Validators");
const { CheckManager } = require("../middlewares/Auth");
const RandExp = require("randexp");
/**
 * Get a trip
 * @route GET /trips
 * @group Trip - Trip
 * @returns {Array.<Trip>}   200 - Returns Trips
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {} 500 - Database error
 */
const get = (req, res) => {
  Trip.find({}).exec(function (err, trips) {
    res.send(trips);
  });
};

/**
 * Create a new trip
 * @route POST /trips
 * @group Trip - Trip
 * @param {TripPost.model} trip.body.required  - New trip
 * @returns {Trip.model}                200 - Returns the created trip
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const createTrip = async (req, res) => {
  delete req.body.trip._id;
  delete req.body.trip.isPublished;
  delete req.body.trip.isCancelled;
  delete req.body.trip.cancellReason;

  req.body.trip.ticker = generateTicker();

  try {
    const doc = await new Trip(req.body.trip).save();
    res.status(200).send(doc);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

function generateTicker() {
  var today = new Date();
  today = today.toISOString().substring(0, 10);

  ticker_date = today.slice(2, 4) + today.slice(5, 7) + today.slice(8);
  letters = new RandExp(/([A-Z]{4})/).gen();

  ticker = ticker_date + "-" + letters;

  //TODO
  // Trip.exists({ ticker: ticker }, function (err) {
  //   if (err) {
  //     next();
  //   } else {
  //     ticker = generateTicker();
  //   }
  // });

  return ticker;
}

module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/trips`;
  router.post(
    apiURL,
    CheckManager,
    Validators.Required("body", "trip"),
    Validators.CheckDates("body", "trip"),
    createTrip
  );
};

/**
 * @typedef TripPost
 * @property {Trip.model} trip - Trip to add
 */

/**
 * @typedef Stage
 * @property {string}       title.required
 * @property {string}       description.required
 * @property {number}       price.required
 */

/**
 * @typedef Trip
 * @property {string}       title.required
 * @property {string}       managerID.required
 * @property {string}       descripition
 * @property {Array.<string>}       requirements
 * @property {string}     startDate.required
 * @property {string}     endDate.required
 * @property {Array.<string>}       pictures
 * @property {boolean}  isCancelled
 * @property {string}  cancellReason
 * @property {boolean}  isPublished
 * @property {Array.<Stage>} stages.required
 */
