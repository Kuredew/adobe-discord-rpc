import ManifestReader from "../manifest/ManifestReader"

class VersionCheck {
    constructor() {
        this.isLatestVersion = null
        this.currentVersion = null
        this.currentVersionStr = null

        this.repoUrl = "https://api.github.com/repos/Kuredew/adobe-discord-rpc"

        this.manifestReader = new ManifestReader()
    }

    async getVersion() {
        this.manifestReader.load()
        this.currentVersion = this.manifestReader.getManifestVersion()

        this.currentVersionStr = 'v' + this.currentVersion

        try {
            console.log('[VersionCheck:check] Checking latest version...')

            const response = await fetch(`${this.repoUrl}/releases/latest`)
            if (!response.ok) {
                console.log('[VersionCheck:check] Response not ok, retrying...');
                setTimeout(() => this.check(), 3000);
            }

            console.log('[VersionCheck:check] Response is OK')
            const data = await response.json()

            const latestVersion = data.tag_name;
            if (parseInt(latestVersion) > parseInt(this.currentVersion)) {
                console.log(`[VersionCheck:check] Version (${this.currentVersionStr}) is outdated, consider to update (to ${latestVersion})`)

                this.isLatestVersion = false
                return `New Update ${latestVersion} ↗`
            }

            console.log(`[VersionCheck:check] This is latest version (${this.currentVersion})`)
            this.isLatestVersion = true
            return this.currentVersionStr
        } catch(e) {
            console.log('Panel:: Error while trying to fetch api, ' + e);
            setTimeout(() => this.check(), 5000);
        }
    }
}

export default VersionCheck
