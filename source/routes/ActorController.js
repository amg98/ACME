const Actor = require("../models/ActorSchema");
const Validators = require("../middlewares/Validators");
const { CheckAdmin } = require("../middlewares/Auth");
/**
 * Get an actor
 * @route GET /actors
 * @group Actors - System users
 * @param {string} id.path              - Actor identifier
 * @returns {Actor.model}           200 - Returns the requested actor
 * @returns {DatabaseError}         500 - Database error
 */
const getActor = (req, res) => {
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
 * @param {ActorPost.model} actor.body.required  - New user
 * @returns {string}                     200 - Returns the new user
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const createActor = (req, res) => {
    // En caso de rol=Manager, necesita ser un administratorID autenticado
    // TODO
};

/**
 * Update personal data of an existing actor
 * @route PUT /actors
 * @group Actors - System users
 * @param {ActorPut.model} actor.body.required  - Actor personal data updates
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const updateActor = (req, res) => {
    // Necesita un actorID autenticado, _id
    // TODO
};

/**
 * Ban an actor
 * @route PUT /actors/ban
 * @group Actors - System users
 * @param {ActorPut.model} actor.body.required  - Actor updates
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const banActor = (req, res) => {
    // Necesita un administratorID autenticado, _id
    // TODO
};

/**
 * Unban an actor
 * @route PUT /actors/unban
 * @group Actors - System users
 * @param {ActorPut.model} actor.body.required  - Actor updates
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const unbanActor = (req, res) => {
    // Necesita un administratorID autenticado, _id
    // TODO
};


module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/actors`;
  router.get(apiURL+'/:actorId', getActor);
  router.post(apiURL, Validators.Required("body", "actor"), createActor); //TODO Check if role=Manager then auth user has to be Admin
  router.put(apiURL+'/:actorId', Validators.Required("body", "actor"), updateActor);  //TODO Check for auth
  router.put(apiURL+'/:actorId', CheckAdmin, Validators.Required("body", "actor"), banActor);
  router.put(apiURL+'/:actorId', CheckAdmin, Validators.Required("body", "actor"), unbanActor);
};

/**
 * @typedef ActorPost
 * @property {Actor.model} actor - Actor to add
 */

/**
 * @typedef ActorPut
 * @property {Actor.model} actor - Actor to update
 */

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