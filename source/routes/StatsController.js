const Trip = require("../models/TripSchema");
const Application = require("../models/ApplicationSchema");
const Finder = require("../models/FinderSchema");
const { CheckAdmin } = require("../middlewares/Auth");

const computeStats = (samples) => {
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    return {
        min: Math.min.apply(null, samples),
        max: Math.max.apply(null, samples),
        avg,
        stdv: Math.sqrt(samples.reduce((a, v) => a + (v - avg) ** 2, 0) / samples.length),
    }
};

/**
 * The average, the minimum, the maximum, and the standard deviation of the
 * number of trips managed per manager
 * @route GET /stats/trips-per-manager
 * @group Stats
 * @returns {Results.model}   200 - Returns the query
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {} 404 - No results have been found
 * @returns {DarabaseError} 500 - Database error
 * @security bearerAuth
 */
const tripsPerManager = async (req, res) => {
    try {
        const docs = await Trip.aggregate([
            {
                $match: {
                    isPublished: true,
                    isCancelled: false,
                    endDate: {
                        $gte: new Date()
                    }
                }
            },
            {
                $group: {
                    _id: "$managerID",
                    count: { $sum: 1 }
                }
            }
        ]).exec();
        const data = docs.map(doc => doc.count);
        if (data.length > 0) {
            return res.status(200).json(computeStats(data));
        } else {
            return res.sendStatus(404);
        }
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
 * @security bearerAuth
 */
const applicationsPerTrip = async (req, res) => {
    try {
        const docs = await Application.aggregate([
            {
                $group: {
                    _id: "$tripId",
                    count: { $sum: 1 }
                }
            }
        ]).exec();
        const data = docs.map(doc => doc.count);
        if (data.length > 0) {
            return res.status(200).json(computeStats(data));
        } else {
            return res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * The average, the minimum, the maximum, and the
 * standard deviation of the
 * number of trips price per trips
 * @route GET /stats/price-per-trips
 * @group Stats
 * @returns {Results.model}   200 - Returns the query
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 * @security bearerAuth
 */
const pricePerTrips = async (req, res) => {
    try {
        const docs = await Trip.find({}).select("price").exec();
        const data = docs.map(doc => doc.price);
        if (data.length > 0) {
            return res.status(200).json(computeStats(data));
        } else {
            return res.sendStatus(404);
        }
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
 * @returns {} 404 - If there are no applications
 * @returns {DarabaseError} 500 - Database error
 * @security bearerAuth
 */
const applicationsRatio = async (req, res) => {
    try {
        const docs = await Application.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]).exec();

        if(docs.length === 0) return res.sendStatus(404);

        console.log(docs)
        const total = docs.reduce((a, doc) => a + doc.count, 0);
        const calcRatio = (status) => docs.find((doc) => doc._id === status).count / total * 100;
        
        res.status(200).json({
            pending: calcRatio("PENDING"),
            accepted: calcRatio("ACCEPTED"),
            rejected: calcRatio("REJECTED"),
            due: calcRatio("DUE"),
            cancelled: calcRatio("CANCELLED"),
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * The average price range that explorers indicate in their finders
 * @route GET /stats/avg-price-finder
 * @group Stats
 * @returns {AveragePriceRange.model}   200 - Returns the avg price in finders
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {} 404 - No finders have been found
 * @returns {DarabaseError} 500 - Database error
 * @security bearerAuth
 */
const avgPriceFinder = async (req, res) => {
    try {
        const docs = await Finder.find({}).select("minPrice maxPrice").exec();
        if(docs.length === 0) return res.sendStatus(404);
        const minPrice = docs.reduce((a, doc) => a + doc.minPrice, 0) / docs.length;
        const maxPrice = docs.reduce((a, doc) => a + doc.maxPrice, 0) / docs.length;
        return res.status(200).json({ minPrice, maxPrice });
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * The top 10 key words that the explorers indicate in their finders
 * @route GET /stats/top-keywords
 * @group Stats
 * @returns {Array<Keyword>}   200 - Returns the top 10 searched keywords
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 * @security bearerAuth
 */
const topTenKeywords = async (req, res) => {
    try {
        const docs = await Finder.aggregate([
            {
                $group: {
                    _id: "$keyword",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            { $limit: 10 }
        ]).exec();
        return res.status(200).json(docs.map(doc => ({ keyword: doc._id, count: doc.count })));
    } catch (err) {
        console.log(err);
        res.status(500).json({ reason: "Database error" });
    }
};

module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/stats`;
    router.get(`${apiURL}/trips-per-manager`, CheckAdmin, tripsPerManager);
    router.get(`${apiURL}/applications-per-trip`, CheckAdmin, applicationsPerTrip);
    router.get(`${apiURL}/price-per-trips`, CheckAdmin, pricePerTrips);
    router.get(`${apiURL}/applications-ratio`, CheckAdmin, applicationsRatio);
    router.get(`${apiURL}/avg-price-finder`, CheckAdmin, avgPriceFinder);
    router.get(`${apiURL}/top-keywords`, CheckAdmin, topTenKeywords);
};

/**
 * @typedef Results
 * @property {number} min - minimum
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
 * @typedef AveragePriceRange
 * @property {number} minPrice  - Minimum price range
 * @property {number} maxPrice  - Maximum price range
 */

/**
 * @typedef Keyword
 * @property {string} keyword - keyword
 * @property {number} count - count
 */
