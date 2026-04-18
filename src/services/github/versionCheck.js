class VersionCheck {
    constructor(manifestReader, logger) {
        this.logger = logger
        this.isLatestVersion = null
        this.currentVersion = null
        this.currentVersionStr = null

        this.repoUrl = "https://api.github.com/repos/Kuredew/adobe-discord-rpc"

        this.manifestReader = manifestReader
    }

    async getVersion() {
        this.manifestReader.load()
        this.currentVersion = this.manifestReader.getManifestVersion()

        this.currentVersionStr = 'v' + this.currentVersion

        try {
            this.logger.info('Checking latest version...')

            const response = await fetch(`${this.repoUrl}/releases/latest`)
            if (!response.ok) {
                this.logger.info('Response not ok, retrying...');
                setTimeout(() => this.check(), 3000);
            }

            this.logger.info('Response is OK')
            const data = await response.json()

            const latestVersion = data.tag_name;
            if (parseInt(latestVersion) > parseInt(this.currentVersion)) {
                this.logger.warn(`Version (${this.currentVersionStr}) is outdated, consider to update (to ${latestVersion})`)

                this.isLatestVersion = false
                return `New Update ${latestVersion} ↗`
            }

            this.logger.info(`This is latest version (${this.currentVersion})`)
            this.isLatestVersion = true
            return this.currentVersionStr
        } catch(e) {
            this.logger.error('Error while trying to fetch api, ' + e);
            setTimeout(() => this.check(), 5000);
        }
    }
}

export default VersionCheck
