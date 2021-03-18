const { DocumentProvider } = require("mongoose");
const Finder = require("../models/FinderSchema");
const Trip = require("../models/TripSchema");

/**
 * Get a specific finder
 * @route GET /finders/{finderID}
 * @group Finder - Find trips
 * @param {string} finderID.path.required             - Finder identifier
 * @returns {Finder}                200 - Returns the requested Finder
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const getOne = (req, res) => {
    console.log(Date() + "-GET /finder");
    // Necesita explorerId autenticado
    Finder.findById(req.params.finderID, async function (err, finder) {
        if (err) {
            res.send(err);
        }
        else {
            if (finder.trips.length === 0) {
                //Resultados expirados
                let trips = await Trip.find({
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
 * Get a specific finder
 * @route GET /finders/actors/{actorID}
 * @group Finder - Find trips
 * @param {string} actorID.path.required             - Actor identifier
 * @returns {Finder}                200 - Returns the requested Finder
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
 const getOneByActor = (req, res) => {
    console.log(Date() + "-GET /finders/actor");
    // Necesita explorerId autenticado
    Finder.findOne({ actorID: req.params.actorID }, async function (err, finder) {
        if (err) {
            res.send(err);
        }
        else {
            if (finder.trips.length === 0) {
                //Resultados expirados
                const keywordRegex = new RegExp(finder.keyword, 'i')

                let trips = await Trip.find(
                    { 
                        $or: [{ticker: {$regex: keywordRegex}}, {title: {$regex: keywordRegex}}], 
                        $and: [{price: {$gte: finder.minPrice, $lt: finder.maxPrice}},
                                {startDate: { $gte: new Date(finder.dateInit)}},
                                {endDate: { $lt: new Date(finder.dateEnd)}}
                        ]
                })

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
const createOne = async (req, res) => {
    // Necesita explorerId autenticado
    console.log(Date() + "-POST /finder");

    const keywordRegex = new RegExp(req.body.keyword, 'i')

    let trips = await Trip.find(
        { 
            $or: [{ticker: {$regex: keywordRegex}}, {title: {$regex: keywordRegex}}], 
            $and: [{price: {$gte: req.body.minPrice, $lt: req.body.maxPrice}},
                    {startDate: { $gte: new Date(req.body.dateInit)}},
                    {endDate: { $lt: new Date(req.body.dateEnd)}}
            ]
    })
    const finder = {
        keyword: req.body.keyword,
        minPrice: req.body.minPrice,
        maxPrice: req.body.maxPrice,
        dateInit: new Date(req.body.dateInit),
        dateEnd: new Date(req.body.dateEnd),
        actorID: req.body.actorID,
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
 * @route PUT /finders/{finderID}
 * @group Finder - Find trips
 * @param {FinderPut.model} finder.body.required  - Finder updates
 * @returns {Finder}                200 - Returns the current state for this finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const editOne = async(req, res) => {
    // Necesita explorerId autenticado, _id
    //Refresca el tiempo 


    let doc = await Finder.findById(req.body._id);
    if (doc) {
        const keywordRegex = new RegExp(req.body.keyword, 'i')

        let trips = await Trip.find(
            { 
                $or: [{ticker: {$regex: keywordRegex}}, {title: {$regex: keywordRegex}}], 
                $and: [{price: {$gte: req.body.minPrice, $lt: req.body.maxPrice}},
                        {startDate: { $gte: new Date(req.body.dateInit)}},
                        {endDate: { $lt: new Date(req.body.dateEnd)}}
                ]
        })

        const finder = {
            keyword: req.body.keyword,
            minPrice: req.body.minPrice,
            maxPrice: req.body.maxPrice,
            dateInit: req.body.dateInit,
            dateEnd: req.body.dateEnd,
            actorID: doc.actorID,
            trips: trips
        }

        doc = await Finder.findOneAndUpdate({ _id: req.body._id }, finder)
        .then(doc => res.status(200).json(doc))
        .catch(err => res.status(500).json({ reason: "Database error" }));

    } else {
        return res.sendStatus(401);
    }
};

/**
 * Delete an existing finder for a specific actor
 * @route DELETE /finders/{finderID}
 * @group Finder - Find trips
 * @param {string} finderID.path.required     - Finder identifier
 * @returns {Finder}                200 - Returns the deleted finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {DatabaseError}         500 - Database error
 */
const deleteOne = async (req, res) => {
    // Necesita actorID autenticado, _id
    try {
        const doc = await Finder.findOneAndDelete({ _id: req.params.finderID });
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
    router.get(apiURL + '/:finderID', getOne);
    router.get(apiURL + '/actors/:actorID', getOneByActor);
    router.post(apiURL, createOne);
    router.put(apiURL + '/:finderID', editOne);
    router.delete(apiURL + '/:finderID', deleteOne)
};

/**
 * @typedef Finder
 * @property {string} keyword          - Keyword for search
 * @property {number} minPrice         - Min Trip Price
 * @property {number} maxPrice         - Max Trip Price
 * @property {string} dateInit         - Date Init
 * @property {string} dateEnd          - End Date
 * @property {string} actorID          - Actor ID
 */

/**
 * @typedef FinderPut
 * @property {string} _id.required  - applicationID
 * @property {string} keyword            - Keyword for search
 * @property {number} minPrice           - Min Trip Price
 * @property {number} maxPrice           - Max Trip Price
 * @property {string} dateInit           - Date Init
 * @property {string} dateEnd            - End Date
 */
