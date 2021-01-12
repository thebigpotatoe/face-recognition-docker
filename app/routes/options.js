// Console logging
console.log("Using /options routes");

// Import express
let express = require('express')
let router = express.Router();

// Import body parser
var bodyParser = require('body-parser');

// Import Middleware
const middleware_options = require('../middleware/middleware_options');

// Import Helpers
const parse_model_options = require('../helpers/parse_model_options');
const parse_detection_options = require('../helpers/parse_detection_options');

// Define routes
router.get('/options',
    middleware_options,
    async function (req, res, next) {
        try {
            // Save the model options to the app
            req.app.locals.model_options = req.model_options

            // Save the detection options to the app 
            req.app.locals.detection_options = req.detection_options

            // Send response data
            res.send({
                'model_options': req.app.locals.model_options,
                'detection_options': req.app.locals.detection_options,
                'no_face_matchers': req.app.locals.face_matchers.length,
                'weights_route': process.env.PORT,
                'weights_path': process.env.WEIGHTS_PATH,
                'descriptors_path': process.env.DESCRIPTOR_PATH
            });
        }
        catch (err) {
            next(err);
        }
    })
router.post('/options', bodyParser.json(), async function (req, res, next) {
    try {
        // Parse any valid model options
        if ('model_options' in req.body) {
            let options = parse_model_options(req.body.model_options);
            if (options) req.app.locals.model_options = options;
        }

        // Parse any valid detection options
        if ('detection_options' in req.body) {
            let options = parse_detection_options(req.body.detection_options);
            if (Object.keys(options).length && options.constructor === Object) req.app.locals.detection_options = options;
        }

        // Return response
        res.send({
            'model_options': req.app.locals.model_options,
            'detection_options': req.app.locals.detection_options,
            'no_face_matchers': req.app.locals.face_matchers.length,
            'weights_route': process.env.PORT,
            'weights_path': process.env.WEIGHTS_PATH,
            'descriptors_path': process.env.DESCRIPTOR_PATH
        });
    }
    catch (err) {
        next(err);
    }
});

// Export router
module.exports = router;