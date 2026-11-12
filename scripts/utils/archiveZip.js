import fs from "fs";
import archiver from "archiver";
import Logger from "./logger.js";

const logger = new Logger("archiveZIP")
const log = (msg) => logger.log(msg)

export default function archiveZip(fromPath, destPath, bundleName) {
  return new Promise((resolve, reject) => {
    try {
      log(`Creating write stream output...`)
      const output = fs.createWriteStream(destPath)

      log(`Creating archiver instance...`)
      const archive = archiver("zip")

      const fail = (e) => reject(new Error(logger.parse(e.message), { cause: e }))

      output.on("close", () => {
        log(`Archive created (${archive.pointer()} bytes)`)
        resolve()
      })
      output.on("error", fail)
      archive.on("error", fail)

      archive.pipe(output)

      log(`Archiving ${fromPath} to ${destPath}`)
      archive.directory(fromPath, bundleName)

      log(`Finalizing`)
      archive.finalize()
    } catch (e) {
      reject(new Error(logger.parse(e.message), { cause: e }))
    }
  })
}