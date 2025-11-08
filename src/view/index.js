import StateManager from '../model/stateManager'

const PanelVersion = 'v2.3.0-beta.1';
const apiUrl = 'https://api.github.com/repos/Kuredew/adobe-discord-rpc/releases/latest';

const csInterface = new CSInterface();

const getStateEvent = new CSEvent('com.kureichi.rpc.get-state', 'APPLICATION')
const stateEvent = new CSEvent('com.kureichi.rpc.state-from-view', 'APPLICATION')

const versionInfo = document.getElementById('version');
const powerSwitchButton = document.getElementById('button');

const connectionInfo = document.getElementById('state');
const statusIndicator = document.querySelector('.status-indicator');

const toggleDetails = document.getElementById('toggle-details');
const toggleState = document.getElementById('toggle-state');

const openMoreSettingsWindowButton = document.getElementById('more-button');
const moreSettingsWindow = document.getElementById('more-container');
const closeMoreSettingsWindowButton = document.getElementById('close-more-window-button');

const toggleCustomImage = document.getElementById('toggle-custom-image')
const customImageURL = document.getElementById('custom-image-url')

const toggleCustomPrefix = document.getElementById('toggle-custom-prefix')
const customPrefixStr = document.getElementById('custom-prefix-str')

// ELM Arch in js yeah
class App {
    constructor() {
        console.log('[App] App initialized')
        this.Msg = {
            showStateChange: 'STATE_CHANGE',
            showDetailsChange: 'DETAILS_CHANGE',

            openMoreSettingsWindowClick: "OPEN_MORE_SETTINGS_WINDOW_CLICK",
            closeMoreSettingsWindowClick: "CLOSE_MORE_SETTINGS_WINDOW_CLICK",

            customImageChange: 'CUSTOM_IMAGE_CHANGE',
            customImageURLChange: 'CUSTOM_IMAGE_URL_CHANGE',
            customPrefixChange: 'CUSTOM_PREFIX_CHANGE',
            customPrefixStrChange: 'CUSTOM_PREFIX_URL_CHANGE',

            powerButtonClick: 'POWER_BUTTON_CLICK'
        }
    }

    Update(msg, currentState) {
        const newModel = { ...currentState }

        switch (msg.type) {
            case this.Msg.showStateChange:
                newModel.showState = toggleState.checked
                break
            case this.Msg.showDetailsChange:
                newModel.showDetails = toggleDetails.checked
                break
            case this.Msg.openMoreSettingsWindowClick:
                newModel.showMoreSettingsWindow = true
                break
            case this.Msg.closeMoreSettingsWindowClick:
                newModel.showMoreSettingsWindow = false
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
                const currentPower = currentState.power
                newModel.power = currentPower ? false : true
                break
            default:
                console.log('[App:Update] Msg not match')
        }

        console.log(`[App:Update] Updated State to ${JSON.stringify(currentState, null, 2)}`)
        return newModel
    }


    ViewRender(newState, dispatch) {
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

        powerSwitchButton.onclick = () => dispatch({ type: this.Msg.powerButtonClick })

        toggleState.checked = newState.showState
        toggleState.onchange = () => dispatch({ type: this.Msg.showStateChange })

        toggleDetails.checked = newState.showDetails
        toggleDetails.onchange = () => dispatch({ type: this.Msg.showDetailsChange })

        openMoreSettingsWindowButton.onclick = () => dispatch({ type: this.Msg.openMoreSettingsWindowClick })
        closeMoreSettingsWindowButton.onclick = () => dispatch({ type: this.Msg.closeMoreSettingsWindowClick })
        moreSettingsWindow.style.display = newState.showMoreSettingsWindow ? 'flex' : 'none'

        toggleCustomImage.checked = newState.customImage
        toggleCustomImage.onchange = () => dispatch({ type: this.Msg.customImageChange })

        customImageURL.value = newState.customImageURL
        customImageURL.onchange = () => dispatch({ type: this.Msg.customImageURLChange })

        toggleCustomPrefix.checked = newState.customPrefix
        toggleCustomPrefix.onchange = () => dispatch({ type: this.Msg.customPrefixChange })

        customPrefixStr.value = newState.customPrefixStr
        customPrefixStr.onchange = () => dispatch({ type: this.Msg.customPrefixStrChange })

        console.log('[App:ViewRender] Component rendered')

        // while this is not a perfect elm architecture, we can just update the html directly and return empty to make it faster
        return
    }
}


function main() {
    const app = new App()
    const stateManager = new StateManager(localStorage)

    // we decided to use the state object instead of updating directly to the state class
    let currentState = stateManager.toObj()

    csInterface.addEventListener('com.kureichi.rpc.state-from-backend', (r) => {
        console.log('[Main:listener] Got State from backend, received with value : ' + JSON.stringify(r.data, null, 4))
        // currentState.updateFromObj(r.data)
        currentState = r.data
        render(currentState)
    })

    const dispatchStateEvent = (state) => {
        stateEvent.data = state
        csInterface.dispatchEvent(stateEvent)

        console.log('[Main:dispatchStateEvent] Dispatched State')
    }

    const dispatch = (msg) => {
        console.log('[Main:dispatch] Got msg from View, updating state')

        currentState = app.Update(msg, currentState)
        dispatchStateEvent(currentState)
    }

    const render = (state) => {
        console.log('[Main:render] Rendering component')
        app.ViewRender(state, dispatch)
    }

    setTimeout(() => {
        csInterface.dispatchEvent(getStateEvent)
    }, 1000)
}

window.onload = () => main()
