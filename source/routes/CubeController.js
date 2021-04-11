const MonthCube = require("../models/MonthCubeSchema");
const YearCube = require("../models/YearCubeSchema");
const Actor = require("../models/ActorSchema");
const Application = require("../models/ApplicationSchema");
const Trip = require("../models/TripSchema");
const Validators = require("../middlewares/Validators");

const { CheckAdmin } = require("../middlewares/Auth");
const ActorSchema = require("../models/ActorSchema");
/**
 * Compute cubes for every explorer and every valid period (M01-M36, Y01-Y03)
 * @route POST /cubes
 * @group Cubes - Cubes computation
 * @returns {string}                                  200 - Returns the computed operation
 * @returns {}                                        401 - User is not authorized to perform this operation
 * @returns {DatabaseError}                           500 - Database error
 * @security bearerAuth
 */
 const computeCubes = async (req, res) => {

    var monthToYearMap = {12:1, 24:2, 36:3};
    var i, j;

    try {
      MonthCube.deleteMany({}, function(err, result) {
        if (err) {
          return res.status(500).json({"error":"Error deleting previous cubes"});
        }
      });
      YearCube.deleteMany({}, function(err, result) {
        if (err) {
          return res.status(500).json({"error":"Error deleting previous cubes"});
        }
      });

      for (i = 1; i < 37; i++) {

        var iMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - i, new Date().getDate());	
        var stringMonth = i.toString();

        // ¿Considerar timesTamp o updatedAt?
        const explorersTripsAndMonth = await Application.aggregate([
            { $match: { status: "ACCEPTED", timeStamp: { $gte: iMonthsAgo} } },
            
            { $group: { _id: "$explorerID", tripsIDs: { $push: "$tripID" } } },

            { $project: { _id: 1, tripsIDs: 1, month:stringMonth} }

        ]).exec(); 

        for (j = 0; j < explorersTripsAndMonth.length; j++) {
          var explorerID = explorersTripsAndMonth[j]._id;
          var tripsIDs = explorersTripsAndMonth[j].tripsIDs;
          var month = explorersTripsAndMonth[j].month;
          
          const cube = await Trip.aggregate([
            { $match: { _id: {$in: tripsIDs} } },

            { $group: { _id: 0, amount: { $sum: "$price" } } },

            { $project: { amount: 1, month: month, explorerID: explorerID }}

          ]).exec();
            
            //cube devuelve un array con un cubo (en caso de existir el agregado anterior)
            if (cube.length > 0) {
              const mCube = new MonthCube({amount: cube[0].amount, month: cube[0].month, explorerID: cube[0].explorerID});

              mCube.save(function(err, mCube) { 
                if (err) {
                  return res.status(500).json({ reason: "Database error", err: err });
                }
              });

              //Creación del yCube
              for (var month in monthToYearMap) {
                if(month == cube[0].month) {
                  const yCube = new YearCube({amount: cube[0].amount, year: monthToYearMap[month], explorerID: cube[0].explorerID});

                  yCube.save(function(err, yCube) { 
                    if (err) {
                      return res.status(500).json({ reason: "Database error", err: err });
                    }
                  });
                }
              }
            }
        }
        
      }

      return res.status(200).json({result:"Cubes computed succesfully."});

    } catch(err) {
      return res.status(500).json({ reason: "Database error", err: err });
    }

};


/**
 * Get the cube amount for given explorer and period
 * @route GET /cubes/{actorId}/period/{period}
 * @group Cubes - Cubes computation
 * @param {string} actorID.path.required          - Explorer identifier
 * @param {string} period.path.required           - Valid period (M01-M36 or Y01-Y03)
 * @returns {float}                           200 - Returns the amount for the requested cube
 * @returns {Error}                           400 - Invalid period format
 * @returns {Error}                           404 - Cube not found
 * @security bearerAuth
 */
 const getCube = (req, res) => {
  const period = req.params.period;
  const periodRegex = new RegExp("^[mM](0[1-9]|1[0-9]|2[0-9]|3[0-6])$|^[yY](0[1-3])$"); //(M01-M36 or Y01-Y03). Permitimos m/y minúsculas
  const isValidPeriod = periodRegex.test(period);

  if (!isValidPeriod) {
    return res.status(400).json({error: "Invalid period format"})
  }

  Actor.findById(req.params.actorId, function(err, actor) {
    
    if (err) {
      return res.status(404).json({"error":"Error while getting the user"});

    } else {
      if (!actor) {
        return res.status(404).json({"error":"Actor not found"});
      }

      if (period.startsWith('M') || period.startsWith('m')) {
        var monthNumber = parseInt(period.substring(1,3));

        MonthCube.findOne({explorerID: req.params.actorId, month: monthNumber}).sort({'computedOn': -1}).exec(function(err, monthCube) {
          if (err){
            return res.status(404).json({"error":"Cube not found", code:err});
          }
          else {
            if(!monthCube){
              return res.status(404).json({"error":"Cube was not computed"});
            }
  
            res.status(200).json({"Cube amount": monthCube.amount});
          }
  
        });
      } else {
        var yearNumber = period.substring(1,3);
        YearCube.findOne({explorerID: req.params.actorId, year: yearNumber}).sort({'computedOn': -1}).exec(function(err, yearCube) {
          if (err){
            return res.status(404).json({"error":"Cube not found", code:err});
          }
          else {
            if(!yearCube){
              return res.status(404).json({"error":"Cube was not computed"});
            }
  
            res.status(200).json({"Cube amount": yearCube.amount});
          }
        });
      } 
    }
  });
};


