import { execSync } from 'child_process'
import fs from 'fs'

let isCopied = false
function build() {
    if (!isCopied) fs.rmSync('./dist', { recursive: true, force: true })

    console.log('::BUILD : Building extension to ./dist')
    execSync("parcel build ./panel/panel.js ./extension/rpc.js --no-source-maps --public-url ./ --dist-dir ./dist", { stdio: "inherit" })
    console.log('::BUILD : Done!')

    if (isCopied) return

    console.log('::BUILD : Copying dependencies to ./dist')

    fs.cpSync("./panel/index.html", './dist/panel/index.html')
    fs.cpSync("./panel/assets", './dist/panel/assets', {recursive: true})
    fs.cpSync("./extension/index.html", './dist/extension/index.html')
    fs.cpSync("./.debug", './dist/.debug')
    fs.cpSync("./CSXS", './dist/CSXS', {recursive: true})
    fs.cpSync("./libs", './dist/libs', {recursive: true})
    fs.cpSync("./jsx", './dist/jsx', {recursive: true})

    console.log('::BUILD : Successfully copied dependencies.')

    isCopied = true
}

export default build
