const Actor = require("../models/ActorSchema");

/**
 * Get an actor
 * @route GET /actors
 * @group Actors - System users
 * @param {string} id.path              - Actor identifier
 * @returns {Actor.model}           200 - Returns the requested actor
 * @returns {DatabaseError}         500 - Database error
 */
const get = (req, res) => {
    Actor.findById(req.params.actorId, function(err, actor) {
        if (err){
          res.send(err);
        }
        else {
          res.json(actor);
        }
      });
};

/**
 * Create a new user
 * @route POST /actors
 * @group Actors - System users
 * @param {Actor.model} actor.body.required  - New user
 * @returns {string}                     200 - Returns the new user
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const createOne = (req, res) => {
    // En caso de rol=Manager, necesita ser un administratorID autenticado
};

/**
 * Update personal data of an existing actor
 * @route PUT /actors
 * @group Actors - System users
 * @param {Actor.model} actor.body.required  - Actor personal data updates
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const editOne = (req, res) => {
    // Necesita un actorID autenticado, _id
};

/**
 * Ban an actor
 * @route PUT /actors/ban
 * @group Actors - System users
 * @param {Actor.model} actor.body.required  - Actor updates
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const banActor = (req, res) => {
    // Necesita un administratorID autenticado, _id
};

/**
 * Unban an actor
 * @route PUT /actors/unban
 * @group Actors - System users
 * @param {Actor.model} actor.body.required  - Actor updates
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const unbanActor = (req, res) => {
    // Necesita un administratorID autenticado, _id
};


module.exports.register = (apiPrefix, router) => {

};


/**
 * @typedef Actor
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {string} name.required             - User name
 * @property {string} surname.required          - User surname 
 * @property {string} email.required            - User email
 * @property {string} phoneNumber               - User phone number
 * @property {string} address                   - User address
 * @property {string} password.required         - User password
 * @property {boolean} isBanned.required        - Ban status (true/false)
 * @property {string} rol.required              - User role (explorer, manager, sponsor, administrator)
 */