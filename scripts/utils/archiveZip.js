import fs from "fs";
import archiver from "archiver";
import Logger from "./logger.js";

const logger = new Logger("archiveZIP")
const log = (msg) => logger.log(msg)

export default function archiveZip(fromPath, destPath, bundleName) {
  try {
    log(`Creating write stream output...`)
    const output = fs.createWriteStream(destPath)

    log(`Creating archiver instance...`)
    const archive = archiver("zip")
    archive.pipe(output)

    log(`Archiving ${fromPath} to ${destPath}`)
    archive.directory(fromPath, bundleName)

    log(`Finailzing`)
    archive.finalize()
  } catch (e) {
    throw new Error(logger.parse(e.message))
  }
}