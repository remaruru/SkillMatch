import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
// Cloudinary configuration (credentials are provided via environment variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const folder = 'skillmatch';
        // Define resource type and folder path-suffix based on file type
        let resource_type = 'image';
        let folderPath = `${folder}/others`;
        if (file.fieldname === 'resume') {
            resource_type = 'raw'; // Crucial for PDFs to keep formatting and link reliability
            folderPath = `${folder}/resumes`;
        }
        else if (file.fieldname === 'schoolId') {
            resource_type = 'image';
            folderPath = `${folder}/school-ids`;
        }
        return {
            folder: folderPath,
            resource_type: resource_type,
            public_id: `${file.fieldname}-${Date.now()}`,
            format: file.fieldname === 'resume' ? 'pdf' : undefined, // Optional: force PDF for resumes
        };
    },
});
// File filter to accept only PDFs and Images (remains same logic, plus type checking)
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'resume') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF format is allowed for resumes!'));
        }
    }
    else if (file.fieldname === 'schoolId') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image formats are allowed for school IDs!'));
        }
    }
    else {
        cb(null, true);
    }
};
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
//# sourceMappingURL=uploadHelpers.js.map