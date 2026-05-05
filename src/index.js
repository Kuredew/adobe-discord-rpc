import AdobeRPC from "./services/adobe/adobeRPC"
import AdobeApp from "./services/adobe/adobeApp"
import StateEvent from "./services/event/stateEvent"
import StateManager from "./model/stateManager"
import VersionCheck from "./services/github/versionCheck"
import ConfigReader from "./services/config/configReader"
import ManifestReader from "./services/manifest/ManifestReader"
import Logger from "./logger/logger"
import path from 'path'
import { CSEvent, CSInterface, SystemPath } from "csinterface-ts"

const getVersion = async ({
  stateManager,
  baseLogger,
  csInterface
}) => {
  const manifestReader = new ManifestReader(csInterface, SystemPath.EXTENSION)
  const versionCheck = new VersionCheck(manifestReader, baseLogger.child({ scope: 'VersionCheck' }))
  const versionInfo = await versionCheck.getVersion()
  stateManager.setState({ versionInfo: versionInfo })
}

function main() {
  const csInterface = new CSInterface()
  const baseLogger = Logger({
    outputPath: path.join(
      csInterface.getSystemPath(SystemPath.USER_DATA),
      'adobe-discord-rpc', 'logs', 'daemon-logs'
    )
  })

  const configReader = new ConfigReader(baseLogger.child({ scope: 'ConfigReader' }), csInterface, SystemPath.EXTENSION)
  const stateManager = new StateManager(localStorage, baseLogger.child({ scope: 'stateManager' }))
  stateManager.init()

  const adobeApp = new AdobeApp({
    logger: baseLogger.child({ scope: 'AdobeApp' }),
    configReader,
    csInterface
  })

  const rpc = new AdobeRPC({
    stateManager,
    logger: baseLogger.child({ scope: 'AdobeRPC' }),
    adobeApp,
    csInterface
  })

  const stateEvent = new StateEvent({
    stateManager,
    logger: baseLogger.child({ scope: 'StateEvent' }),
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
  rpc.on('connectionError', () => {
    stateManager.setState({ power: false })
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
