// Import Helpers
const parse_model_options = require('../helpers/parse_model_options');
const prase_detection_options = require('../helpers/parse_detection_options');

// Export main function
module.exports = async function (req, res, next) {
    try {
        // Look for valid query parameters for model options and merge with default options
        req.model_options = parse_model_options(req.query) || req.app.locals.model_options;

        // Look for valid query parameters for detection options and merge with default options
        req.detection_options = { ...req.app.locals.detection_options, ...prase_detection_options(req.query) };

        // Call next
        next();
    }
    catch (err) {
        next(err);
    }
}