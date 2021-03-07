const Trip = require("../models/TripSchema");
const Application = require("../models/ApplicationSchema");
const { CheckAdmin } = require("../middlewares/Auth");

/**
 * The average, the minimum, the maximum, and the standard deviation of the
 * number of trips managed per manager
 * @route GET /stats/trips-per-manager
 * @group Stats
 * @returns {Results.model}   200 - Returns the query
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const tripsPerManager = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ isPublished: true }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * The average, the minimum, the maximum, and the standard deviation of the
 * number of applications per trip
 * @route GET /stats/applications-per-trip
 * @group Stats
 * @returns {Results.model}   200 - Returns the query
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const applicationsPerTrip = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ isPublished: true }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Theaverage, the minimum, the maximum, and the
 * standard deviation of the
 * number of trips price per trips
 * @route GET /stats/price-per-trips
 * @group Stats
 * @returns {Results.model}   200 - Returns the query
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const pricePerTrips = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ isPublished: true }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * The ratio of applications grouped by status
 * @route GET /stats/applications-ratio
 * @group Stats
 * @returns {ApplicationRatio.model}   200 - Returns the query
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const applicationsRatio = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ isPublished: true }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * The average price range that explorers indicate in their finders
 * @route GET /stats/avg-price-finder
 * @group Stats
 * @returns {number.model}   200 - Returns the avg price in finders
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const avgPriceFinder = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ isPublished: true }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * The average price range that explorers indicate in their finders
 * @route GET /stats/top-keywords
 * @group Stats
 * @returns {Array<Keyword>}   200 - Returns the avg price in finders
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const topTenKeywords = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ isPublished: true }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/stats`;
  router.get(`${apiURL}/trips-per-manager`, CheckAdmin, tripsPerManager);
  router.get(
    `${apiURL}/applications-per-trip`,
    CheckAdmin,
    applicationsPerTrip
  );
  router.get(`${apiURL}/price-per-trips`, CheckAdmin, pricePerTrips);
  router.get(`${apiURL}/applications-ratio`, CheckAdmin, applicationsRatio);
  router.get(`${apiURL}/avg-price-finder`, CheckAdmin, avgPriceFinder);
  router.get(`${apiURL}/top-keywords`, CheckAdmin, topTenKeywords);
};

/**
 * @typedef Results
 * @property {number} min - minimun
 * @property {number} max - maximum
 * @property {number} avg - average
 * @property {number} stdv - standard deviation
 */

/**
 * @typedef ApplicationRatio
 * @property {number} pending - pending
 * @property {number} accepted - accepted
 * @property {number} rejected - rejected
 * @property {number} due - due
 * @property {number} cancelled - cancelled
 */

/**
 * @typedef Keyword
 * @property {string} keyword - keyword
 * @property {number} count - count
 */
