const Trip = require("../models/TripSchema");
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
 * @route POST /trip
 * @group Trip - Trip
 * @param {Trip.model} trip.body.required - New trip
 * @returns {integer} 201 - Returns the  created trip
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {} 500 - Database error
 */
const post = (req, res) => {
  //YYMMDD-AAAA
  var trip = req.body;
  trip.body.ticker = new RandExp(/(\d{6})-([A-Z]{4})/).gen();
  console.log(trip);
  const doc = new Trip(trip).save();
  return res.status(201).send(doc);
};

module.exports.register = (apiPrefix, router) => {};

/**
 * @typedef Stage
 * @property {string}       name
 * @property {string}       descripition
 * @property {number}        price
 */

/**
 * @typedef Trip
 * @property {string}       title.required
 * @property {string}       descripition
 * @property {Array.<string>}       requirements
 * @property {string}     startDate.required
 * @property {string}     endDate.required
 * @property {Array.<string>}       pictures
 * @property {boolean}  cancelled
 * @property {string}  cancellReason
 * @property {boolean}  published
 * @property {Array.<Stage>} stages.required
 */
