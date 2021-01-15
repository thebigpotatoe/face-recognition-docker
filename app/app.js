// Get the environmental variables 
port = process.env.PORT || 1890;
weights_path = process.env.WEIGHTS_PATH || './app/weights';
descriptor_path = process.env.DESCRIPTOR_PATH || './app/descriptors.json';
use_tf = process.env.USE_TF || 'true';

// Load Tensorflow.js 
const os = require('os');
if (use_tf === 'true' && os.arch() === 'x64') {
    const tf = require('@tensorflow/tfjs-node');
    console.log('Loaded tfjs-node version', tf.version_core);
}

// Import the express modules
let express = require('express');
let app = express();

// Import the helper modules
const load_models = require('./helpers/load_models');
const load_descriptors = require('./helpers/load_descriptors');
const parse_model_options = require('./helpers/parse_model_options');
const parse_detection_options = require('./helpers/parse_detection_options');

// Load in Application Variables 
load_models(weights_path).then((result) => {
    app.locals.models_loaded = result;
})
load_descriptors(descriptor_path).then(matchers => {
    app.locals.face_matchers = matchers;
});
app.locals.model_options = parse_model_options(process.env.MODEL_OPTIONS || { model: 'ssd', minConfidence: 0.6 });
app.locals.detection_options = parse_detection_options(process.env.DETECTION_OPTIONS || {});

// Configure the routes
app.use(require('./routes/index'));

// Start the application
app.listen(port, function () {
    console.log(`Listening on port ${port}...`);
});