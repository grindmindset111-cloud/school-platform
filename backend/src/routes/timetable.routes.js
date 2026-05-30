const router = require('express').Router();
const controller = require('../controllers/timetable.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);

module.exports = router;