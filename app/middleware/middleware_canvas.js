// Import Helpers
const { isType } = require('../helpers/type_checks');
const buf2canvas = require('../helpers/buffer2canvas.js');

// Export main function
module.exports = async function (req, res, next) {
    try {
        // Check image exists and is a buffer 
        if (isType(req.file.buffer, Buffer)) {
            // Convert input image to a Canvas and store in req object
            buf2canvas(req.file.buffer).then(buffer => {
                req.canvas = buffer;
                next();
            }).catch(err => {
                next(err);
            });
        }
        else {
            throw 'Parsed file from req.file was not of type Buffer';
        }
    }
    catch (err) {
        next(err);
    }
}