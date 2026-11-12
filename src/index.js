import { CSEvent, CSInterface, SystemPath } from "csinterface-ts"
import ViewRender from "./ViewRender"
import StateManager from "../model/stateManager"
import Logger from "../logger/logger"
import path from "path"

function main() {
  const csInterface = new CSInterface()
  const baseLogger = Logger({
    outputPath: path.join(
      csInterface.getSystemPath(SystemPath.USER_DATA),
      'adobe-discord-rpc', 'logs', 'panel-logs'
    )
  })

  const stateManager = new StateManager(localStorage, baseLogger.child({ scope: 'stateManager' }))
  stateManager.init()

  const viewRender = new ViewRender({ stateManager, logger: baseLogger })
  viewRender.render()

  const getStateEvent = new CSEvent('com.kureichi.rpc.get-state', 'APPLICATION')

  let gotState = false

  csInterface.addEventListener('com.kureichi.rpc.state-from-backend', (response) => {
    gotState = true
    stateManager.setState(response.data)
    viewRender.render()
  })

  const readyEvent = new CSEvent('com.kureichi.rpc.ready', 'APPLICATION')
  let tries = 0

  const requestState = () => {
    if (gotState || tries >= 30) return
    tries += 1
    if (tries === 1 || tries % 5 === 0) csInterface.dispatchEvent(readyEvent)
    csInterface.dispatchEvent(getStateEvent)
    setTimeout(requestState, 1000)
  }
  setTimeout(requestState, 500)
}

window.onload = () => main()