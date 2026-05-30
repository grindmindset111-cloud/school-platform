// src/routes/user.routes.js

const router = require('express').Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Controllers
const {
    bulkUploadStudents
} = require('../controllers/user.controller');


// 🔐 Authentication middleware
const auth =
    require('../middlewares/auth.middleware');


// 🔐 Permission middleware
const permit =
    require('../middlewares/permission.middleware');



/*
|--------------------------------------------------------------------------
| UPLOAD DIRECTORY
|--------------------------------------------------------------------------
*/

const UPLOAD_DIR =
    path.join(__dirname, '../../uploads');


// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {

    fs.mkdirSync(
        UPLOAD_DIR,
        { recursive: true }
    );
}



/*
|--------------------------------------------------------------------------
| MULTER STORAGE CONFIG
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, UPLOAD_DIR);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
});



/*
|--------------------------------------------------------------------------
| MULTER FILE VALIDATION
|--------------------------------------------------------------------------
*/

const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const ext =
            path.extname(file.originalname).toLowerCase();

        if (ext !== '.csv') {

            return cb(
                new Error('Only CSV files are allowed')
            );
        }

        cb(null, true);
    },

    limits: {

        // 5MB
        fileSize: 5 * 1024 * 1024
    }
});



/*
|--------------------------------------------------------------------------
| USER ROUTES
|--------------------------------------------------------------------------
*/


/**
 * =========================================================================
 * IMPORT STUDENTS
 * =========================================================================
 * ADMIN ONLY
 */
router.post(
    '/import-students',

    auth,

    permit('USER_IMPORT'),

    upload.single('file'),

    bulkUploadStudents
);


module.exports = router;