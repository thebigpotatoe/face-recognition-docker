// Console logging
console.log("Using /recognise routes");

// Import express
let express = require('express');
let router = express.Router();

// Import Multer
var upload = require('multer')();

// Import Middleware
const middleware_options = require('../middleware/middleware_options');
const middleware_canvas = require('../middleware/middleware_canvas');
const middleware_detection = require('../middleware/middleware_detection');
const middleware_draw = require('../middleware/middleware_draw');

// Define route
router.post('/recognise',
    upload.single('img'),
    middleware_options,
    middleware_canvas,
    middleware_detection,
    middleware_draw,
    async function (req, res) {
        try {
            // Reply with image if required
            if (req.query.return_img && req.drawn_canvas) {
                res.contentType('jpeg');
                res.end(req.drawn_canvas.toBuffer(), 'binary');
            }

            // Else reply with detections object 
            else if (req.matches) {
                res.send(req.matches);
            }

            // Else respond with an internal error
            else {
                throw 'Error computing response, no return value'
            }
        }
        catch (err) {
            next(err);
        }
    });

// Export router
module.exports = router