const MonthCube = require("../models/MonthCubeSchema");
const YearCube = require("../models/YearCubeSchema");
const Actor = require("../models/ActorSchema");
const Application = require("../models/ApplicationSchema");
const Trip = require("../models/TripSchema");

const { CheckAdmin } = require("../middlewares/Auth");
/**
 * Compute cubes for every explorer and every valid period (M01-M36, Y01-Y03)
 * @route POST /cubes
 * @group Cubes - Cubes computation
 * @returns {string}                                  200 - Returns the computed operation
 * @returns {}                                        401 - User is not authorized to perform this operation
 * @returns {DatabaseError}                           500 - Database error
 */
 const computeCubes = async (req, res) => {
  // Hacerlo con agreggations
};


/**
 * Get the cube amount for given explorer and months
 * @route GET /cubes/{actorId}/months/{month}
 * @group Cubes - Cubes computation
 * @param {string} actorID.path.required          - Explorer identifier
 * @param {integer} month.path.required           - Months to query (M01-M36)
 * @returns {float}                           200 - Returns the amount for the requested cube
 * @returns {Error}                           400 - Invalid month format
 * @returns {DatabaseError}                   404 - Cube not found
 */
const getMonthCube = (req, res) => {

  const monthRegex = new RegExp("^[mM](0[1-9]|1[0-9]|2[0-9]|3[0-6])$"); //(M01-M36)
  const isValidMonth = monthRegex.test(req.params.month);

  if (!isValidMonth) {
    return res.status(400).json({error: "Invalid month format"});
  }

  const month = req.params.month.substring(1,3);

  Actor.findById(req.params.actorId, function(err, actor) {
    if (err){
      return res.status(404).json({"error":"Actor not found", code:err});
    }
    else {
      if(!actor){
        return res.status(404).json({"error":"Actor not found"});
      }

      MonthCube.findOne({explorerID: req.params.actorId, month: month}, function(err, monthCube) {
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
      
    }
  });
};

/**
 * Get the cube amount for given explorer and years
 * @route GET /cubes/{actorId}/years/{year}
 * @group Cubes - Cubes computation
 * @param {string} actorID.path.required          - Explorer identifier
 * @param {integer} year.path.required            - Years to query (Y01-Y03)
 * @returns {float}                           200 - Returns the amount for the requested cube
 * @returns {DatabaseError}                   404 - Cube not found
 */
const getYearCube = (req, res) => {

  const yearRegex = new RegExp("^[yY](0[1-3])$"); //(Y01-Y03)
  const isValidYear = yearRegex.test(req.params.year);

  if (!isValidYear) {
    return res.status(400).json({error: "Invalid year format"});
  }

  const year = req.params.year.substring(1,3);

  Actor.findById(req.params.actorId, function(err, actor) {
    if (err){
      return res.status(404).json({"error":"Actor not found", code:err});
    }
    else {
      if(!actor){
        return res.status(404).json({"error":"Actor not found"});
      }

      YearCube.findOne({explorerID: req.params.actorId, year: year}, function(err, yearCube) {
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
  });
};

/**
 * Get the explorers that satisfy with given period, money and condition
 * @route GET /cubes/explorers/{period}/{condition}/{amount}
 * @group Cubes - Cubes computation
 * @param {string} period.path.required           - Valid period (M01-M36 or Y01-Y03)
 * @param {string} amount.path.required           - Amount of money to be evaluated by condition
 * @param {string} condition.path.required        - Condition to be evaluated (eq, ne, gt, gte, lt, lte)
 * @returns {Array.<Actor>}                   200 - Returns the explorers that satisfy the condition
 * @returns {Error}                           400 - Invalid format query
 * @returns {DatabaseError}                   404 - Explorer not found
 */
const getExplorersByConditionCube = async (req, res) => {
  const period = req.params.period;
  const condition = req.params.condition;
  const amount = req.params.amount;

  const possibleConditions = [eq, ne, gt, gte, lt, lte];
  const periodRegex = new RegExp("^[mM](0[1-9]|1[0-9]|2[0-9]|3[0-6])$|^[yY](0[1-3])$"); //(M01-M36 or Y01-Y03)
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

  var explorers = [];
  var parsedCondition = {};
  parsedCondition["$"+condition] = amount;

  if(period.startsWith('M')) {
    var monthNumber = period.substring(1,3);
    const cubes = await MonthCube.find({ month:monthNumber, amount: parsedCondition});

    cubes.forEach((cube) => {
      Actor.findOne({_id: cube.explorerID}, function(err, explorer) {
        if (err){
          return res.status(404).json({"error":"Explorer not found", code:err});
        }
        else {
          if(!explorer){
            return res.status(404).json({"error":"Explorer not found"});
          }
          explorers.push(explorer);
        }
      });
    });
  } else {
    var yearNumber = period.substring(1,3);
    const cubes = await YearCube.find({ year: yearNumber, amount: parsedCondition});

    cubes.forEach((cube) => {
      Actor.findOne({_id: cube.explorerID}, function(err, explorer) {
        if (err){
          return res.status(404).json({"error":"Explorer not found", code:err});
        }
        else {
          if(!explorer){
            return res.status(404).json({"error":"Explorer not found"});
          }
          explorers.push(explorer);
        }
      });
    });
  }
  
  return res.status(200).json({"explorers": explorers});

};


module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/cubes`;
  router.post(apiURL, CheckAdmin, computeCubes);
  router.get(apiURL+'/:actorId/months/:month', CheckAdmin, getMonthCube);
  router.get(apiURL+'/:actorId/years/:year', CheckAdmin, getYearCube);
  router.get(apiURL+'/explorers/:period/:condition/:amount', CheckAdmin, getExplorersByConditionCube);
};

/**
 * @typedef MonthCubePost
 * @property {MonthCube.model} monthCube - MonthCube to add
 */

/**
 * @typedef YearCubePost
 * @property {YearCube.model} yearCube - YearCube to add
 */

/**
 * @typedef MonthCube
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {integer} amount.required          - Amount of money spend on given months
 * @property {integer} month.required           - Number of months (1-36)
 * @property {string} actorID.required          - Explorer ID
 */

 /**
 * @typedef YearCube
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {integer} amount.required          - Amount of money spend on given years
 * @property {integer} year.required            - Number of years (1-3)
 * @property {string} actorID.required          - Explorer ID
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