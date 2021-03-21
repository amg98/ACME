const Application = require("../models/ApplicationSchema");
const Trip = require("../models/TripSchema");

const { CheckExplorer, CheckManager } = require("../middlewares/Auth");

/**
 * Get a specific application for a explorer
 * @route GET /applications/{id}
 * @group Applications - Application to a trip
 * @param {string} id.path.required        - Application identifier
 * @returns {Array.<Application>}   200 - Returns the requested application
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Application not found
 * @returns {DatabaseError}         500 - Database error
 */
const getOne = async(req, res) => {
  console.log(Date() + "-GET /applications");

  const doc = await Application.findById(req.params.id);
  if(doc) {
      return res.status(200).send(doc);
  } else {
      return res.status(404).send("Application not found");
  }
};

/**
 * Find applications by Trip
 * @route GET /applications/trips/{id}
 * @group Applications - Application to a trip
 * @param {string} id.path.required       - Trip identifier
 * @returns {Array.<Application>}         200 - Returns the requested application
 * @returns {}                            401 - User is not authorized to perform this operation
 * @returns {DatabaseError}               500 - Database error
 */
const getAllByTripId = (req, res) => {
  console.log(Date() + "-GET /applications/trips/id");

  Application.find({ tripID: req.params.id })
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
 * @route GET /applications/explorers/{id}
 * @group Applications - Application to a trip
 * @param {string} id.path.required - Explorer identifier
 * @param {string} status.query             - Status
 * @returns {Array.<Application>}       200 - Returns the requested application
 * @returns {}                          401 - User is not authorized to perform this operation
 * @returns {DatabaseError}             500 - Database error
 */
const getAllByExplorerId = (req, res) => {
  console.log(Date() + "-GET /applications/explorers/id");
  let status = "PENDING"
  const possibleStatus = ['PENDING', 'REJECTED', 'DUE', 'ACCEPTED', 'CANCELLED']
  if (possibleStatus.includes(req.query.status)) {
    status = req.query.status
  } else {
    return res.status(400).json("Not valid status submitted")
  }

  Application.find({ explorerID: req.params.id, status: status })
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
  console.log(Date() + "-POST /applications");
  try {
    const trip = await Trip.findById(req.body.tripID);
    if(trip){
      if(trip.startDate <= new Date() || !trip.isPublished)
        throw "InvalidTrip"
    }else{
      throw "NoTrip"
    }
    const doc = await new Application(req.body).save();
    res.status(200).send(doc._id);
  } catch (err) {
    if(err === "NoTrip"){
      res.status(500).json({ reason: "Trip not found" });
    }else if(err === "InvalidTrip"){
      res.status(500).json({ reason: "Invalid Trip" });
    }else{
      res.status(500).json({ reason: "Database error" });
    }
  }
};

/**
 * Explorer cancel an application
 * @route PUT /applications/{id}/cancel
 * @group Applications - Application to a trip
 * @param {string} id.path.required        - Application identifier
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Application not found
 * @returns {DatabaseError}         500 - Database error
 */
const explorerCancel = async(req, res) => {
  console.log(Date() + "-PUT /applications - Explorer CANCEL");

  let doc = await Application.findById(req.params.id);
  if (doc) {
    Application.findById(req.params.id, async function (err, application) {
      if (err) {
        res.send(err);
      }
      else {
        if (application.status === "PENDING" || application.status === "ACCEPTED") {
          let doc = await Application.findOneAndUpdate(req.params.id, { status: "CANCELLED" }, function (err, applicationUpdated) {
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
  }else{
    return res.status(404).send("Application not found");
  }
};

/**
 * Update an existing application for a specific actor
 * @route PUT /applications/{id}
 * @group Applications - Application to a trip
 * @param {string} id.path.required           - Application identifier
 * @param {Application.model} application.body.required  - Finder updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const editOne = (req, res) => {
  console.log(Date() + "-PUT /applications");
  Application.findOneAndUpdate({ _id: req.params.id }, req.body)
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
 * @route PUT /applications/{id}/update
 * @group Applications - Application to a trip
 * @param {string} id.path.required                                - Application identifier
 * @param {ApplicationPutManager.model} application.body.required  - Application updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Application not found
 * @returns {DatabaseError}         500 - Database error
 */
const managerUpdate = async(req, res) => {
  console.log(Date() + "-PUT /applications - Manager update");

  let newStatus = "REJECTED"
  const possibleStatus = ['REJECTED', 'DUE']

  try {
    if (possibleStatus.includes(req.body.status)) {
      newStatus = req.body.status
    } else {
      throw "WrongStatus"
    }

    const doc = await Application.findById(req.params.id);
    if(doc) {
      Application.findById(req.params.id, async function (err, application) {
        if (err) {
          res.send(err);
        }
        else {
          if (application.status === "PENDING") {
            let doc = await Application.findOneAndUpdate({ _id: req.params.id }, { status: newStatus, rejectReason: (newStatus === "REJECTED" && req.body.rejectReason) ? req.body.rejectReason : "" }, function (err, applicationUpdated) {
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
    } else {
        return res.status(404).send("Application not found");
    }
  }
  catch (err) {
    if (err === "WrongStatus") {
      res.status(400).json("Not valid status submitted")
    } else {
      res.status(400).json("Database error")
    }
  }
};


/**
 * Delete an existing application for a specific explorer
 * @route DELETE /applications/{applicationID}
 * @group Applications - Application to a trip
 * @param {string} applicationID.path.required        - Application identifier
 * @returns {Application}           200 - Returns the deleted application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = async(req, res) => {
  try {
    const doc = await Application.findOneAndDelete({ _id: req.params.applicationID });
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
  router.get(apiURL + '/:id',
    CheckExplorer,
    getOne);
  router.get(apiURL + '/trips/:id',
    CheckManager,
    getAllByTripId);
  router.get(apiURL + '/explorers/:id',
    CheckExplorer,
    getAllByExplorerId);
  router.post(apiURL,
    CheckExplorer,
    createOne);
  router.put(apiURL,
    CheckExplorer,
    editOne);
  router.put(apiURL + '/:id/cancel',
    CheckExplorer,
    explorerCancel);
  router.put(apiURL + '/:id/update',
    /*CheckManager,*/
    managerUpdate);
  router.delete(apiURL + '/:id',
    CheckExplorer,
    deleteOne)
};

/**
 * @typedef Application
 * @property {string} createdAt                 - Creation Date
 * @property {string} rejectReason              - Reject Reason
 * @property {string} status                    - Status
 * @property {string} comments                  - Comments
 * @property {string} tripID                    - Trip to apply
 * @property {string} explorerID                - Explorer who applies
 */


/**
 * @typedef ApplicationPutManager
 * @property {string} status.required         - New status
 * @property {string} rejectReason            - New status
 */

/**
 * @typedef ApplicationPost
 * @property {string} comments                  - Comments
 * @property {string} tripID.required           - Trip to apply
 * @property {string} explorerID.required       - Explorer who applies
 */