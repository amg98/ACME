const Trip = require("../models/TripSchema");
const Validators = require("../middlewares/Validators");
const { CheckManager } = require("../middlewares/Auth");
const RandExp = require("randexp");
/**
 * Get list of published trip
 * @route GET /trips
 * @group Trip - Trip
 * @returns {Array.<Trip>}   200 - Returns published Trips
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const getTrips = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ isPublished: true }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Get list of looged manager trips
 * @route GET /trips/logged
 * @group Trip - Trip
 * @returns {Array.<Trip>}   200 - Returns published Trips
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const getMyTrips = async (req, res) => {
  try {
    let docs;
    docs = await Trip.find({ managerID: req.managerID }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Get one public trip by id
 * @route GET /trips/display/{id}
 * @group Trip - Trip
 * @param {string} id.path.required - Trip identifier
 * @returns {Trip}   200 - Return selected trip
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const getTrip = async (req, res) => {
  try {
    const doc = await Trip.findOne({
      _id: req.params.id,
      isPublished: true,
    }).exec();
    if (doc) {
      return res.status(200).json(doc);
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Get trip by id
 * @route GET /trips/display/manager/{id}
 * @group Trip - Trip
 * @param {string} id.path.required - Trip identifier
 * @returns {Trip}   200 - Return selected trip
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const getMyTrip = async (req, res) => {
  try {
    const doc = await Trip.findOne({
      _id: req.params.id,
      managerID: req.managerID,
    }).exec();
    if (doc) {
      return res.status(200).json(doc);
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Search trips by title, desc or ticker
 * @route GET /trips/search/{keyword}
 * @group Trip - Trip
 * @param {string} keyword.path.required - Keyword contained wether in ticker, title or desc.
 * @returns {Array.<Trip>}   200 - Returns Trips matching parameters
 * @returns {} 401 - User is not authorized to perform this operation
 * @returns {DarabaseError} 500 - Database error
 */
const searchTrips = async (req, res) => {
  let re = new RegExp(`.*${req.params.keyword}.*`, "i");

  try {
    let docs;
    docs = await Trip.find({
      isPublished: true,
      $or: [{ title: re }, { description: re }, { ticker: re }],
    }).exec();
    return res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
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
  delete req.body.trip.price;
  delete req.body.trip.cancelReason;
  req.body.trip.managerID = req.managerID;

  req.body.trip.ticker = generateTicker();

  try {
    const doc = await new Trip(req.body.trip).save();
    res.status(200).send(doc);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Update trip
 * @route PUT /trips/{id}
 * @group Trip - Trip
 * @param {TripUpdate.model} trip.path.required  - Trip updates
 * @returns {Trip.model}                200 - Returns the created trip
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const updateTrip = async (req, res) => {
  delete req.body.trip.isPublished;
  delete req.body.trip.isCancelled;
  delete req.body.trip.cancelReason;
  delete req.body.trip.ticker;
  delete req.body.trip.managerID;

  req.body.trip.price = req.body.trip.stages.reduce(function (acc, val) {
    return acc + val.price;
  }, 0);

  try {
    let doc = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        managerID: req.managerID,
      },
      req.body.trip
    );
    if (doc) {
      doc = await Trip.findById(doc._id);
      return res.status(200).json(doc);
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Delete an existing trip not published yet
 * @route DELETE /trips/{id}
 * @group Trip - Trip
 * @param {string} id.path.required     - Trip identifier
 * @returns {Trip.model}           200 - Returns the deleted trip
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteTrip = async (req, res) => {
  try {
    const doc = await Trip.findOneAndDelete({
      _id: req.params.id,
      managerID: req.managerID,
      isPublished: false,
    });
    if (doc) {
      return res.status(200).json(doc);
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Cancel trip as long as is not published, started and free from applications
 * @route PUT /trips/cancel/{id}
 * @group Trip - Trip
 * @returns {Trip.model}                200 - Returns the created trip
 * @param {string} id.path.required     - Trip identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const cancelTrip = async (req, res) => {
  try {
    let doc = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        managerID: req.managerID,
        isPublished: true,
        cancelReason: "",
        startDate: { $gte: Date.now() },
      },
      { isCancelled: true, cancelReason: req.body.cancelReason }
    );
    if (doc) {
      doc = await Trip.findById(req.params.id);
      return res.status(200).json(doc);
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Publish trip
 * @route PUT /trips/publish/{id}
 * @group Trip - Trip
 * @returns {Trip.model}                200 - Returns the created trip
 * @param {string} id.path.required     - Trip identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const publishTrip = async (req, res) => {
  try {
    let doc = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        managerID: req.managerID,
        startDate: { $gte: Date.now() },
      },
      { isPublished: true }
    );
    if (doc) {
      doc = await Trip.findById(req.params.id);
      return res.status(200).json(doc);
    } else {
      return res.sendStatus(401);
    }
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
  router.get(apiURL, getTrips);
  router.get(
    `${apiURL}/search/:keyword?`,
    Validators.Required("params", "keyword"),
    searchTrips
  );
  router.get(`${apiURL}/logged`, CheckManager, getMyTrips);
  router.get(
    `${apiURL}/display/:id?`,
    Validators.Required("params", "id"),
    getTrip
  );
  router.get(
    `${apiURL}/display/manager/:id?`,
    CheckManager,
    Validators.Required("params", "id"),
    getMyTrip
  );
  router.post(
    apiURL,
    CheckManager,
    Validators.Required("body", "trip"),
    Validators.CheckDates("body", "trip"),
    createTrip
  );
  router.put(
    `${apiURL}/:id?`,
    CheckManager,
    Validators.Required("params", "id"),
    Validators.Required("body", "trip"),
    Validators.CheckDates("body", "trip"),
    Validators.CheckNotPublished(),
    updateTrip
  );
  router.delete(
    `${apiURL}/:id?`,
    CheckManager,
    Validators.Required("params", "id"),
    Validators.CheckNotPublished(),
    deleteTrip
  );
  router.put(
    `${apiURL}/cancel/:id?`,
    CheckManager,
    Validators.Required("params", "id"),
    Validators.Required("body", "cancelReason"),
    Validators.CheckNotStarted(),
    Validators.CheckNoApplicationsAttached(),
    cancelTrip
  );
  router.put(
    `${apiURL}/publish/:id?`,
    CheckManager,
    Validators.Required("params", "id"),
    publishTrip
  );
};

/**
 * @typedef TripPost
 * @property {Trip.model} trip - Trip to add
 */

/**
 * @typedef TripUpdate
 * @property {Trip.model} trip - Trip to update
 * @property {string} managerID.required - id's manager of the trip
 */

/**
 * @typedef Stage
 * @property {string}       title.required
 * @property {string}       description.required
 * @property {number}       price.required
 */

/**
 * @typedef Trip
 * @property {string}        _id
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
 * @property {number}  price
 * @property {Array.<Stage>} stages.required
 * @property {string} sponsorBannerURL          - Only in /trips/display resource
 * @property {string} sponsorLandingPageURL     - Only in /trips/display resource
 */
