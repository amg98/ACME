const Trip = require("../models/TripSchema");
const Application = require("../models/ApplicationSchema");
const { CheckAdmin } = require("../middlewares/Auth");

/**
 * The average, the minimum, the maximum, and the standard deviation of the
 * number of trips managed per manager
 * @route GET /dashboard/trips-per-manager
 * @group Dashboard
 * @returns {Results}   200 - Returns the query
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
 * @route GET /dashboard/applications-per-trip
 * @group Dashboard
 * @returns {Results}   200 - Returns the query
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
 * @route GET /dashboard/price-per-trips
 * @group Dashboard
 * @returns {Results}   200 - Returns the query
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
 * @route GET /dashboard/applications-ratio
 * @group Dashboard
 * @returns {ApplicationRatio}   200 - Returns the query
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
 * @route GET /dashboard/avg-price-finder
 * @group Dashboard
 * @returns {number}   200 - Returns the avg price in finders
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
 * @route GET /dashboard/top-keywords
 * @group Dashboard
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
  const apiURL = `${apiPrefix}/dashboard`;
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
