const MonthCube = require("../models/MonthCubeSchema");
const YearCube = require("../models/YearCubeSchema");

/**
 * Get the cube amount for given explorer and months
 * @route GET /cubes/{months}
 * @group Cubes - Cubes computation
 * @param {string} explorerID.path.required       - Explorer identifier
 * @param {string} month.path.required            - Months to query (M01-M36)
 * @returns {float}                           200 - Returns the amount for the requested cube
 * @returns {DatabaseError}                   500 - Database error
 */
const getMonthCube = (req, res) => {
    // Necesita ser un administratorID autenticado
    // TODO
};

/**
 * Get the cube amount for given explorer and years
 * @route GET /cubes/{years}
 * @group Cubes - Cubes computation
 * @param {string} explorerID.path.required       - Explorer identifier
 * @param {string} year.path.required             - Years to query (Y01-Y03)
 * @returns {float}                           200 - Returns the amount for the requested cube
 * @returns {DatabaseError}                   500 - Database error
 */
const getYearCube = (req, res) => {
  // Necesita ser un administratorID autenticado
  // TODO
};

/**
 * Get the explorers that satisfy with given period, money and condition
 * @route GET /cubes/explorers
 * @group Cubes - Cubes computation
 * @param {string} period.path.required           - Valid period (M01-M36 or Y01-Y03)
 * @param {string} amount.path.required           - Amount of money to be evaluated by condition
 * @param {string} condition.path.required        - Condition to be evaluated
 * @returns {Array.<Actor>}                   200 - Returns the explorers that satisfy the condition
 * @returns {DatabaseError}                   500 - Database error
 */
const getExplorersByConditionCube = (req, res) => {
  // Necesita ser un administratorID autenticado
  // TODO
};


/**
 * Compute an n-Month-Cube for a given explorer ID
 * @route POST /cubes/month
 * @group Cubes - Cubes computation
 * @param {MonthCubePost.model} monthCube.body.required   - New month-cube
 * @returns {string}                                  200 - Returns the computed operation
 * @returns {}                                        401 - User is not authorized to perform this operation
 * @returns {DatabaseError}                           500 - Database error
 */
const computeMonthCube = (req, res) => {
    // Necesita ser un administratorID autenticado
    // TODO
};

/**
 * Compute an n-Year-Cube for a given explorer ID
 * @route POST /cubes/year
 * @group Cubes - Cubes computation
 * @param {YearCubePost.model} yearCube.body.required   - New year-cube
 * @returns {string}                                200 - Returns the computed operation
 * @returns {}                                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}                         500 - Database error
 */
const computeYearCube = (req, res) => {
  // Necesita ser un administratorID autenticado
  // TODO
};



module.exports.register = (apiPrefix, router) => {
  const apiURL = `${apiPrefix}/cubes`;
  router.get(apiURL+'/:actorId', getActor);
  //TODO
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
 * @property {string} explorerID.required       - Explorer ID
 */

 /**
 * @typedef YearCube
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {integer} amount.required          - Amount of money spend on given years
 * @property {integer} year.required            - Number of years (1-3)
 * @property {string} explorerID.required       - Explorer ID
 */

 /**
 * @typedef Rol
 * @property {string} rol.required          - User role (explorer, manager, sponsor, administrator)
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