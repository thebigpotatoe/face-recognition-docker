// Import Canvas
const canvas = require('canvas');
const { Canvas } = canvas;

// Import Helpers
const { isType } = require('../helpers/type_checks');
const detect_faces = require('../helpers/faces_detect.js');
const match_faces = require('../helpers/faces_match.js');

// Export main function
module.exports = async function (req, res, next) {
    try {
        // Create an empty matches object in req
        req.matches = [];

        // Check if the models are ready and loaded
        // Check the image exists and is valid
        if (req.app.locals.models_loaded && isType(req.canvas, Canvas)) {
            // Choose to run either recognition or detection
            if (req.path === '/detect') {
                detect_faces(
                    req.canvas,
                    req.model_options,
                    req.detection_options
                ).then((matches) => {
                    req.matches = matches;
                    next();
                }).catch((err) => {
                    next(err);
                });
            }
            else if (req.path === '/recognise') {
                match_faces(
                    req.canvas,
                    req.model_options,
                    req.detection_options,
                    req.app.locals.face_matchers
                ).then((matches) => {
                    req.matches = matches;
                    next();
                }).catch((err) => {
                    next(err);
                });
            }
            else {
                next();
            }
        }
        else if (req.app.locals.models_loaded) {
            throw 'Image passed was not of type Canvas';
        }
        else {
            throw 'Models not loaded, skipping detection';
        }
    }
    catch (err) {
        next(err);
    }
}