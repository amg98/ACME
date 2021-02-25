const Application = require("../models/ApplicationSchema");


class ApplicationController {
  /**
   * Get a specific application for a explorer
   * @route GET /applications
   * @group Applications - Application to a trip
   * @param {string} id.path              - Application identifier
   * @returns {Array.<Application>}   200 - Returns the requested application
   * @returns {}                      401 - User is not authorized to perform this operation
   * @returns {DatabaseError}         500 - Database error
   */
  getOne(req, res){
      // Necesita explorerID autenticado
      console.log(Date() + "-GET /applications");
      const applicationId = req.query.applicationId;

      if (applicationId) {
        Application.findOne({ _id: applicationId, deleted: false }).exec(function (
          err,
          application
        ) {
          if (application) {
            res.send(product);
          } else {
            throw "Database error";
          }
        });
      }
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
  createOne(req, res){
      // Necesita explorerID autenticado
      console.log(Date() + "-POST /applications");
      const doc = new Application(req.body.application).save();
      return res.status(201).send(doc);
  };

  /**
   * Update an existing application for a specific explorer
   * @route PUT /applications
   * @group Applications - Application to a trip
   * @param {ApplicationPut.model} application.body.required  - Application updates
   * @returns {Application}           200 - Returns the current state for this application
   * @returns {ValidationError}       400 - Supplied parameters are invalid
   * @returns {}                      401 - User is not authorized to perform this operation
   * @returns {DatabaseError}         500 - Database error
   */
  editOne(req, res){
      // Necesita explorerID autenticado, _id
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
  deleteOne(req, res){
      // Necesita explorerID autenticado, _id
  };

  constructor(apiPrefix, router){
    const route = `${apiPrefix}/applications`;
    router.get(route, this.getOne.bind(this));
    router.post(route, this.createOne.bind(this));
    router.put(route, this.editOne.bind(this));
    router.delete(route, this.deleteOne.bind(this));
  }

}
module.exports = ApplicationController;

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