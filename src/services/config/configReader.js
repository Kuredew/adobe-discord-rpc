import fs from 'fs'

class ConfigReader {
    constructor() {
        this.config = null
        this.csInterface = new CSInterface()
    }

    loadConfig() {
        try {
            const path = this.csInterface.getSystemPath(SystemPath.EXTENSION)
            const rawConfig = fs.readFileSync(`${path}/config.json`, { encoding: 'utf-8' })
            // console.log(rawConfig);
            
            this.config = JSON.parse(rawConfig)

            console.log('[ConfigReader:loadConfig] Configuration loaded!')
        } catch (e) {
            console.log('[ConfigReader:loadConfig] Error! failed to read config : ' + e)
            // console.log(process.cwd())
        }
    }

    getConfig() {
        return this.config
    }
}

export default ConfigReader