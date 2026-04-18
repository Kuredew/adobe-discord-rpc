class AdobeApp {
    constructor({ logger, configReader, csInterface }) {
        this.logger = logger
        this.ConfigReader = configReader
        this.csInterface = csInterface

        this.clientId = null
        this.appName = null
        this.appImg = null

        this.logger.info('AdobeApp Initialized.')
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

            this.logger.info('loaded App with AppCode : ' + appCode)
        } catch (e) {
            this.logger.info('Failed while load the app configuration : ' + e)
            return
        }
    }
}

export default AdobeApp
