import { CSEvent, CSInterface, SystemPath } from 'csinterface-ts';
import { openFolder } from '../utils';
import StateManager from '../model/stateManager'
import Logger from '../logger/logger';
import path from 'path'

const csInterface = new CSInterface();

const getStateEvent = new CSEvent('com.kureichi.rpc.get-state', 'APPLICATION')
const stateEvent = new CSEvent('com.kureichi.rpc.state-from-view', 'APPLICATION')

const header = document.getElementById('header')
const versionInfo = document.getElementById('version');
const powerSwitchButton = document.getElementById('button');

const connectionInfo = document.getElementById('state');
const statusIndicator = document.querySelector('.status-indicator');

const toggleDetails = document.getElementById('toggle-details');
const toggleState = document.getElementById('toggle-state');

const openMoreSettingsWindowButton = document.getElementById('more-button');
const openLogsFolderButton = document.getElementById('logs-folder');
const moreSettingsWindow = document.getElementById('more-container');
const closeMoreSettingsWindowButton = document.getElementById('close-more-window-button');

const togglePrivacyMode = document.getElementById('toggle-privacy-mode')
const customStateStr = document.getElementById('custom-state')
const customDetailsStr = document.getElementById('custom-details')

const toggleCustomImage = document.getElementById('toggle-custom-image')
const customImageURL = document.getElementById('custom-image-url')

const toggleCustomPrefix = document.getElementById('toggle-custom-prefix')
const customPrefixStr = document.getElementById('custom-prefix-str')

const folderLogs = path.join(csInterface.getSystemPath(SystemPath.USER_DATA), 'adobe-discord-rpc', 'logs')
const logger = Logger({
  outputPath: path.join(
    folderLogs,
    'application-logs'
  )
})

// not actually elm architecture
class App {
  constructor(stateManager) {
    this.stateManager = stateManager
    this.childLogger = logger.child({ scope: 'App' })

    this.childLogger.info('App initialized')
    this.Msg = {
      headerClick: 'HEADER_CLICK',

      showStateChange: 'STATE_CHANGE',
      showDetailsChange: 'DETAILS_CHANGE',

      openMoreSettingsWindowClick: "OPEN_MORE_SETTINGS_WINDOW_CLICK",
      openLogsFolderClick: "OPEN_LOGS_FOLDER_CLICK",
      closeMoreSettingsWindowClick: "CLOSE_MORE_SETTINGS_WINDOW_CLICK",

      privacyModeToggleChange: 'PRIVACY_MODE_TOGGLE_CHANGE',
      customStateStrChange: 'CUSTOM_STATE_STR_CHANGE',
      customDetailsStrChange: 'CUSTOM_DETAILS_STR_CHANGE',

      customImageChange: 'CUSTOM_IMAGE_CHANGE',
      customImageURLChange: 'CUSTOM_IMAGE_URL_CHANGE',
      customPrefixChange: 'CUSTOM_PREFIX_CHANGE',
      customPrefixStrChange: 'CUSTOM_PREFIX_URL_CHANGE',

      powerButtonClick: 'POWER_BUTTON_CLICK'
    }
  }

  Update(msg) {
    const currentState = this.stateManager.getState()
    const newModel = { ...currentState }

    switch (msg.type) {
      case this.Msg.headerClick:
        csInterface.openURLInDefaultBrowser('https://github.com/Kuredew/adobe-discord-rpc')
        break
      case this.Msg.showStateChange:
        newModel.showState = toggleState.checked
        break
      case this.Msg.showDetailsChange:
        newModel.showDetails = toggleDetails.checked
        break
      case this.Msg.openMoreSettingsWindowClick:
        newModel.showMoreSettingsWindow = true
        break
      case this.Msg.openLogsFolderClick:
        openFolder(folderLogs)
        break
      case this.Msg.closeMoreSettingsWindowClick:
        newModel.showMoreSettingsWindow = false
        break
      case this.Msg.privacyModeToggleChange:
        newModel.privacyMode = togglePrivacyMode.checked
        break
      case this.Msg.customStateStrChange:
        newModel.customStateStr = customStateStr.value
        break
      case this.Msg.customDetailsStrChange:
        newModel.customDetailsStr = customDetailsStr.value
        break
      case this.Msg.customImageChange:
        newModel.customImage = toggleCustomImage.checked
        newModel.customImageURL = customImageURL.value
        break
      case this.Msg.customImageURLChange:
        newModel.customImageURL = customImageURL.value
        break
      case this.Msg.customPrefixChange:
        newModel.customPrefix = toggleCustomPrefix.checked
        newModel.customPrefixStr = customPrefixStr.value
        break
      case this.Msg.customPrefixStrChange:
        newModel.customPrefixStr = customPrefixStr.value
        break
      case this.Msg.powerButtonClick:
        newModel.power = currentState.power ? false : true
        break
      default:
        this.childLogger.error('Msg not match')
    }

    // this.childLogger.info(`Updated State to ${JSON.stringify(currentState, null, 2)}`)
    return newModel
  }


