const Finder = require("../models/FinderSchema");
const FinderResults = require("../models/FinderResultsSchema");
const Trip = require("../models/TripSchema");
const systemParamsController = require("./SystemParamsController");
const Validators = require("../middlewares/Validators");
const { CheckActor } = require("../middlewares/Auth");

/**
 * Get a specific finder
 * @route GET /finders/{id}
 * @group Finder - Find trips
 * @param {string} id.path.required             - Finder identifier
 * @returns {Finder}                200 - Returns the requested Finder
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Finder not found
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
const getOne = async(req, res) => {
    console.log(Date() + "-GET /finder");
    let doc = await Finder.findById(req.params.id).populate('trips');
    if(doc) {
        return res.status(200).send(doc);
    } else {
        return res.status(404).send("Finder not found");
    }
};

/**
 * Get a specific finder
 * @route GET /finders/actors/{id}
 * @group Finder - Find trips
 * @param {string} id.path.required             - Actor identifier
 * @returns {Finder}                200 - Returns the requested Finder
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Finder not found
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
 const getOneByActor = async(req, res) => {
    console.log(Date() + "-GET /finders/actor");
    Finder.findOne({actorID: req.params.id }, function(err, obj) { 
        if(err) {
            return res.status(401).json({err:err});
        }
        var finder = obj;
        if(finder)
            return res.status(200).json(finder);
        else
            return res.status(404).send("Finder not found");
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
 * @security bearerAuth
 */
