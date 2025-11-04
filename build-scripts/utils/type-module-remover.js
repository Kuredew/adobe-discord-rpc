import fs from 'fs';

function removeTypeModule(htmlPath) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    fs.writeFileSync(htmlPath, html.replace('type=module', ''));

    console.log(`Removed "type=module" in ${htmlPath}`)
}

export default function typeModuleRemover(bundlePath) {
    removeTypeModule(`${bundlePath}/extension/index.html`)
    removeTypeModule(`${bundlePath}/panel/index.html`)
}
