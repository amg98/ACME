const Actor = require("../models/ActorSchema");
const Validators = require("../middlewares/Validators");
// const { CheckAdmin } = require("../middlewares/Auth");
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
const createActor = async (req, res) => {
  delete req.body.actor._id;
  try {
      const actor = await new Actor(req.body.actor).save();
      res.status(200).send(actor);
  } catch (err) {
      res.status(500).json({ reason: "Database error", err: err });
  }
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
const updateActor = async (req, res) => {
    // TODO Necesita un actorID autenticado
    try {
      let { name, surname, email, phoneNumber, address, password } = req.body.actor;
      let actor = await Actor.findOne({_id: req.body.actor._id});
  
      //Seteo de la contraseña original para evitar error de validación en la db cuando viene vacía
      if(!password) {
        password = actor.password
      }

      let doc = await Actor.updateOne(actor, {name, surname, email, phoneNumber, address, password}, { runValidators: true });
      if(doc) {
        doc = await Actor.findById(actor._id);
        return res.status(200).json({message: "Actor profile updated", actor:doc});
      } else {
          return res.sendStatus(401);
      }

  } catch (err) {
    console.log(err)
      res.status(500).json({reason: "Database error", err:err});
  }
};

/**
 * Ban/Unban an actor
 * @route PUT /actors/ban
 * @group Actors - System users
 * @param {ActorBan.model} isBanned.body.required  - New ban status
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           401 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const banActor = async (req, res) => {
    // TODO Necesita un administratorID autenticado, _id
    try {
      const actor = await Actor.findOne( {_id: req.params.actorId} );

      actor.isBanned = req.body.isBanned;
      const doc = await actor.save();

      if(doc) {
        return res.status(200).json({message: "Actor ban status updated", actor:doc});
      } else {
          return res.sendStatus(401);
      }

  } catch (err) {
      res.status(500).json({reason: "Database error", err:err});
  }
};



module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/actors`;
  router.get(apiURL+'/:actorId', getActor);
  router.post(apiURL, Validators.Required("body", "actor"), createActor); //TODO Check if role=Manager then auth user has to be Admin
  router.put(apiURL, Validators.Required("body", "actor"), updateActor);  //TODO Check for auth
  router.put(apiURL+'/:actorId/ban', banActor); //TODO Check for auth
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
 * @typedef ActorBan
 * @property {boolean} isBanned - Ban status to update
 */

 /**
 * @typedef Rol
 * @property {string} rolName.required          - User role (explorer, manager, sponsor, administrator)
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
 * @property {Array.<Rol>} roles.required       - User roles (explorer, manager, sponsor, administrator)
 */