const createOne = async (req, res) => {
    console.log(Date() + "-POST /finder");

    let sD = Date.parse(req.body.startDate)
    let eD = Date.parse(req.body.endDate)
    const maxResults = await systemParamsController.getFinderMaxResults();

    if(isNaN(sD)){
        sD = undefined
    }else{
        sD = new Date(sD)
    }
    if(isNaN(eD)){
        eD = undefined
    }else{
        eD = new Date(eD)
    }

    let filters = {
        price: {$gte: req.body.minPrice, $lt: req.body.maxPrice},
        startDate: {$gte: sD},
        endDate: {$lt: eD},
    }

    if(req.body.minPrice === undefined && req.body.maxPrice === undefined){
        delete filters.price
    }else if(req.body.minPrice === undefined && req.body.maxPrice !== undefined){
        delete filters.price.$gte
    }else if(req.body.minPrice !== undefined && req.body.maxPrice === undefined){
        delete filters.price.$lt
    }
    if(filters.startDate === undefined){
        delete filters.startDate
    }
    if(filters.endDate === undefined){
        delete filters.endDate
    }

    const keywordRegex = new RegExp(req.body.keyword, 'i')

    let trips = await Trip.find(
        { 
            $or: [{ticker: {$regex: keywordRegex}}, {title: {$regex: keywordRegex}}], 
            $and: [filters]
    }).limit(maxResults)

    const finder = {
        keyword: req.body.keyword,
        minPrice: req.body.minPrice,
        maxPrice: req.body.maxPrice,
        startDate: sD,
        endDate: eD,
        actorID: req.body.actorID,
    }

    try {
        const results = await new FinderResults({results: trips}).save();
        finder.trips = results.id;
        const doc = await new Finder(finder).save();
        res.status(200).send(doc);
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

/**
 * Update an existing finder for a specific actor
 * @route PUT /finders/{id}
 * @group Finder - Find trips
 * @param {string} id.path.required               - Finder identifier
 * @param {FinderPut.model} finder.body.required  - Finder updates
 * @returns {Finder}                200 - Returns the current state for this finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Finder not found
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
const editOne = async(req, res) => {
    let doc = await Finder.findById(req.params.id);
    if (doc) {
        let sD = Date.parse(req.body.startDate)
        let eD = Date.parse(req.body.endDate)
        const maxResults = await systemParamsController.getFinderMaxResults();

        if(isNaN(sD)){
            sD = undefined
        }else{
            sD = new Date(sD)
        }
        if(isNaN(eD)){
            eD = undefined
        }else{
            eD = new Date(eD)
        }
    
        let filters = {
            price: {$gte: req.body.minPrice, $lt: req.body.maxPrice},
            startDate: {$gte: sD},
            endDate: {$lt: eD},
        }
    
        if(req.body.minPrice === undefined && req.body.maxPrice === undefined){
            delete filters.price
        }else if(req.body.minPrice === undefined && req.body.maxPrice !== undefined){
            delete filters.price.$gte
        }else if(req.body.minPrice !== undefined && req.body.maxPrice === undefined){
            delete filters.price.$lt
        }
        if(filters.startDate === undefined){
            delete filters.startDate
        }
        if(filters.startDate === undefined){
            delete filters.endDate
        }
    
        const keywordRegex = new RegExp(req.body.keyword, 'i')
    
        let trips = await Trip.find(
            { 
                $or: [{ticker: {$regex: keywordRegex}}, {title: {$regex: keywordRegex}}], 
                $and: [filters]
        }).limit(maxResults)

        const finder = {
            _id: req.params.id,
            keyword: req.body.keyword,
            minPrice: req.body.minPrice,
            maxPrice: req.body.maxPrice,
            startDate: sD,
            endDate: eD,
            actorID: doc.actorID,
        }

        const results = await new FinderResults({results: trips}).save();
        finder.trips = results.id;

        doc = await Finder.findOneAndDelete({ _id: req.params.id })
        .catch(err => res.status(500).json({ reason: "Database error" }));

        doc = await new Finder(finder).save()        
        .then(doc => res.status(200).json(doc))
        .catch(err => res.status(500).json({ reason: "Database error" }));
    } else {
        return res.status(404).send("Finder not found");
    }
};

/**
 * Delete an existing finder for a specific actor
 * @route DELETE /finders/{id}
 * @group Finder - Find trips
 * @param {string} finderID.path.required     - Finder identifier
 * @returns {Finder}                200 - Returns the deleted finder
 * @returns {ValidationError}       400 - Supplied parameters are invalid
 * @returns {}                      401 - User is not authorized to perform this operation
 * @returns {}                      404 - Finder not found
 * @returns {DatabaseError}         500 - Database error
 * @security bearerAuth
 */
const deleteOne = async (req, res) => {
    // Necesita actorID autenticado, _id
    try {
        const doc = await Finder.findOneAndDelete({ _id: req.params.finderID });
        if (doc) {
            return res.status(200).json(doc);
        } else {
            return res.status(404).send("Finder not found");
        }
    } catch (err) {
        res.status(500).json({ reason: "Database error" });
    }
};

module.exports.register = (apiPrefix, router) => {
    const apiURL = `${apiPrefix}/finders`;
    router.get(apiURL + '/:id', 
        CheckActor,
        getOne);
    router.get(apiURL + '/actors/:id',
        CheckActor,
        getOneByActor);
    router.post(apiURL,
        CheckActor,
        Validators.CheckPricesFinder(),
        Validators.CheckDatesFinder(),
        createOne);
    router.put(apiURL + '/:id',
        CheckActor,
        Validators.CheckPricesFinder(),
        Validators.CheckDatesFinder(),
        editOne);
    router.delete(apiURL + '/:id',
        CheckActor,
        Validators.CheckPricesFinder(),
        Validators.CheckDatesFinder(),
        deleteOne)
};

/**
 * @typedef Finder
 * @property {string} keyword          - Keyword for search
 * @property {number} minPrice         - Min Trip Price
 * @property {number} maxPrice         - Max Trip Price
 * @property {string} startDate         - Date Init
 * @property {string} endDate          - End Date
 * @property {string} actorID          - Actor ID
 */

/**
 * @typedef FinderPut
 * @property {string} keyword            - Keyword for search
 * @property {number} minPrice           - Min Trip Price
 * @property {number} maxPrice           - Max Trip Price
 * @property {string} startDate           - Date Init
 * @property {string} endDate            - End Date
 */
