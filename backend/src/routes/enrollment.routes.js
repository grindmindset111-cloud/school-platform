const router = require('express').Router();
const { create, list, myEnrollments } = require('../controllers/enrollment.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Admin & Staff
router.post('/', auth, role('ADMIN', 'STAFF'), create);
router.get('/', auth, role('ADMIN', 'STAFF'), list);

// Student only
router.get('/my', auth, role('STUDENT'), myEnrollments);

module.exports = router;
