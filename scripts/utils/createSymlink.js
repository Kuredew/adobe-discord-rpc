import path from 'path'
import fs from 'fs'
import Logger from './logger.js';

const logger = new Logger("createSymlink")
const log = (msg) => logger.log(msg)

export default function createSymlink(source, target) {
  source = path.resolve(source)

    try {
        if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });

        fs.symlinkSync(source, target, 'junction')
        log("Successfully created symlink.")
    } catch (e) {
        throw new Error(logger.parse(e.message))
    }
}
