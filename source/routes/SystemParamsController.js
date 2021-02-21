/**
 * Set the flat rate for sponsorships
 * @route PUT /system-params/flat-rate
 * @group System params - Global system parameters
 * @param {float}  value.query.required         - Flat rate value to be set
 * @returns {}                      204 - Flat rate set successfully
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const setFlatRate = (req, res) => {
    // Debe ser admin
};

/**
 * Set the maximum number of results to be returned from a finder
 * @route PUT /system-params/finder-max-results
 * @group System params - Global system parameters
 * @param {float}  value.query.required         - Finder max results value to be set
 * @returns {}                      204 - Finder max results set successfully
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const setFinderMaxResults = (req, res) => {
    // Debe ser admin
};

/**
 * Set the time-to-live for the finder results
 * @route PUT /system-params/finder-results-ttl
 * @group System params - Global system parameters
 * @param {float}  value.query.required         - TTL value to be set
 * @returns {}                      204 - TTL set successfully
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const setFinderResultsTTL = (req, res) => {
    // Debe ser admin
};

module.exports.getFlatRate = () => {

};

module.exports.getFinderMaxResults = () => {

};

module.exports.getFinderResultsTTL = () => {

};

module.exports.register = (apiPrefix, router) => {

};
