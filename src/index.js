import AdobeRPC from "./services/adobe/adobeRPC"
import AdobeApp from "./services/adobe/adobeApp"
import StateEvent from "./services/event/stateEvent"
import StateManager from "./model/stateManager"
import VersionCheck from "./services/github/versionCheck"
import ConfigReader from "./services/config/configReader"
import ManifestReader from "./services/manifest/ManifestReader"
import { Logger } from "./logger/logger"

const getVersion = async ({
    stateManager,
    baseLogger,
    csInterface
}) => {
    const manifestReader = new ManifestReader(csInterface)
    const versionCheck = new VersionCheck(manifestReader, baseLogger.child('VersionCheck'))
    const versionInfo = await versionCheck.getVersion()
    stateManager.setState({ versionInfo: versionInfo })
}

function main() {
    const csInterface = new CSInterface()
    const baseLogger = new Logger(
        csInterface,
        'daemon-log',
        {
            label: 'Daemon'
        }
    )

    const configReader = new ConfigReader(baseLogger.child('ConfigReader'), csInterface)
    const stateManager = new StateManager(localStorage, baseLogger.child('stateManager'))
    stateManager.init()

    const adobeApp = new AdobeApp({
        logger: baseLogger.child('AdobeApp'),
        configReader,
        csInterface
   })

    const rpc = new AdobeRPC({ 
        stateManager,
        logger: baseLogger.child('AdobeRPC'),
        adobeApp
    })

    const stateEvent = new StateEvent({
        stateManager, 
        logger: baseLogger.child('StateEvent'),
        csInterface,
        csEvent: CSEvent
    })
    
    stateEvent.on('stateFromView', (state) => {
        stateManager.setState(state)
    })
    rpc.on('adobeInfoChange', (info) => {
        stateManager.setState(info)
    })
    rpc.on('connectionChange', (connection) => {
        stateManager.setState({ rpcConnection: connection })
    })


    stateEvent.registerListener()
    rpc.startService()

    csInterface.addEventListener(CSInterface.ADOBE_APPLICATION_BEFORE_APPCLOSE, () => {
        rpc.logout()
    })
    
    getVersion({
        stateManager,
        baseLogger,
        csInterface
    })
}


window.onload = () => main()
