import multer from 'multer';
//import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        (file.mimetype === "image/png") ?
            cb(null, `${file.fieldname}-${uuid()}.png`) :
            cb(null, `${file.fieldname}-${uuid()}.jpg`);
    }
})

// Define the maximum size for uploading
// picture i.e. 2 MB. it is optional
const maxSize = 1500 ** 2;
const upload = multer({
    storage,
    limits: { fileSize: maxSize },

    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);

        const extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        //return cb(new Error('Must be in /jpeg|jpg|png/ format'))
        return cb(null, false)

    }
}).single('upload_img')
export default upload;