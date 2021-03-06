/**
 * Get a specific finder for an actor
 * @route GET /finder
 * @group Finder - Find trips
 * @param {string} id.path              - Actor identifier
 * @returns {Finder}                200 - Returns the requested Finder
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const get = (req, res) => {
    // Necesita actorID autenticado
};

/**
 * Create a new finder
 * @route POST /finder
 * @group Finder - Find trips
 * @param {FinderPost.model} finder.body.required  - New finder
 * @returns {string}                200 - Returns the finder identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const createOne = (req, res) => {
    // Necesita actorID autenticado
};

/**
 * Update an existing finder for a specific actor
 * @route PUT /finder
 * @group Finder - Find trips
 * @param {FinderPut.model} finder.body.required  - Finder updates
 * @returns {Finder}                200 - Returns the current state for this finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const editOne = (req, res) => {
    // Necesita actorID autenticado, _id
};

/**
 * Delete an existing finder for a specific actor
 * @route DELETE /finder
 * @group Finder - Find trips
 * @param {string} id.path.required     - Finder identifier
 * @returns {Finder}                200 - Returns the deleted finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = (req, res) => {
    // Necesita actorID autenticado, _id
};


/**
 * @typedef FinderPost
 * @property {Finder.model} finder - New Finder
 */

/**
 * @typedef FinderPut
 * @property {Finder.model} finder - Finder to update
 */

/**
 * @typedef Finder
 * @property {string} _id                       - Unique identifier (ignored in POST requests due to id collision)
 * @property {string} keyword.required          - Keyword for search
 * @property {string} minPrice.required         - Min Trip Price
 * @property {string} maxPrice.required         - Max Trip Price
 * @property {string} dateInit.required         - Date Init
 * @property {string} dateEnd.required          - End Date
 */
