import { execSync } from 'child_process'
import fs from 'fs'

let isCopied = false
function build() {
    if (!isCopied) fs.rmSync('./dist', { recursive: true, force: true })

    console.log('::BUILD : Building extension to ./dist')
    execSync("parcel build ./src/view/index.js ./src/index.js --no-source-maps --public-url ./ --dist-dir ./dist", { stdio: "inherit" })
    console.log('::BUILD : Done!')

    if (isCopied) return

    console.log('::BUILD : Copying dependencies to ./dist')

    fs.cpSync("./src/view/assets", './dist/view/assets', {recursive: true})
    fs.cpSync("./src/view/index.html", './dist/view/index.html')
    fs.cpSync("./src/index.html", './dist/index.html')

    fs.cpSync("./.debug", './dist/.debug')
    fs.cpSync("./CSXS", './dist/CSXS', {recursive: true})
    fs.cpSync("./libs", './dist/libs', {recursive: true})
    fs.cpSync("./jsx", './dist/jsx', {recursive: true})

    fs.cpSync("./scripts/dep/node_modules", './dist/node_modules', {recursive: true})
    fs.cpSync("./config.json", './dist/config.json')

    console.log('::BUILD : Successfully copied dependencies.')

    isCopied = true
}

export default build
