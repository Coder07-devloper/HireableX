const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        filesize: 3 * 1024 * 1024 // file size = 3MB
    }
})

module.exports = upload 