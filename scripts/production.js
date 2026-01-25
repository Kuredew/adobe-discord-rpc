import build from "./utils/buildExtension.js";
import { 
  bundleName, 
  outputCertPath, 
  outputExtensionFolderPath, 
  outputExtensionZipPath, 
  outputExtensionZxpPath 
} from './config.js';
import Logger from "./utils/logger.js";
import archiveZip from "./utils/archiveZip.js";
import createZxp from "./utils/createZxp.js";

const logger = new Logger("production")
const log = (msg) => logger.log(msg)

async function main() {
  log("Building Extension...")
  build(outputExtensionFolderPath)

  log("Archiving Extension to ZIP...")
  archiveZip(outputExtensionFolderPath, outputExtensionZipPath, bundleName)

  log("Creating ZXP Bundle...")
  await createZxp(outputExtensionFolderPath, outputCertPath, outputExtensionZxpPath)

  log("Done!")
}

try {
  await main()
} catch (e) {
  logger.error(e.message)
}