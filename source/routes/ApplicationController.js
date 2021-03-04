const Application = require("../models/ApplicationSchema");

/**
 * Get a specific application for a explorer
 * @route GET /applications
 * @group Applications - Application to a trip
 * @param {string} id.path              - Application identifier
 * @returns {Array.<Application>}   200 - Returns the requested application
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getOne = (req, res) => {
  // Necesita explorerID autenticado
  console.log(Date() + "-GET /applications");

  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      res.send(err);
    }
    else {
      res.json(application);
    }
  });
};

/**
 * Find applications by Trip
 * @route GET /applications/trips
 * @group Applications - Application to a trip
 * @param {string} id.path              - Trip identifier
 * @returns {Array.<Application>}   200 - Returns the requested application
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getAllByTripId = (req, res) => {
  console.log(Date() + "-GET /applications/trips/tripId");

  Application.find({ tripId: req.params.tripId })
    .lean()
    .exec(function (err, applications) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(applications);
      }
    });
};

/**
 * Find applications by explorer and status
 * @route GET /applications/explorers
 * @group Applications - Application to a trip
 * @param {string} id.path              - Explorer identifier
 * @returns {Array.<Application>}   200 - Returns the requested application
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getAllByExplorerId = (req, res) => {
  console.log(Date() + "-GET /applications/explorers/explorerId");

  Application.find({ explorerId: req.params.explorerId, status: req.body.status })
    .lean()
    .exec(function (err, applications) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(applications);
      }
    });
};

/**
 * Create a new application for a specific explorer
 * @route POST /applications
 * @group Applications - Application to a trip
 * @param {ApplicationPost.model} application.body.required  - New application
 * @returns {string}                200 - Returns the application identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const createOne = (req, res) => {
  // Necesita explorerID autenticado
  console.log(Date() + "-POST /applications");
  const doc = new Application(req.body.application).save();
  return res.status(201).send(doc);
};

/**
 * Explorer cancel an application
 * @route PUT /applications
 * @group Applications - Application to a trip
 * @param {ApplicationPut.model} application.body.required  - Application updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const explorerCancel = (req, res) => {
  console.log(Date() + "-PUT /applications - Explorer CANCEL");
  // Puede recibir explorerId autenticado, para pasarla de ACCEPTED/PENDING a CANCELLED
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.send(err);
    }
    else {
      if (application.status === "PENDING" || application.status === "ACCEPTED") {
        let doc = await Application.findOneAndUpdate(req.params.applicationId, { status: "CANCELLED" }, function (err, applicationUpdated) {
          if (err) {
            res.send(err);
          }
        });
        res.send(doc);
      } else {
        res.status(400).json("This application can't be updated")
      }
    }
  });
};

/**
 * Update an existing application for a specific actor
 * @route PUT /applications
 * @group Finder - Find trips
 * @param {ApplicationPut.model} application.body.required  - Finder updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const editOne = (req, res) => {
  // Necesita managerId autenticado, _id
  console.log(Date() + "-PUT /applications");
  Application.findOneAndUpdate({ _id: req.body.application._id }, req.body.application)
    .then(doc => {
      if (doc) {
        return Application.findById(doc._id);
      } else {
        res.sendStatus(401);
      }
    })
    .then(doc => res.status(200).json(doc))
    .catch(err => res.status(500).json({ reason: "Database error" }));
};

/**
 * Manager update an application
 * @route PUT /applications
 * @group Applications - Application to a trip
 * @param {ApplicationPut.model} application.body.required  - Application updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const managerUpdate = (req, res) => {
  // Necesita managerId autenticado (Only managers can change), _id
  // Tambien recibe el estado al que cambia
  console.log(Date() + "-PUT /applications - Manager update");
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.send(err);
    }
    else {
      if (application.status === "PENDING") {
        let doc = await Application.findOneAndUpdate(req.params.applicationId, { status: req.body.status, rejectedReason: req.body.rejectedReason }, function (err, applicationUpdated) {
          if (err) {
            res.send(err);
          }
        });
        res.send(doc);
      } else {
        res.status(400).json("This application can't be updated")
      }
    }
  });
};


/**
 * Delete an existing application for a specific explorer
 * @route DELETE /applications
 * @group Applications - Application to a trip
 * @param {string} id.path.required     - Application identifier
 * @returns {Application}           200 - Returns the deleted application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = (req, res) => {
  // Necesita explorerID autenticado, _id
  Application.deleteOne({ _id: req.params.id }, function (err) {
    if (err) return handleError(err);
    res.status(200)
  });
};

module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/applications`;
  router.get(apiURL + '/:applicationId', getOne);
  router.get(apiURL + '/trips/:tripId', getAllByTripId);
  router.get(apiURL + '/explorers/:explorerId', getAllByExplorerId);
  router.post(apiURL, createOne);
  router.put(apiURL + '/:applicationId', editOne);
  router.put(apiURL + '/explorers/:applicationId', explorerCancel);
  router.put(apiURL + '/managers/:applicationId', managerUpdate);
  router.delete(apiURL + '/:applicationId', deleteOne)
};

/**
 * @typedef ApplicationPost
 * @property {Application.model} application - Application to add
 */

/**
 * @typedef ApplicationPut
 * @property {Application.model} application - Application to update
 */

/**
 * @typedef Application
 * @property {string} comments                  - Comments
 * @property {string} tripID.required           - Trip to apply
 */