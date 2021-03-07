const Application = require("../models/ApplicationSchema");

/**
 * Get a specific application for a explorer
 * @route GET /applications/{applicationId}
 * @group Applications - Application to a trip
 * @param {string} applicationId.path.required        - Application identifier
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
 * @route GET /applications/trips/{tripId}
 * @group Applications - Application to a trip
 * @param {string} tripId.path.required       - Trip identifier
 * @returns {Array.<Application>}         200 - Returns the requested application
 * @returns {}                            401 - User is not authorized to perform this operation
 * @returns {DatabaseError}               500 - Database error
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
 * @route GET /applications/explorers/{explorerId}
 * @group Applications - Application to a trip
 * @param {string} explorerId.path.required - Explorer identifier
 * @param {string} status.query             - Status
 * @returns {Array.<Application>}       200 - Returns the requested application
 * @returns {}                          401 - User is not authorized to perform this operation
 * @returns {DatabaseError}             500 - Database error
 */
const getAllByExplorerId = (req, res) => {
  console.log(Date() + "-GET /applications/explorers/explorerId");
  let status = "PENDING"
  const possibleStatus = ['PENDING', 'REJECTED', 'DUE', 'ACCEPTED', 'CANCELLED']
  if (possibleStatus.includes(req.query.status)) {
    status = req.query.status
  } else {
    res.status(400).json("Not valid status submitted")
  }

  Application.find({ explorerId: req.params.explorerId, status: status })
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
const createOne = async (req, res) => {
  // Necesita explorerID autenticado
  console.log(Date() + "-POST /applications");
  try {
    const doc = await new Application(req.body).save();
    res.status(200).send(doc._id);
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

/**
 * Explorer cancel an application
 * @route PUT /applications/explorers/{applicationId}
 * @group Applications - Application to a trip
 * @param {ApplicationPutExplorer.model} application.body.required  - Application updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const explorerCancel = (req, res) => {
  console.log(Date() + "-PUT /applications - Explorer CANCEL");
  // Puede recibir explorerId autenticado, para pasarla de ACCEPTED/PENDING a CANCELLED
  Application.findById(req.body.applicationId, async function (err, application) {
    if (err) {
      res.send(err);
    }
    else {
      if (application.status === "PENDING" || application.status === "ACCEPTED") {
        let doc = await Application.findOneAndUpdate(req.body.applicationId, { status: "CANCELLED" }, function (err, applicationUpdated) {
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
 * @route PUT /applications/{applicationId}
 * @group Applications - Application to a trip
 * @param {string} applicationId.path.required           - Application identifier
 * @param {Application.model} application.body.required  - Finder updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const editOne = (req, res) => {
  // Necesita managerId autenticado, _id
  console.log(Date() + "-PUT /applications");
  Application.findOneAndUpdate({ _id: req.params.applicationId }, req.body)
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
 * @route PUT /applications/managers/{applicationId}
 * @group Applications - Application to a trip
 * @param {string} applicationId.path.required                     - Application identifier
 * @param {ApplicationPutManager.model} application.body.required  - Application updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const managerUpdate = (req, res) => {
  // Necesita managerId autenticado (Only managers can change), _id
  // Tambien recibe el estado al que cambia
  console.log(Date() + "-PUT /applications - Manager update");

  let newStatus = "REJECTED"
  const possibleStatus = ['REJECTED', 'DUE']

  try {
    if (possibleStatus.includes(req.body.status)) {
      newStatus = req.body.status
    } else {
      throw "STATUS"
    }

    Application.findById(req.params.applicationId, async function (err, application) {
      if (err) {
        res.send(err);
      }
      else {
        if (application.status === "PENDING") {
          let doc = await Application.findOneAndUpdate({ _id: req.params.applicationId }, { status: newStatus, rejectReason: (newStatus === "REJECTED" && req.body.rejectReason) ? req.body.rejectReason : "" }, function (err, applicationUpdated) {
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
  }
  catch (err) {
    if (err === "STATUS") {
      res.status(400).json("Not valid status submitted")
    } else {
      res.status(400).json("Database error")
    }
  }
};


/**
 * Delete an existing application for a specific explorer
 * @route DELETE /applications/{applicationId}
 * @group Applications - Application to a trip
 * @param {string} applicationId.path.required        - Application identifier
 * @returns {Application}           200 - Returns the deleted application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = async(req, res) => {
  // Necesita explorerID autenticado, _id
  try {
    const doc = await Application.findOneAndDelete({ _id: req.params.applicationId });
    if (doc) {
      return res.status(200).json(doc);
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.status(500).json({ reason: "Database error" });
  }
};

module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/applications`;
  router.get(apiURL + '/:applicationId', getOne);
  router.get(apiURL + '/trips/:tripId', getAllByTripId);
  router.get(apiURL + '/explorers/:explorerId', getAllByExplorerId);
  router.post(apiURL, createOne);
  router.put(apiURL, editOne);
  router.put(apiURL + '/explorers/:applicationId', explorerCancel);
  router.put(apiURL + '/managers/:applicationId', managerUpdate);
  router.delete(apiURL + '/:applicationId', deleteOne)
};

/**
 * @typedef Application
 * @property {string} createdAt                 - Creation Date
 * @property {string} rejectReason              - Reject Reason
 * @property {string} status                    - Status
 * @property {string} comments                  - Comments
 * @property {string} tripId                    - Trip to apply
 * @property {string} explorerId                - Explorer who applies
 */

/**
 * @typedef ApplicationPutExplorer
 * @property {string} applicationId.required  - ApplicationId
 */

/**
 * @typedef ApplicationPutManager
 * @property {string} status.required         - New status
 * @property {string} rejectReason            - New status
 */

/**
 * @typedef ApplicationPost
 * @property {string} comments                  - Comments
 * @property {string} tripId.required           - Trip to apply
 * @property {string} explorerId.required       - Explorer who applies
 */