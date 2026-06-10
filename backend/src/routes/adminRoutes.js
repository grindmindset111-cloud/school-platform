// src/routes/adminRoutes.js

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
    importStudentsFromFile
} = require("../controllers/adminImportController");


// 🔐 Auth + Permission system
const auth =
    require("../middlewares/auth.middleware");

const permit =
    require("../middlewares/permission.middleware");


const router = express.Router();



/*
|--------------------------------------------------------------------------
| UPLOAD CONFIG
|--------------------------------------------------------------------------
*/

const UPLOAD_DIR =
    path.join(__dirname, "../../uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({

    dest: UPLOAD_DIR,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },

    fileFilter: (req, file, cb) => {

        const ext =
            path.extname(file.originalname).toLowerCase();

        if (ext !== ".csv") {
            return cb(new Error("Only CSV files allowed"));
        }

        cb(null, true);
    }
});



/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/


/**
 * =========================================================================
 * IMPORT STUDENTS (ADMIN ONLY)
 * =========================================================================
 */
router.post(
    "/import-students",

    auth,

    permit("USER_IMPORT"),

    upload.single("file"),

    async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "CSV file is required"
                });
            }

            const result =
                await importStudentsFromFile(req.file.path);

            // cleanup
            fs.unlinkSync(req.file.path);

            return res.json({
                success: true,
                message: "Students imported successfully",
                data: result
            });

        } catch (error) {

            console.error("Import error:", error);

            return res.status(500).json({
                success: false,
                message: "Import failed",
                error: error.message
            });
        }
    }
);


module.exports = router;