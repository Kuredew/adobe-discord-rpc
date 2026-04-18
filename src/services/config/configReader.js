import fs from 'fs'

class ConfigReader {
    constructor(logger, csInterface) {
        this.logger = logger
        this.config = null
        this.csInterface = csInterface
    }

    loadConfig() {
        try {
            // eslint-disable-next-line no-undef
            const path = this.csInterface.getSystemPath(SystemPath.EXTENSION)
            const rawConfig = fs.readFileSync(`${path}/config.json`, { encoding: 'utf-8' })
            
            this.config = JSON.parse(rawConfig)

            this.logger.info('Configuration loaded!')
        } catch (e) {
            this.logger.info('Error! failed to read config : ' + e)
            // console.log(process.cwd())
        }
    }

    getConfig() {
        return this.config
    }
}

export default ConfigReader