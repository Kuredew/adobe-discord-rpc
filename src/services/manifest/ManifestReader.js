import fs from 'fs'

class ManifestReader {
    constructor() {
        this.manifestVersion = null
        this.csInterface = new CSInterface()
    }

    load() {
        const path = this.csInterface.getSystemPath(SystemPath.EXTENSION)
        const manifestContent = fs.readFileSync(`${path}/CSXS/manifest.xml`, 'utf8');

        // Parse the XML content to extract the version
        const versionMatch = manifestContent.match(/ExtensionBundleVersion="([\d.]+)"/);
        if (versionMatch && versionMatch[1]) {
            this.manifestVersion = versionMatch[1];
        }
    }

    getManifestVersion() {
        return this.manifestVersion
    }
}


export default ManifestReader
