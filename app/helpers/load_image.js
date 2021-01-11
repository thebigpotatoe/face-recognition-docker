// Import face-api.js
const fs = require('fs');
const canvas = require('canvas');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

// Export main function
module.exports = async function (path) {
    return new Promise(async function (resolve, reject) {
        try {
            // Read file from system 
            fs.readFile(path, (err, file_data) => {
                if (err) reject(err);
                else {
                    // Convert to and return a new Image
                    const img = new Image;
                    img.src = file_data;
                    const canvas_img = faceapi.createCanvasFromMedia(img);
                    resolve(canvas_img);
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });

}