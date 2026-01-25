import { execSync } from 'child_process'
import fs from 'fs'
import Logger from './logger.js'

const logger = new Logger("buildExtension")
const log = (msg) => logger.log(msg)

let isCopied = false
function build(outputExtensionFolder) {
  try {
    if (!isCopied) fs.rmSync(`${outputExtensionFolder}`, { recursive: true, force: true })

    log(`Building extension to ${outputExtensionFolder}`)
    execSync(`parcel build ./src/view/index.js ./src/index.js --no-source-maps --public-url ./ --dist-dir ${outputExtensionFolder}`, { stdio: "inherit" })
    log('Done!')

    if (isCopied) return

    log(`Copying dependencies to ${outputExtensionFolder}`)

    log(`Copying assets...`)
    fs.cpSync("./src/view/assets", `${outputExtensionFolder}/view/assets`, {recursive: true})

    log(`Copying panel index.html...`)
    fs.cpSync("./src/view/index.html", `${outputExtensionFolder}/view/index.html`)
    log(`Copying extension index.html...`)
    fs.cpSync("./src/index.html", `${outputExtensionFolder}/index.html`)

    log(`Copying .debug...`)
    fs.cpSync("./.debug", `${outputExtensionFolder}/.debug`)
    log(`Copying CSXS...`)
    fs.cpSync("./CSXS", `${outputExtensionFolder}/CSXS`, {recursive: true})
    log(`Copying libs...`)
    fs.cpSync("./libs", `${outputExtensionFolder}/libs`, {recursive: true})
    log(`Copying jsx host...`)
    fs.cpSync("./jsx", `${outputExtensionFolder}/jsx`, {recursive: true})

    log(`Copying dependency...`)
    fs.cpSync("./scripts/dep/node_modules", `${outputExtensionFolder}/node_modules`, {recursive: true})
    log(`Copying config.json...`)
    fs.cpSync("./config.json", `${outputExtensionFolder}/config.json`)

    log('Successfully copied dependencies.')

    isCopied = true
  } catch (e) {
    throw new Error(logger.parse(e.message))
  }
}

export default build
