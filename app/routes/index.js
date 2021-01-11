// Console logging
console.log("Setting up routes");

// Import express
let express = require('express');
const listEndpoints = require('express-list-endpoints');
let router = express.Router();

// Setup home page
router.get('/', async function (req, res) {
    res.send(listEndpoints(router));
});

// Setup application routes
router.use(require('./options.js'));
router.use(require('./detect.js'));
router.use(require('./recognise.js'));

// Setup not found last
router.get('*', async function (req, res) {
    res.redirect('/');
});
router.post('*', async function (req, res) {
    res.send('', 404);
});

// Export router
module.exports = router;