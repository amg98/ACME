const Actor = require("../models/ActorSchema");
const Validators = require("../middlewares/Validators");
const admin = require('firebase-admin');

const { CheckActor, CheckAdmin } = require("../middlewares/Auth");
/**
 * Get an actor
 * @route GET /actors/{actorId}
 * @group Actors - System users
 * @param {string} id.path              - Actor identifier
 * @returns {Actor.model}           200 - Returns the requested actor
 * @returns {DatabaseError}         404 - User not found
 */
const getActor = (req, res) => {
    Actor.findById(req.params.actorId, function(err, actor) {
        if (err){
          return res.status(404).json({"error":"Actor not found", code:err});
        }
        else {
          if(!actor){
            return res.status(404).json({"error":"Actor not found"});
          }
          res.status(200).json(actor);
        }
      });
};

/**
 * Create a new user
 * @route POST /actors
 * @group Actors - System users
 * @param {ActorPost.model} actor.body.required  - New user
 * @returns {string}                     200 - Returns the new user
 * @returns {}                           401 - Invalid token
 * @returns {}                           403 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 */
const createActor = async (req, res) => {
  delete req.body.actor._id;
  delete req.body.actor.isBanned;

  if(process.env.NODE_ENV != "development") {
    if(req.body.actor.roles.includes('ADMINISTRATOR')){
      return res.status(422).json({ err: "Can't create an admin user" });
    }
  }


  //Si hay alguien identificado, debe ser un 'ADMINISTRATOR'
  const headerToken = req.headers.authorization;

  if (!headerToken) {
    try {
      if(req.body.actor.roles.includes('MANAGER')) {
        return res.status(403).json({err: "Only administrators can create managers"});
      }
      const actor = await new Actor(req.body.actor).save();
      res.status(200).json({actor: actor});
    } catch (err) {
        res.status(500).json({ reason: "Database error", err: err });
    }
  } else {
      if (headerToken && headerToken.split(" ")[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid token" });
      }
      const idToken = headerToken.split(" ")[1];

      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          var uid = decodedToken.uid; //el uid en este caso es el email

          Actor.findOne({email: uid}, function(err, obj) { 
              var loggedActor = obj;
              if(!loggedActor.roles.includes('ADMINISTRATOR')){
                return res.status(403).json({err: "You must be an administrator"});
              }

              if(!req.body.actor.roles.includes('MANAGER')) {
                return res.status(422).json({err: "New user has to be a Manager"});
              }

              const actor = new Actor(req.body.actor);
              actor.save(function(err, doc){ 
                if(err){ 
                  res.status(500).json({ reason: "Database error", err: err }) 
                } 
                else { 
                  res.status(200).json(doc);
                } 
              });
          })
        })
        .catch(() => res.status(403).json({message: "Invalid token, could not authorize"}))
  }

};

/**
 * Update personal data of an existing actor
 * @route PUT /actors
 * @group Actors - System users
 * @param {ActorPut.model} actor.body.required  - Actor personal data updates
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           403 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 * @security bearerAuth
 */
const updateActor = async (req, res) => {
    try {
      let { name, surname, email, phoneNumber, address, password } = req.body.actor;

      if(req.body.actor._id != req.actorID) {
        return res.status(403).json({"error": "You are not allowed to edit this profile"})
      }
      let actor = await Actor.findOne({_id: req.actorID});
  
      //Seteo de la contraseña original para evitar error de validación en la db cuando viene vacía
      if(!password) {
        password = actor.password
      }

      let doc = await Actor.updateOne(actor, {name, surname, email, phoneNumber, address, password}, { runValidators: true });
      if(doc) {
        doc = await Actor.findById(actor._id);
        return res.status(200).json({message: "Actor profile updated", actor:doc});
      } else {
          return res.status(404).end();
      }

  } catch (err) {
      res.status(500).json({reason: "Database error", err:err});
  }
};

/**
 * Ban/Unban an actor
 * @route PUT /actors/{actorId}/ban
 * @group Actors - System users
 * @param {ActorBan.model} isBanned.body.required  - New ban status
 * @returns {Actor}                      200 - Returns the current state for this actor
 * @returns {}                           403 - User is not authorized to perform this operation
 * @returns {DatabaseError}              500 - Database error
 * @security bearerAuth
 */
const banActor = async (req, res) => {
    try {
      const actor = await Actor.findOne( {_id: req.params.actorId} );
      
      let loggedActor = await Actor.findOne({_id: req.adminID});

      if(!loggedActor.roles.includes("ADMINISTRATOR")){
        return res.status(403).json({ error: "You are not allowed to do this operation" });
      }

      actor.isBanned = req.body.isBanned;
      const doc = await actor.save();

      if(doc) {
        return res.status(200).json({message: "Actor ban status updated", actor:doc});
      } else {
        return res.status(404).end();
      }

  } catch (err) {
      res.status(500).json({reason: "Database error", err:err});
  }
};



module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/actors`;
  router.get(apiURL+'/:actorId', getActor);
  router.post(apiURL, Validators.Required("body", "actor"), createActor); 
  router.put(apiURL, Validators.Required("body", "actor"), CheckActor, updateActor);
  router.put(apiURL+'/:actorId/ban', CheckAdmin, banActor);
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

