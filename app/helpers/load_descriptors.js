// Import Canvas and face-api.js
const fs = require('fs');
const canvas = require('canvas');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

// Import helpers
const { isArray } = require('./type_checks');

// Export main function
module.exports = async function (path) {
    return new Promise((resolve, reject) => {
        try {
            // Check if file exists 
            fs.stat(path, (err, stats) => {
                if (err) reject(err);
                else if (stats.isFile()) {
                    // Load file from path 
                    fs.readFile(path, (err, contents) => {
                        if (err) reject(err);
                        else {
                            // Parse as JSON object
                            let labelled_descriptor_array = JSON.parse(contents);

                            // Extract each descriptor with label from object 
                            if (isArray(labelled_descriptor_array)) {
                                // Create a descriptor array 
                                let matcher_array = [];
                                let descriptors_loaded = 0;

                                // Parse each labbeled descriptor from the contents
                                labelled_descriptor_array.forEach((labelled_descriptor) => {
                                    if ('label' in labelled_descriptor && 'descriptors' in labelled_descriptor) {
                                        // Get the label of the descriptor
                                        let label = labelled_descriptor.label;

                                        // Add each descriptor to an array to add to constructor
                                        let descriptor_array = []
                                        labelled_descriptor.descriptors.forEach(function (array) {
                                            descriptor_array.push(new Float32Array(array))
                                        })

                                        // Create a face matcher from the data and push to the matcher array 
                                        const descriptor = new faceapi.LabeledFaceDescriptors(label, descriptor_array);
                                        matcher_array.push(new faceapi.FaceMatcher(descriptor));
                                    }
                                    else {
                                        reject(new Error('Parsed descriptor does not have the correct feilds'));
                                    }

                                    // Reslove when all are loaded
                                    descriptors_loaded++
                                    if (descriptors_loaded == labelled_descriptor_array.length) {
                                        resolve(matcher_array);
                                    }
                                });
                            }
                            else {
                                reject(new Error('Failed to parse contents of file to array'));
                            }
                        }
                    });
                }
                else {
                    reject(new Error('Descriptor path passed was not a file'));
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });
};