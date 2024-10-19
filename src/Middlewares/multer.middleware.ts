import multer from 'multer'
import fs from 'fs'
import path from 'path'

const skinsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/skins') // Directory to store avatars
  },
  filename: (req, file, cb) => {
    const filePath = path.join(
      process.cwd(),
      'static',
      `/skins/${file.originalname}`
    )

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`)
      }
    })

    cb(null, file.originalname) // Unique filename
  },
})

const avatarsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/avatars') // Directory to store avatars
  },
  filename: (req, file, cb) => {
    const filePath = path.join(
      process.cwd(),
      'static',
      `/avatars/${file.originalname}`
    )

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`)
      }
    })

    cb(null, file.originalname) // Unique filenames
  },
})
const capesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/capes') // Directory to store avatars
  },
  filename: (req, file, cb) => {
    const filePath = path.join(
      process.cwd(),
      'static',
      `/capes/${file.originalname}`
    )

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`)
      }
    })

    cb(null, file.originalname) // Unique filename
  },
})
export const uploadSkins = multer({ storage: skinsStorage })
export const uploadAvatars = multer({ storage: avatarsStorage })
export const uploadCapes = multer({ storage: capesStorage })
