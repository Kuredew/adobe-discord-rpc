import AdobeRPC from "./services/adobe/adobeRPC"
import StateEvent from "./services/event/stateEvent"
import StateManager from "./model/stateManager"
// import versionCheckService from "./services/versionCheckService"

function main() {
    const csInterface = new CSInterface()

    const stateManager = new StateManager(localStorage)
    const rpc = new AdobeRPC(stateManager)
    const stateEvent = new StateEvent(stateManager)

    stateEvent.registerListener(() => [
        rpc.reload()
    ])

    rpc.login(() => stateEvent.dispatchEvent())

    // versionCheckService(
    //     'https://api.github.com/repos/Kureichi/adobe-discord-rpc/releases/latest',
    //     csInterface.getSystemPath(SystemPath.EXTENSION) + '/version.txt', () => {
    //         stateManager.latestVersionAvailable = true
    //         stateEvent.dispatchEvent()
    // })
}


window.onload = () => main()