/**
 * Get the explorers that satisfy given period, money and condition
 * @route GET /cubes/explorers?period={period}&condition={condition}&amount={amount}
 * @group Cubes - Cubes computation
 * @param {string} period.path.required           - Valid period (M01-M36 or Y01-Y03)
 * @param {string} amount.path.required           - Amount of money to be evaluated by condition
 * @param {string} condition.path.required        - Valid condition to be evaluated: "eq" (=), "ne" (!=), "gt" (>), "gte" (>=), "lt" (<), "lte" (<=)
 * @returns {Array.<Actor>}                   200 - Returns the explorers that satisfy the condition
 * @returns {Error}                           400 - Invalid format query
 * @returns {DatabaseError}                   404 - Explorer not found
 * @security bearerAuth
 */
const getExplorersByConditionCube = async (req, res) => {
  const period = req.query.period;
  const condition = req.query.condition;
  const amount = req.query.amount;

  const possibleConditions = ["eq", "ne", "gt", "gte", "lt", "lte"];
  const periodRegex = new RegExp("^[mM](0[1-9]|1[0-9]|2[0-9]|3[0-6])$|^[yY](0[1-3])$"); //(M01-M36 or Y01-Y03) Permitimos m/y minúsculas
  const isValidPeriod = periodRegex.test(period);

  if (!possibleConditions.includes(condition)) {
    return res.status(400).json({error: "Invalid condition format"})
  }
  if (!isValidPeriod) {
    return res.status(400).json({error: "Invalid period format"})
  }
  if (isNaN(amount)) {
    return res.status(400).json({error: "Invalid amount format"})
  }

  var parsedCondition = {};
  parsedCondition["$"+condition] = parseInt(amount);

  if (period.startsWith('M') || period.startsWith('m')) {
    var monthNumber = parseInt(period.substring(1,3));

    MonthCube.aggregate([
      { $match: { amount: parsedCondition, month: monthNumber } }, 
      { $project: { _id: 0, explorerID: "$explorerID" }}
      
    ]).exec((err, explorersIDs) => {

      var onlyIDs = explorersIDs.map(e => e.explorerID);

      if (err) {
        return res.status(500).json({ reason: "Database error", reason: err });
      } else {
        ActorSchema.find().where('_id').in(onlyIDs).select("-password").exec((err, explorers) => {
          if (err) {
            return res.status(500).json({ reason: "Error finding explorers", reason: err });
          }    
          return res.status(200).json({explorers});
        });
        
      }
  });
    
  } else {
    var yearNumber = parseInt(period.substring(1,3));

    YearCube.aggregate([
      { $match: { amount: parsedCondition, year: yearNumber } }, 
      { $project: { _id: 0, explorerID: "$explorerID" }}
      
    ]).exec((err, explorersIDs) => {
      var onlyIDs = explorersIDs.map(e => e.explorerID);

      if (err) {
        return res.status(500).json({ reason: "Database error", reason: err });
      } else {
        ActorSchema.find().where('_id').in(onlyIDs).select("-password").exec((err, explorers) => {
          if (err) {
            return res.status(500).json({ reason: "Error finding explorers", reason: err });
          }    
          return res.status(200).json({explorers});
        });
        
      }
    })
  }
};


module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/cubes`;
  router.post(apiURL, CheckAdmin, computeCubes);
  router.get(apiURL+'/:actorId/period/:period', CheckAdmin, Validators.Required("params", "period"), getCube);
  router.get(apiURL+'/explorers', CheckAdmin, Validators.Required("query", "amount"), Validators.Required("query", "period"), 
                                                    Validators.Required("query", "condition"), getExplorersByConditionCube);
};

/**
 * @typedef MonthCube
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {integer} amount.required          - Amount of money spend on given months
 * @property {integer} month.required           - Number of months (1-36)
 * @property {string} actorID.required          - Explorer ID
 * @property {Date} computedOn                  - Cube computation date
 */

 /**
 * @typedef YearCube
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {integer} amount.required          - Amount of money spend on given years
 * @property {integer} year.required            - Number of years (1-3)
 * @property {string} actorID.required          - Explorer ID
 * @property {Date} computedOn                  - Cube computation date
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
 * @property {Array.<string>} roles.required    - User roles (explorer, manager, sponsor, administrator)
 */