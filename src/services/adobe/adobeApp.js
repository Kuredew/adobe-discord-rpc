import ConfigReader from "../config/configReader"

class AdobeApp {
    constructor() {
        this.ConfigReader = new ConfigReader()
        this.csInterface = new CSInterface()

        this.clientId = null
        this.appName = null
        this.appImg = null

        console.log('[AdobeApp] AdobeApp Initialized.')
    }

    load() {
        this.ConfigReader.loadConfig()

        try {
            const config = this.ConfigReader.getConfig()
            const appCode = this.csInterface.getApplicationID()

            this.adobeAppConfig = config[appCode]
            this.clientId = this.adobeAppConfig.id
            this.appName = this.adobeAppConfig.name
            this.appImg = this.adobeAppConfig.img

            console.log('[AdobeApp:load] loaded App with AppCode : ' + this.appCode)
        } catch (e) {
            console.log('[AdobeApp:load] Failed while load the app configuration : ' + e)
            return
        }
    }
}

export default AdobeApp