  ViewRender(dispatch) {
    const newState = this.stateManager.getState()

    switch (newState.rpcConnection) {
      case "connected":
        connectionInfo.innerHTML = 'Connected'
        statusIndicator.className = 'status-indicator connected'
        break
      case "connecting":
        connectionInfo.innerHTML = 'Connecting...'
        statusIndicator.className = 'status-indicator connecting'
        break
      case "disconnected":
        connectionInfo.innerHTML = 'Disconnected'
        statusIndicator.className = 'status-indicator disconnected'
        break
    }

    switch (newState.power) {
      case true:
        powerSwitchButton.innerHTML = 'On'
        powerSwitchButton.className = 'power-on'
        break
      case false:
        powerSwitchButton.innerHTML = 'Off'
        powerSwitchButton.className = 'power-off'
        break
    }
    versionInfo.innerHTML = newState.versionInfo

    header.onclick = () => dispatch({ type: this.Msg.headerClick })

    powerSwitchButton.onclick = () => dispatch({ type: this.Msg.powerButtonClick })

    toggleState.checked = newState.showState
    toggleState.onchange = () => dispatch({ type: this.Msg.showStateChange })

    toggleDetails.checked = newState.showDetails
    toggleDetails.onchange = () => dispatch({ type: this.Msg.showDetailsChange })

    openMoreSettingsWindowButton.onclick = () => dispatch({ type: this.Msg.openMoreSettingsWindowClick })
    openLogsFolderButton.onclick = () => dispatch({ type: this.Msg.openLogsFolderClick })

    closeMoreSettingsWindowButton.onclick = () => dispatch({ type: this.Msg.closeMoreSettingsWindowClick })
    moreSettingsWindow.style.display = newState.showMoreSettingsWindow ? 'flex' : 'none'

    togglePrivacyMode.checked = newState.privacyMode
    togglePrivacyMode.onchange = () => dispatch({ type: this.Msg.privacyModeToggleChange })

    customStateStr.disabled = !togglePrivacyMode.checked
    !togglePrivacyMode.checked ? customStateStr.classList.add('disabled') : customStateStr.classList.remove('disabled')
    customStateStr.value = newState.customStateStr
    customStateStr.onchange = () => dispatch({ type: this.Msg.customStateStrChange })

    customDetailsStr.disabled = !togglePrivacyMode.checked
    !togglePrivacyMode.checked ? customDetailsStr.classList.add('disabled') : customDetailsStr.classList.remove('disabled')
    customDetailsStr.value = newState.customDetailsStr
    customDetailsStr.onchange = () => dispatch({ type: this.Msg.customDetailsStrChange })

    toggleCustomImage.checked = newState.customImage
    toggleCustomImage.onchange = () => dispatch({ type: this.Msg.customImageChange })

    customImageURL.disabled = !toggleCustomImage.checked
    !toggleCustomImage.checked ? customImageURL.classList.add('disabled') : customImageURL.classList.remove('disabled')
    customImageURL.value = newState.customImageURL
    customImageURL.onchange = () => dispatch({ type: this.Msg.customImageURLChange })

    toggleCustomPrefix.checked = newState.customPrefix
    toggleCustomPrefix.onchange = () => dispatch({ type: this.Msg.customPrefixChange })

    customPrefixStr.disabled = !toggleCustomPrefix.checked
    !toggleCustomPrefix.checked ? customPrefixStr.classList.add('disabled') : customPrefixStr.classList.remove('disabled')
    customPrefixStr.value = newState.customPrefixStr
    customPrefixStr.onchange = () => dispatch({ type: this.Msg.customPrefixStrChange })

    this.childLogger.info('Component rendered')

    return
  }
}


function main() {
  const childLogger = logger.child({ scope: 'Main' })
  const stateManager = new StateManager(localStorage, childLogger.child({ scope: 'StateManager' }))
  stateManager.init()
  const app = new App(stateManager)

  csInterface.addEventListener('com.kureichi.rpc.state-from-backend', (response) => {
    stateManager.setState(response.data)
    render()
  })

  const dispatchStateEvent = (state) => {
    stateEvent.data = state
    csInterface.dispatchEvent(stateEvent)

    childLogger.info('Dispatched State')
  }

  const dispatch = (msg) => {
    childLogger.info('Got msg from View, updating state')

    const newState = app.Update(msg)
    stateManager.setState(newState)

    dispatchStateEvent(newState)
  }

  const render = () => {
    childLogger.info('Rendering component')
    app.ViewRender(dispatch)
  }

  setTimeout(() => {
    csInterface.dispatchEvent(getStateEvent)
  }, 1000)
}

window.onload = () => main()
