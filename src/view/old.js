import StateManager from '../core/state/stateManager'

const PanelVersion = 'v2.3.0-beta.1';
const apiUrl = 'https://api.github.com/repos/Kuredew/adobe-discord-rpc/releases/latest';

const csInterface = new CSInterface();

const readyEvent = new CSEvent('com.kureichi.rpc.ready', 'APPLICATION');
const getStateEvent = new CSEvent('com.kureichi.rpc.get-state', 'APPLICATION')
const stateEvent = new CSEvent('com.kureichi.rpc.state-from-view', 'APPLICATION')

const versionInfo = document.getElementById('version');
const powerSwitchButton = document.getElementById('button');
const connectionInfo = document.getElementById('state');
const statusIndicator = document.querySelector('.status-indicator');
const toggleDetails = document.getElementById('toggle-details');
const toggleState = document.getElementById('toggle-state');
const moreButton = document.getElementById('more-button');
const moreContainer = document.getElementById('more-container');
const closeMoreWindowButton = document.getElementById('close-more-window-button');
const toggleCustomImage = document.getElementById('toggle-custom-image')
const customImageURL = document.getElementById('custom-image-url')
const toggleCustomPrefix = document.getElementById('toggle-custom-prefix')
const customPrefixStr = document.getElementById('custom-prefix-str')

// New State System
const stateManager = new StateManager(localStorage)

function dispatchStateEvent() {
    stateEvent.data = stateManager.toJsonStr()
    console.log('[Main] Sending state to backend with value : ' + stateEvent.data)

    csInterface.dispatchEvent(stateEvent)
}


async function checkLatestVersion() {
    try {
        const response = await fetch(apiUrl);

        if (response.ok) {
            const data = await response.json();

            const latestVersion = data.tag_name;
            if (latestVersion != PanelVersion) {
                versionInfo.innerHTML = `New Update ${latestVersion} ↗`;
            } else {
                versionInfo.innerHTML = PanelVersion;
            }
        } else {
            console.log('Panel:: Response not ok, retrying...');

            setTimeout(checkLatestVersion, 3000);
        }
    } catch (e) {
        console.log('Panel:: Error while trying to fetch api, ' + e);

        setTimeout(checkLatestVersion, 5000);
    }
}


function updateConnection() {
    const info = stateManager.rpcConnection

    if (info == "connected") {
        connected();
        return

    } else if (info == "connecting") {
        connecting();
    } else if (info == "disconnected") {
        disconnected();
    }
}
function updatePower() {
    const power = stateManager.power

    if (power == "on") {
        console.log('Power Switch Is On');
        powerSwitchOn();
    } else if (power == "off") {
        console.log('Power Switch Is Off');
        powerSwitchOff();
    }
}

function updateSetState() {
    const enabled = stateManager.showState === 'on';
    toggleState.checked = enabled;
}

function updateSetDetails() {
    const enabled = stateManager.showDetails === 'on';
    toggleDetails.checked = enabled;
}

function updateSetCustomImage() {
    const enabled = stateManager.customImage === 'on';
    toggleCustomImage.checked = enabled;
}

function updateSetCustomImageURL() {
    customImageURL.value = stateManager.customImageURL
}

function updateSetCustomPrefix() {
    const enabled = stateManager.customPrefix === 'on';
    toggleCustomPrefix.checked = enabled;
}

function updateSetCustomPrefixStr() {
    customPrefixStr.value = stateManager.customPrefixStr
}

function updateView() {
    updateConnection()
    updatePower()
    updateSetDetails()
    updateSetState()
    updateSetCustomImage()
    updateSetCustomImageURL()
    updateSetCustomPrefix()
    updateSetCustomPrefixStr()
}


function connected() {
    connectionInfo.innerHTML = 'Connected';
    statusIndicator.className = 'status-indicator connected';
}

function connecting() {
    connectionInfo.innerHTML = 'Connecting...';
    statusIndicator.className = 'status-indicator connecting';
}

function disconnected() {
    connectionInfo.innerHTML = 'Disconnected';
    statusIndicator.className = 'status-indicator disconnected';
}

function powerSwitchOn() {
    powerSwitchButton.innerHTML = 'On';
    powerSwitchButton.className = 'power-on';
}

function powerSwitchOff() {
    powerSwitchButton.innerHTML = 'Off';
    powerSwitchButton.className = 'power-off';
}

powerSwitchButton.addEventListener('click', () => {
    if (stateManager.power != "on") stateManager.power = "on"
    else if (stateManager.power != "off") stateManager.power = "off"

    dispatchStateEvent()
})

versionInfo.addEventListener('click', () => {
    csInterface.openURLInDefaultBrowser('https://github.com/Kuredew/adobe-discord-rpc/releases/latest');
})

// Toggle event handlers
toggleDetails.addEventListener('change', (e) => {
    const enabled = e.target.checked ? 'on' : 'off';
    stateManager.showDetails = enabled
    dispatchStateEvent()
    console.log(`[Main] Details toggle set to ${enabled} - updating RPC immediately`);
})

toggleState.addEventListener('change', (e) => {
    const enabled = e.target.checked ? 'on' : 'off';
    stateManager.showState = enabled
    dispatchStateEvent()
    console.log(`[Main] State toggle set to ${enabled} - updating RPC immediately`);
})

toggleCustomImage.addEventListener('change', (e) => {
    const enabled = e.target.checked ? 'on' : 'off';
    stateManager.customImage = enabled
    dispatchStateEvent()
    console.log(`[Main] Custom Image toggle set to ${enabled} - updating RPC immediately`);
})

toggleCustomPrefix.addEventListener('change', (e) => {
    const enabled = e.target.checked ? 'on' : 'off';
    stateManager.customPrefix = enabled
    dispatchStateEvent()
    console.log(`[Main] Custom Prefix toggle set to ${enabled} - updating RPC immediately`);
})


customImageURL.addEventListener('change', (e) => {
    stateManager.customImageURL = e.target.value

    dispatchStateEvent()
    console.log(`[Main] Custom Image set to ${e.target.value} - updating RPC immediately`);
})

customPrefixStr.addEventListener('change', (e) => {
    stateManager.customPrefixStr = e.target.value

    dispatchStateEvent()
    console.log(`[Main] Custom Prefix set to ${e.target.value} - updating RPC immediately`);
})

moreButton.addEventListener('click', () => {
    moreContainer.style.display = 'flex';
})
closeMoreWindowButton.addEventListener('click', () => {
    moreContainer.style.display = 'none';
})


csInterface.addEventListener('com.kureichi.rpc.state-from-backend', (r) => {
    console.log('[Main] Got state from backend, received with value : ' + JSON.stringify(r.data, null, 4))
    stateManager.updateFromObj(r.data)

    updateView()
})


// Call Extension
window.onload = function() {
    csInterface.dispatchEvent(readyEvent);
    checkLatestVersion();

    // Wait for background extension to load after ready event
    // Background extensions start when readyEvent is dispatched
    setTimeout(() => {
        console.log('WINDOW:: Updating info...')
        csInterface.dispatchEvent(getStateEvent)
    }, 1000); // Wait for background extension to initialize
}
