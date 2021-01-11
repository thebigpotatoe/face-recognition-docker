// Import Helpers
const model_selector = require('./model_selector');

// Export main function
module.exports = async function (img, model_options, detection_options) {
    return new Promise(async function (resolve, reject) {
        try {
            // Detect all faces in the image
            const start_time = Date.now();
            model_selector(img, model_options, detection_options).then((detections) => {
                console.log('Face detection took', Date.now() - start_time, 'ms');
                resolve(detections);
            }).catch((err) => {
                throw err;
            });
        }
        catch (error) {
            reject(error);
        }
    });
}