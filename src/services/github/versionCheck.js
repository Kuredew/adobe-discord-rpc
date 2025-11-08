import ManifestReader from "../manifest/ManifestReader"

class VersionCheck {
    constructor() {
        this.isLatestVersion = null
        this.currentVersion = null
        this.currentVersionStr = null

        this.repoUrl = "https://api.github.com/repos/Kuredew/adobe-discord-rpc"

        this.manifestReader = new ManifestReader()
    }

    check(callback) {
        this.manifestReader.load()
        this.currentVersion = this.manifestReader.getManifestVersion()

        this.currentVersionStr = 'v' + this.currentVersion

        fetch(`${this.repoUrl}/releases/latest`).then((response) => {
            console.log('[VersionCheck:check] Fetched Repository to check version')
            if (response.ok) {
                console.log('[VersionCheck:check] Response is OK')
                response.json().then((data) => {
                    console.log('[VersionCheck:check] Data is convert to JSON')

                    const latestVersion = data.tag_name;
                    if (parseInt(latestVersion) > parseInt(this.currentVersion)) {
                        console.log(`[VersionCheck:check] Version (${this.currentVersionStr}) is outdated, consider to update (to ${latestVersion})`)

                        this.isLatestVersion = false
                        callback(`New Update ${latestVersion} ↗`)
                        return
                    }

                    console.log(`[VersionCheck:check] This is latest version (${this.currentVersion})`)

                    this.isLatestVersion = true
                    callback(this.currentVersionStr)
                    return
                })

                return
            }

            console.log('[VersionCheck:check] Response not ok, retrying...');
            setTimeout(() => this.check(callback), 3000);
        }).catch(() => {
            console.log('Panel:: Error while trying to fetch api, ' + e);
            setTimeout(() => this.check(callback), 5000);
        })
    }
}

export default VersionCheck
