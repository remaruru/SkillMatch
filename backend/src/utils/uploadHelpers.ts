import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary configuration (credentials are provided via environment variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const folder = 'skillmatch';
        
        // Define resource type and folder path-suffix based on file type
        let resource_type: 'auto' | 'image' | 'video' | 'raw' = 'auto'; // Use auto to bypass raw tier restrictions
        let folderPath = `${folder}/others`;

        if (file.fieldname === 'resume') {
            resource_type = 'auto'; // Auto allows Cloudinary to handle PDFs natively without strict raw rules
            folderPath = `${folder}/resumes`;
        } else if (file.fieldname === 'schoolId') {
            resource_type = 'image';
            folderPath = `${folder}/school-ids`;
        }

        return {
            folder: folderPath,
            resource_type: resource_type,
            public_id: `${file.fieldname}-${Date.now()}`
        };
    },
});

// File filter to accept only PDFs and Images (remains same logic, plus type checking)
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
