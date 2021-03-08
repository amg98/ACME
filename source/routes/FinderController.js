const Finder = require("../models/FinderSchema");
const Trip = require("../models/TripSchema");

/**
 * Get a specific finder for an actor
 * @route GET /finders
 * @group Finder - Find trips
 * @param {string} id.path              - Actor identifier
 * @returns {Finder}                200 - Returns the requested Finder
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getOne = (req, res) => {
    console.log(Date() + "-GET /finder");
    // Necesita explorerId autenticado
    Finder.findById(req.params.finderId, function (err, finder) {
        if (err) {
            res.send(err);
        }
        else {
            if (finder.trips.length === 0) {
                //Resultados expirados
                let trips = Trip.find({
                    ticker: '/' + req.body.keyword + '/',
                    title: '/' + req.body.keyword + '/',
                    startDate: {
                        $gte: new Date(req.body.dateInit),
                    },
                    endDate: {
                        $lt: new Date(req.body.dateEnd)
                    },
                    price: {
                        $gte: req.body.minPrice,
                        $lt: req.body.maxPrice
                    }
                });
                finder.trips = trips;
                res.json(finder);
            } else {
                res.json(finder);
            }
        }
    });
};

/**
 * Create a new finder
 * @route POST /finders
 * @group Finder - Find trips
 * @param {FinderPost.model} finder.body.required  - New finder
 * @returns {string}                200 - Returns the finder identifier
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const createOne = (req, res) => {
    // Necesita explorerId autenticado
    console.log(Date() + "-POST /finder");
    let trips = Trip.find({
        ticker: '/' + req.body.keyword + '/',
        title: '/' + req.body.keyword + '/',
        startDate: {
            $gte: new Date(req.body.dateInit),
        },
        endDate: {
            $lt: new Date(req.body.dateEnd)
        },
        price: {
            $gte: req.body.minPrice,
            $lt: req.body.maxPrice
        }
    })
    const finder = {
        ticker: req.body.ticker,
        minPrice: req.body.minPrice,
        maxPrice: req.body.maxPrice,
        dateInit: req.body.dateInit,
        dateEnd: req.body.dateEnd,
        trips: trips
    }
    const doc = new Finder(finder).save();
    return res.status(201).send(doc);
};

/**
 * Update an existing finder for a specific actor
 * @route PUT /finders
 * @group Finder - Find trips
 * @param {FinderPut.model} finder.body.required  - Finder updates
 * @returns {Finder}                200 - Returns the current state for this finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const editOne = (req, res) => {
    // Necesita explorerId autenticado, _id
    Finder.findOneAndUpdate({ _id: req.body.finder._id }, req.body.finder)
        .then(doc => {
            if (doc) {
                return Finder.findById(doc._id);
            } else {
                res.sendStatus(401);
            }
        })
        .then(doc => res.status(200).json(doc))
        .catch(err => res.status(500).json({ reason: "Database error" }));
};

/**
 * Delete an existing finder for a specific actor
 * @route DELETE /finders
 * @group Finder - Find trips
 * @param {string} id.path.required     - Finder identifier
 * @returns {Finder}                200 - Returns the deleted finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = (req, res) => {
    // Necesita actorID autenticado, _id
    Finder.deleteOne({ _id: req.params.id }, function (err) {
        if (err) return handleError(err);
        res.status(200)
    });
};

module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/finders`;
    router.get(apiURL + '/:finderId', getOne);
    router.post(apiURL, createOne);
    router.put(apiURL + '/:finderId', editOne);
    router.delete(apiURL + '/:finderId', deleteOne)
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
