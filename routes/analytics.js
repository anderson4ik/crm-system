const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics');
const passport = require("passport");

// localhost:5000/api/analytics/overview
router.get('/overview', passport.authenticate('jwt', {session: false}), controller.overview);

// localhost:5000/api/analytics/analytics
router.get('/analytics', passport.authenticate('jwt', {session: false}), controller.analytics);

module.exports = router;
