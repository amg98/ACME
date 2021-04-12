const POI = require("../models/POISchema");
const Trip = require("../models/POISchema");
const Validators = require("../middlewares/Validators");
const { CheckActor, CheckAdmin, CheckManager } = require("../middlewares/Auth");

/**
 * Get all the POIs
 * @route GET /pois
 * @group POI - Point of interest
 * @returns {Array.<POI>}           200 - Returns all the POIs
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
const getAll = async(req, res) => {
    console.log(Date() + "-GET /pois");
    try {
        let doc = await POI.find().exec();
        return res.status(200).send(doc);
    } catch (err) {
        return res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Create a new POI
 * @route POST /pois
 * @group POI - Point of interest
 * @param {POI} poi.body.required       - New POI
 * @returns {string}                200 - Returns the POI identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */

const createOne = async (req, res) => {
    console.log(Date() + "-POST /pois");
    try {
      const doc = await new POI(req.body).save();
      return res.status(200).send(doc.id);
    } catch (err) {
      return res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Create a new POI
 * @route PUT /pois/{id}
 * @group POI - Point of interest
 * @param {string} id.path.required     - POI identifier
 * @param {POI} poi.body.required       - New POI
 * @returns {string}                200 - Returns the POI identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - POI not found
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */

 const editOne = async (req, res) => {
    console.log(Date() + "-POST /pois");
    try {
        let doc = await POI.findById(req.params.id);
        if(!doc) return res.status(404).send({ reason: "POI not found"});
        doc =  await POI.findOneAndUpdate({ _id: req.params.id }, req.body).exec();
        return res.status(200).send(doc);
    } catch (err) {
        return res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Delete an existing POI
 * @route DELETE /pois/{id}
 * @group POI - Point of interest
 * @param {string} id.path.required        - POI identifier
 * @returns {POI}           200 - Returns the deleted POI
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - POI not found
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
 const deleteOne = async(req, res) => {
    try {
      const doc = await POI.findOneAndDelete({ _id: req.params.id });
      if (doc) {
        return res.status(200).json(doc);
      } else {
        return res.status(404).json({reason: "POI not found"})
      }
    } catch (err) {
      res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Get all the POIs
 * @route GET /pois/dashboard
 * @group POI - Point of interest
 * @returns {Array.<POIType>}       200 - Returns all the POIs
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
 const getDashboard = async(req, res) => {
    console.log(Date() + "-GET /pois/dashboard");
    try {
        let doc = await POI.find().sort({type: -1}).exec();
        let types = doc.map(p => p.type);
        return res.status(200).send(types);
    } catch (err) {
        return res.status(500).json({ reason: "Database error" });
    }
};


/**
 * Assign POI to Stage
 * @route PUT /pois/{id}/assignStage
 * @group POI - Point of interest
 * @param {string} id.path.required              - POI identifier
 * @param {POIAssignation.model} poi.body.required  - Trip updates
 * @returns {Trip.model}                         200 - Returns the edited Trip
 * @returns {ValidationError}                    400 - Supplied parameters are invalid
 * @returns {}                                   401 - User is not authorized to perform this operation
 * @returns {}                                   404 - Trip not found
 * @returns {DatabaseError}                      500 - Database error
 * @security bearerAuth
 */
 const assignPOI = async (req, res) => {
    
    try {
        let doc = await Trip.findOne({
            id: req.body.tripID,
            managerID: req.body.managerID,
        }).exec();
        if (!doc) return res.status(404).json(doc);
        doc.stages[req.body.stageID].pois = req.params.id
        doc = await Trip.findOneAndUpdate(
        {
          _id: req.params.id,
          managerID: req.managerID,
        },
        doc
      );
      if (doc) {
        doc = await Trip.findById(doc._id);
        return res.status(200).json(doc);
      } else {
        return res.status(400).json({ reason: "Trip can't be updated" });
      }
    } catch (err) {
      return res.status(500).json({ reason: "Database error" });
    }
  };
  

module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/pois`;
    router.get(apiURL, 
        CheckActor,
        getAll);
    router.put(
        `${apiURL}/:id?/assignStage`,
        CheckManager,
        assignPOI);
    router.get(
        `${apiURL}/dashboard`, 
        CheckActor,
        getDashboard);
    router.post(
        `${apiURL}/:id?`,
        CheckAdmin,
        createOne);
    router.delete(
        `${apiURL}/:id?`,
        CheckAdmin,
        deleteOne);
    router.put(
        `${apiURL}/:id?`,
        CheckAdmin,
        editOne);
};

/**
 * @typedef POI
 * @property {string} title.required         - Title of the POI
 * @property {string} description.required   - Description of the POI
 * @property {string} coordinates            - Coordinates of the POI
 * @property {string} type                   - Type of the POI
*/

/**
 * @typedef POIType
 * @property {string} type                   - Type of the POI
*/

/**
 * @typedef POIAssignation
 * @property {string} tripID.required         - TripID
 * @property {string} stageID.required        - StageID
 * @property {string} managerID.required      - managerID
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
 */
