import multer from "multer"
import path from "path"

// Configure temporary disk storage for uploaded resumes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Files are staged temporarily inside the public directory
        cb(null, './public')
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using timestamp to avoid name collisions
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})
  
export const upload = multer({ storage: storage })
