// Get the environmental variables
const use_tf = (process.env.USE_TF == 'true') || true
const weights_path = process.env.WEIGHTS_PATH || `./app/weights`
const faces_folder = process.env.FACES_FOLDER || `./descriptor_creator/faces`;
const dectections_folder = process.env.DETECTION_FOLDER || `./descriptor_creator/detections`;
const descriptor_save_path = process.env.DESCRIPTOR_SAVE_PATH || `./descriptor_creator`

// Import the packages
const fs = require('fs');
const path = require('path');

// Import face-api.js
const canvas = require('canvas');
const faceapi = require('face-api.js')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
console.log('loaded faceapi', faceapi.tf.version_core);

// Load in tfjs-node if desired
if (use_tf) {
    const tf = require('@tensorflow/tfjs');
    console.log('loaded tf', tf.version_core);
}

// Load in the models
async function load_models() {
    try {
        const modelPath = weights_path;
        const ssdMobilenetv1Method = faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
        const faceLandmark68NetMethod = faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
        const faceRecognitionNetMethod = faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)

        await ssdMobilenetv1Method
        await faceLandmark68NetMethod
        await faceRecognitionNetMethod

        return true;
    }
    catch (error) {
        console.log("Models failed to load: \n" + error)
        return false
    }
}

// Load the images and create descriptiors
async function create_descriptors() {
    // Set up globals
    let folders_processed = 0;
    let labelled_descriptors = []

    // Walk through each folder
    fs.readdir(faces_folder, (err, folders) => {
        folders.forEach(async function (folder) {
            // Current folder
            let current_folder = path.join(faces_folder, folder);

            // Read each file in the folder
            fs.readdir(current_folder, (err, files) => {
                // Debug
                console.log('Processing faces in ' + folder)

                // Create a descriptors array 
                let files_processed = 0;
                let descriptors = [];

                files.forEach(async function (file) {
                    // Debug 
                    console.log("- Started processing " + file)

                    // Read file from system 
                    const file_data = fs.readFileSync(path.join(current_folder, file))

                    // Create a new image to run detection on
                    const img = new Image;
                    img.src = file_data;

                    // Make a forward pass of each network for the detections
                    const detections = await faceapi.detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor()
                    if (detections) descriptors.push(detections.descriptor);

                    // Draw the detection on the image for reference
                    const detected_img = faceapi.createCanvasFromMedia(img)
                    faceapi.draw.drawDetections(detected_img, detections)
                    faceapi.draw.drawFaceLandmarks(detected_img, detections)

                    // Save the detected image
                    const saveDir = path.join(dectections_folder, folder);
                    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir);
                    fs.writeFileSync(path.join(saveDir, "/detected-" + file), detected_img.toBuffer())

                    // If the array is at the end create a labelled descriptor 
                    files_processed++
                    console.log("- Finsihed processing file " + file + " (" + files_processed + " out of " + files.length + ")")
                    if (files_processed === files.length && descriptors.length) {
                        // Create a labelled descriptor
                        labelled_descriptors.push(new faceapi.LabeledFaceDescriptors(
                            folder,
                            descriptors
                        ));

                        // Save the descriptors if all folders have completed
                        folders_processed++
                        console.log("Finsihed processing folder " + folder + " (" + folders_processed + " out of " + folders.length + ")")
                        if (folders_processed === folders.length && labelled_descriptors.length) {
                            console.log('Saving descriptors')
                            fs.writeFileSync(path.join(descriptor_save_path, `descriptors.json`), JSON.stringify(labelled_descriptors))
                        }
                    }
                });
            });
        });
    });
}

// Run the main script
async function main() {
    console.log("Loading Models")
    if (await load_models()) {
        console.log("Creating Descriptors")
        await create_descriptors();
    }
}
main();