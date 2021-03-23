const Actor = require('../models/ActorSchema');
const Bcrypt = require("bcryptjs");
const admin = require('firebase-admin');
var getIdToken = require('../firebase/getIdToken')
/**
 * @route POST /auth/login
 * @group Authentication - login/logout
 * @param {Login.model} login.body.required  - Email and paswword
 * @returns {object}        200 - Logged user info and token
 * @returns {Error}         400 - Error while logging user
 * @returns {DatabaseError} 500 - Database error
 */
 const login = async (req, res) => {

    const { email, password } = req.body;
    try { 
        const actor = await Actor.findOne({email});

        if(!actor){
            return res.status(400).json( {err:"Invalid login. User not found"} );
        }

        if(actor.isBanned){
            return res.status(409).json({err:"User is banned"});
        }

        const isMatched = await Bcrypt.compare(password, actor.password);

        if(!isMatched){
            return res.status(400).json( {err:"Incorrect password"} );
        }

        try {
            var customToken = await admin.auth().createCustomToken(actor.email);
          } catch (err){
            return res.status(500).json({ error:err });
        }

        res.status(200).json({ actor:actor, customToken:customToken });

    } catch(err){
        res.status(500).json({err:err});
    }
};

/**
 * @route GET /auth/custom/{customToken}
 * @group Authentication - login/logout
 * @param {string} customToken.path.required - Firebase custom token
 * @returns {object} 200 - Firebase Id token
 * @returns {Error}  401 - Error while checking token
 */
 const getIdTokenByCustomToken = async (req, res) => {
    const customToken = req.params.customToken;
    if(!customToken){
        return res.status(401);
    }
    try {
        idToken = await getIdToken.getIdToken(customToken);
        if(!idToken){
            return res.status(401).json({"err":"No token found"});
        } 
        res.status(200).json({"idToken":idToken});
    } catch(err) {
        res.status(401).json({err:err});
    }
};


/**
 * @route GET /auth/id/{idToken}
 * @group Authentication - login/logout
 * @param {string} idToken.path.required - Firebase Id token
 * @returns {object} 200 - Authenticated user
 * @returns {Error}  401 - Error while checking token
 */
 const getActorByIdToken = async (req, res) => {

    const idToken = req.params.idToken;

    if(!idToken){
        return res.status(401);
    }
    //Verificación del token
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            var uid = decodedToken.uid; //el uid en este caso es el email

            Actor.findOne({email: uid}, function(err, obj) { 
                if(err) {
                    return res.status(401).json({err:err});
                }
                var actor = obj;
                return res.status(201).json({"actor": actor});
            });
            
        })
        .catch((err) => {
            return res.status(401).json({ err:err.message});
        });
};


module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/auth`;
    router.post(apiURL+'/login', login);
    router.get(apiURL+'/id/:idToken', getActorByIdToken);
    router.get(apiURL+'/custom/:customToken', getIdTokenByCustomToken);
  };



 /**
 * @typedef Login
 * @property {string} email.required
 * @property {string} password.required
 */