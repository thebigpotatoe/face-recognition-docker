// Import Helpers
const model_selector = require('./model_selector');
const { isArray } = require('./type_checks');

// Export main function
module.exports = async function (img, model_options, detection_options, face_matchers) {
    return new Promise(async function (resolve, reject) {
        try {
            // Add descriptors and recognise to the detection options by default 
            detection_options['descriptors'] = true;
            detection_options['recognise'] = true;

            // Check if face_matchers is valid
            if (isArray(face_matchers) && face_matchers.length) {
                // Detect all faces in the image
                const start_time = Date.now();
                model_selector(img, model_options, detection_options).then((detections) => {
                    console.log('Face recognition took', Date.now() - start_time, 'ms');
                    // Check if there were any valid detections
                    if (detections) {
                        // Create a matched face buffer 
                        matched_faces = [];

                        // Loop each face in the detections to see if any match known faces
                        detections.forEach((face) => {
                            // Create a best match buffer 
                            let best_matches = [];

                            // Loop each face matcher to see which one gives the highest confidence
                            face_matchers.forEach(async function (matcher) {
                                // Use find Best match to get the confidence score
                                const bestMatch = matcher.findBestMatch(face.descriptor);
                                best_matches.push(bestMatch);

                                // Sort the best matches and push the best one to the matched faces buffer
                                if (best_matches.length === face_matchers.length) {
                                    best_matches.sort((a, b) => a._distance - b._distance);
                                    face.bestMatch = best_matches[0];
                                    matched_faces.push(face);
                                }
                            });

                            // Return the matched face buffer when loop completed
                            if (matched_faces.length === detections.length) {
                                resolve(matched_faces);
                            }
                        });
                    }
                    else {
                        resolve([]);
                    }
                }).catch((err) => {
                    reject(err);
                });
            }
            else {
                throw 'face_matcher was empty or invalid, ignoring request';
            }
        }
        catch (err) {
            reject(err);
        }
    });
}