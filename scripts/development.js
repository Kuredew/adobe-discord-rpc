import chokidar from 'chokidar';
import build from './utils/buildExtension.js';
import createSymlink from './utils/createSymlink.js';
import { symlinkTarget, outputExtensionFolderPath } from './config.js';
import Logger from './utils/logger.js';

const logger = new Logger("development")
const log = (msg) => logger.log(msg)

const watcher = chokidar.watch(['./src'], { ignoreInitial: true })

let cooldown = false
function main() {
    build(outputExtensionFolderPath)
    createSymlink(outputExtensionFolderPath, symlinkTarget)

    log("Watching File...")

    watcher.on('all', async() => {
        if (cooldown) {
            log('Cooldown build')
            return
        }

        log('Change detected, Rebuilding...')
        build(outputExtensionFolderPath)

        log("Watching File...")

        cooldown = true
        setTimeout(() => {
            cooldown = false
        }, 2000)
    })
}

main()
