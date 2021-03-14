const admin = require('firebase-admin');
const Actor = require("../models/ActorSchema");

module.exports.CheckAdmin = (req, res, next) => {
    const headerToken = req.headers.authorization;

    if(!isValidHeaderToken(headerToken)){
        return res.status(401).json({ message: "No token provided or invalid one" });
    }

    const idToken = headerToken.split(" ")[1];
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            var uid = decodedToken.uid; // email

            Actor.findOne({email: uid}, function(err, obj) { 
                if(err) {
                    return res.status(404).json({"error": "Actor not found"});
                }
                var loggedActor = obj;

                if(!loggedActor.roles.includes("ADMINISTRATOR")){
                    return res.status(403).json({ message: "You have to be an Admin" });
                }
                req.adminID = loggedActor._id;
                next()
            })
        })
        .catch(() => res.status(401).end())
};

module.exports.CheckSponsor = (req, res, next) => {
    const headerToken = req.headers.authorization;
  
    if(!isValidHeaderToken(headerToken)){
        return res.status(401).json({ message: "No token provided or invalid one" });
    }
    
    const idToken = headerToken.split(" ")[1];
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            var uid = decodedToken.uid; // email

            Actor.findOne({email: uid}, function(err, obj) { 
                if(err) {
                    return res.status(404).json({"error": "Actor not found"});
                }
                var loggedActor = obj;

                if(!loggedActor.roles.includes("SPONSOR")){
                    return res.status(403).json({ message: "You have to be a Sponsor" });
                }
                req.sponsorID = loggedActor._id;
                next()
            })
        })
        .catch(() => res.status(401).end())
};

module.exports.CheckExplorer = (req, res, next) => {
    const headerToken = req.headers.authorization;
  
    if(!isValidHeaderToken(headerToken)){
        return res.status(401).json({ message: "No token provided or invalid one" });
    }
    
    const idToken = headerToken.split(" ")[1];
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            var uid = decodedToken.uid; // email

            Actor.findOne({email: uid}, function(err, obj) { 
                if(err) {
                    return res.status(404).json({"error": "Actor not found"});
                }
                var loggedActor = obj;
                if(!loggedActor.roles.includes("EXPLORER")){
                    return res.status(403).json({ message: "You have to be an Explorer" });
                }
                req.explorerID = loggedActor._id;
                next()
            })
        })
        .catch(() => res.status(401).end())
};

module.exports.CheckManager = (req, res, next) => {
    const headerToken = req.headers.authorization;
  
    if(!isValidHeaderToken(headerToken)){
        return res.status(401).json({ message: "No token provided or invalid one" });
    }
    
    const idToken = headerToken.split(" ")[1];
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            var uid = decodedToken.uid; // email

            Actor.findOne({email: uid}, function(err, obj) { 
                if(err) {
                    return res.status(404).json({"error": "Actor not found"});
                }
                var loggedActor = obj;
                if(!loggedActor.roles.includes("MANAGER")){
                    return res.status(403).json({ message: "You have to be a Manager" });
                }
                req.managerID = loggedActor._id;
                next()
            })
        })
        .catch(() => res.status(401).end())
};


module.exports.CheckActor = (req, res, next) => {
    const headerToken = req.headers.authorization;
  
    if(!isValidHeaderToken(headerToken)){
        return res.status(401).json({ message: "No token provided or invalid one" });
    }
    
    const idToken = headerToken.split(" ")[1];
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            var uid = decodedToken.uid; // email

            Actor.findOne({email: uid}, function(err, obj) { 
                if(err) {
                    return res.status(404).json({"error": "Actor not found"});
                }
                var loggedActor = obj;
                req.actorID = loggedActor._id;
                next()
            })
        })
        .catch(() => res.status(401).end())
};

function isValidHeaderToken(headerToken) {
    var res = true;
    if(!headerToken) {
        res = false;
      }
    
    if(headerToken && headerToken.split(" ")[0] !== "Bearer") {
        res = false;
    }
    return res;
}

module.exports.CheckIsAuthenticated = (req, res, next) => {
  const headerToken = req.headers.authorization;

  if(!isValidHeaderToken(headerToken)) {
    return res.status(401).json({ message: "No token provided or invalid one" });
  }

  const idToken = headerToken.split(" ")[1];
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(() => next())
    .catch(() => res.status(403).json({ message: "Could not authorize" }));
}

