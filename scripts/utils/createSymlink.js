import fs from 'fs'
import { logger } from './logger.js'

export function createSymlink(target, path) {
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }
    fs.symlinkSync(target, path, 'junction')
  } catch (e) {
    throw new Error(logger.parse(e.message), { cause: e })
  }
}