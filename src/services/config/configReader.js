import fs from 'fs'
import { Logger } from '../../logger/logger'

class ConfigReader {
    constructor() {
        this.logger = new Logger('ConfigReader')
        this.config = null
        this.csInterface = new CSInterface()
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