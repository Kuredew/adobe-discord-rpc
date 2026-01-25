import chokidar from 'chokidar';
import build from './utils/buildExtension.js';
import createSymlink from './utils/createSymlink.js';
import { symlinkTarget, outputExtensionFolderPath } from './config.js';
import Logger from './utils/logger.js';

const logger = new Logger("development")
const log = (msg) => logger.log(msg)

const watcher = chokidar.watch(['./src'], { ignoreInitial: true })

let building = true
function main() {
    build(outputExtensionFolderPath)
    createSymlink(outputExtensionFolderPath, symlinkTarget)

    log("Watching File...")

    building = false
    watcher.on('all', async() => {
        if (building) return;

        building = true

        log('Change detected, Rebuilding...')
        build(outputExtensionFolderPath)

        building = false
        log("Watching File...")
    })
}

main()
