// src/routes/result.bulkUpload.routes.js

const router = require('express').Router();

const multer = require('multer');
const path = require('path');

const {
    bulkUploadResults
} = require('../controllers/result.bulkUpload.controller');


// 🔐 Auth middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');


/*
|--------------------------------------------------------------------------
| MULTER CONFIG (CSV ONLY, MEMORY STORAGE)
|--------------------------------------------------------------------------
*/

const storage = multer.memoryStorage();

const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const ext =
            path.extname(file.originalname).toLowerCase();

        if (ext !== '.csv') {
            return cb(new Error('Only CSV files are allowed'));
        }

        cb(null, true);
    },

    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB safety limit
    }
});


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/


/**
 * ==========================================================
 * BULK RESULT UPLOAD
 * ==========================================================
 */
router.post(
    '/bulk-upload',

    auth,

    permit('RESULT_BULK_UPLOAD'),

    upload.single('file'),

    bulkUploadResults
);


module.exports = router;