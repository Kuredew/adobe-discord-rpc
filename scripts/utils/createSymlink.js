// const path = require('path');
import path from 'path'
// const fs = require('fs');
import fs from 'fs'

const source = path.resolve("./dist")
const target = "C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/com.kureichi.discordrpc"

export default function createSymlink() {
    try {
        if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });

        fs.symlinkSync(source, target, 'junction')
        console.log("::SYMLINK : Successfully created symlink.")
    } catch (e) {
        console.log(`::SYMLINK : Failed to create symlink : ${e}`)
    }
}
