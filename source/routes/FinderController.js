const Finder = require("../models/FinderSchema");
const Trip = require("../models/TripSchema");

/**
 * Get a specific finder for an actor
 * @route GET /finders/{finderId}
 * @group Finder - Find trips
 * @param {string} finderId.path.required             - Actor identifier
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
 * @param {Finder.model} finder.body.required  - New finder
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

    try {
        const doc = await new Finder(finder).save();
        res.status(200).send(doc);
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
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
 * @route DELETE /finders/{finderId}
 * @group Finder - Find trips
 * @param {string} finderId.path.required     - Finder identifier
 * @returns {Finder}                200 - Returns the deleted finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = (req, res) => {
    // Necesita actorID autenticado, _id
    try {
        const doc = await Finder.findOneAndDelete({ _id: req.params.finderId });
        if (doc) {
            return res.status(200).json(doc);
        } else {
            return res.sendStatus(401);
        }
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/finders`;
    router.get(apiURL + '/:finderId', getOne);
    router.post(apiURL, createOne);
    router.put(apiURL + '/:finderId', editOne);
    router.delete(apiURL + '/:finderId', deleteOne)
};

/**
 * @typedef Finder
 * @property {string} keyword          - Keyword for search
 * @property {string} minPrice         - Min Trip Price
 * @property {string} maxPrice         - Max Trip Price
 * @property {string} dateInit         - Date Init
 * @property {string} dateEnd          - End Date
 */
