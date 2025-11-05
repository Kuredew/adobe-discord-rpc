import chokidar from 'chokidar';
import build from './utils/build.js';
import createSymlink from './utils/createSymlink.js';

const watcher = chokidar.watch(['./src'], { ignoreInitial: true })

let building = true
function main() {
    build()
    createSymlink()

    console.log("::WATCHER : Watching File...")

    building = false
    watcher.on('all', async() => {
        if (building) return;

        building = true

        console.log('::WATCHER : Change detected, Rebuilding...')
        build()

        building = false
        console.log("::WATCHER : Watching File...")
    })
}

main()
