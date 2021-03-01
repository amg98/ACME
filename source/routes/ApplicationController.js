const Application = require("../models/ApplicationSchema");


/**
 * Get a specific application for a explorer
 * @route GET /application
 * @group Applications - Application to a trip
 * @param {string} id.path              - Application identifier
 * @returns {Array.<Application>}   200 - Returns the requested application
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getOne = (req, res) => {
  // Necesita explorerID autenticado
  console.log(Date() + "-GET /application");

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
 * @route GET /application/trip
 * @group Applications - Application to a trip
 * @param {string} id.path              - Trip identifier
 * @returns {Array.<Application>}   200 - Returns the requested application
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getAllByTripId = (req, res) => {
  console.log(Date() + "-GET /application/trip/tripId");

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
 * @route GET /application/explorer
 * @group Applications - Application to a trip
 * @param {string} id.path              - Explorer identifier
 * @returns {Array.<Application>}   200 - Returns the requested application
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getAllByExplorerId = (req, res) => {
  console.log(Date() + "-GET /application/explorer/explorerId");

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
 * @route POST /application
 * @group Applications - Application to a trip
 * @param {ApplicationPost.model} application.body.required  - New application
 * @returns {string}                200 - Returns the application identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const createOne = (req, res) => {
  // Necesita explorerID autenticado
  console.log(Date() + "-POST /application");
  const doc = new Application(req.body.application).save();
  return res.status(201).send(doc);
};

/**
 * Explorer cancel an application
 * @route PUT /application
 * @group Applications - Application to a trip
 * @param {ApplicationPut.model} application.body.required  - Application updates
 * @returns {Application}           200 - Returns the current state for this application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const explorerCancel = (req, res) => {
  console.log(Date() + "-PUT /application - Explorer CANCEL");
  // Puede recibir explorerId autenticado, para pasarla de ACCEPTED/PENDING a CANCELLED
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.send(err);
    }
    else {
      if(application.status === "PENDING" || application.status === "ACCEPTED"){
        let doc = await Application.findOneAndUpdate(req.params.applicationId,{status:"CANCELLED"}, function (err, applicationUpdated) {
          if (err) {
            res.send(err);
          }
        });
        res.send(doc);
      }else{
        res.status(400).json("This application can't be updated")
      }
    }
  });
};

/**
 * Manager update an application
 * @route PUT /application
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
  console.log(Date() + "-PUT /application - Manager update");
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.send(err);
    }
    else {
      if(application.status === "PENDING"){
        let doc = await Application.findOneAndUpdate(req.params.applicationId,{status: req.body.status}, function (err, applicationUpdated) {
          if (err) {
            res.send(err);
          }
        });
        res.send(doc);
      }else{
        res.status(400).json("This application can't be updated")
      }
    }
  });
};


/**
 * Delete an existing application for a specific explorer
 * @route DELETE /application
 * @group Applications - Application to a trip
 * @param {string} id.path.required     - Application identifier
 * @returns {Application}           200 - Returns the deleted application
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = (req, res) => {
  // Necesita explorerID autenticado, _id
};

module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/application`;
  router.get(apiURL + '/:applicationId', getOne);
  router.get(apiURL + '/trip/:tripId', getAllByTripId);
  router.get(apiURL + '/explorer/:explorerId', getAllByExplorerId);
  router.post(apiURL, createOne);
  router.put(apiURL + '/explorer/:applicationId', explorerCancel);
  router.put(apiURL + '/manager/:applicationId', managerUpdate);
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
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {string} status                    - Status
 * @property {string} comments                   - Comments
 * @property {string} tripID.required           - Trip to apply
 * @property {string} createdAt                 - Creation date
 */