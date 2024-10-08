import multer from 'multer'

const skinsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/skins') // Directory to store avatars
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname) // Unique filename
  },
})

const avatarsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/avatars') // Directory to store avatars
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname) // Unique filename
  },
})
const capesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/capes') // Directory to store avatars
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname) // Unique filename
  },
})
export const uploadSkins = multer({ storage: skinsStorage })
export const uploadAvatars = multer({ storage: avatarsStorage })
export const uploadCapes = multer({ storage: capesStorage })
