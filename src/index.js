import AdobeRPC from "./services/adobe/adobeRPC"
import StateEvent from "./services/event/stateEvent"
import StateManager from "./model/stateManager"
import VersionCheck from "./services/github/versionCheck"

async function main() {
    const csInterface = new CSInterface()
    const versionCheck = new VersionCheck()
    const stateManager = new StateManager(localStorage)
    const rpc = new AdobeRPC(stateManager)
    stateManager.init()

    const stateEvent = new StateEvent(stateManager, csInterface)
    const versionInfo = await versionCheck.getVersion()
    stateManager.setState({ versionInfo: versionInfo })
    
    stateEvent.registerListener()
    stateEvent.on('stateFromView', (state) => {
        stateManager.setState(state)
    })

    rpc.on('adobeInfoChange', (info) => {
        stateManager.setState(info)
    })
    rpc.on('connectionChange', (connection) => {
        stateManager.setState({ rpcConnection: connection })
    })
    rpc.startService()

    csInterface.addEventListener(CSInterface.ADOBE_APPLICATION_BEFORE_APPCLOSE, () => {
        rpc.logout()
    })
}


window.onload = () => main()
