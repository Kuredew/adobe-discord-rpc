import fs from 'fs';

function copyFolder(sourceDir, destinationDir, isDir) {
try {
    fs.cpSync(sourceDir, destinationDir, { recursive: isDir });
    console.log(`Folder '${sourceDir}' copied to '${destinationDir}' successfully!`);
} catch (err) {
    console.error('Error copying folder:', err);
}
}

export default function copyDependency(bundlePath) {
    copyFolder('CSXS/', `${bundlePath}/CSXS/`, true);
    copyFolder('jsx/', `${bundlePath}/jsx/`, true);
    copyFolder('libs/', `${bundlePath}/libs/`, true);
    copyFolder('.debug', `${bundlePath}/.debug`, false);
}
