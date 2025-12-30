import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure directory exists to prevent errors
const uploadDir = "./public/temp";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Keeps the original extension and adds a unique timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter to restrict file types (e.g., only images)
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isMimeValid = allowedTypes.test(file.mimetype);
    const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (isMimeValid && isExtValid) {
        return cb(null, true);
    }
    cb(new Error("Error: File type not supported!"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 5MB limit
    }
});

export { upload };
