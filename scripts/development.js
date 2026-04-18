import createSymlink from './utils/createSymlink.js';
import { build } from './utils/buildExtension.js';
import { symlinkTarget, outputExtensionFolderPath } from './config.js';
import Logger from './utils/logger.js';

const logger = new Logger('main')

function main() {
    createSymlink(outputExtensionFolderPath, symlinkTarget)
    build(outputExtensionFolderPath, { watch: true })
}

try {
    main()
} catch (e) {
    logger.error(e)
}
