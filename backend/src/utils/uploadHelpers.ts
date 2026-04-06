import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM-safe __dirname equivalent — works regardless of where `node` is launched from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve uploads relative to this file: backend/src/utils/ → backend/uploads/
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only PDFs and Images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.fieldname === 'resume') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF format is allowed for resumes!'));
        }
    } else if (file.fieldname === 'schoolId') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image formats are allowed for school IDs!'));
        }
    } else {
        cb(null, true);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
