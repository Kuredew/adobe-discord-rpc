const PanelVersion = 'v2.3.0-beta.1';
const apiUrl = 'https://api.github.com/repos/Kuredew/adobe-discord-rpc/releases/latest';

const csInterface = new CSInterface();

const powerSwitchEvent = new CSEvent('com.kureichi.rpc.power-switch', 'APPLICATION');
const getPowerSwitchInfoEvent = new CSEvent('com.kureichi.rpc.get-power-switch-info', 'APPLICATION');

const readyEvent = new CSEvent('com.kureichi.rpc.ready', 'APPLICATION');
const getConnectionInfoEvent = new CSEvent('com.kureichi.rpc.get-connection-info', 'APPLICATION');

const toggleDetailsEvent = new CSEvent('com.kureichi.rpc.toggle-details', 'APPLICATION');
const toggleStateEvent = new CSEvent('com.kureichi.rpc.toggle-state', 'APPLICATION');
const getToggleDetailsInfoEvent = new CSEvent('com.kureichi.rpc.get-toggle-details-info', 'APPLICATION');
const getToggleStateInfoEvent = new CSEvent('com.kureichi.rpc.get-toggle-state-info', 'APPLICATION');

const versionInfo = document.getElementById('version');
const powerSwitchButton = document.getElementById('button');
const connectionInfo = document.getElementById('state');
const statusIndicator = document.querySelector('.status-indicator');
const toggleDetails = document.getElementById('toggle-details');
const toggleState = document.getElementById('toggle-state');

// Local state for panel UI
const panelState = {
    connected: false
};

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


function connected() {
    connectionInfo.innerHTML = 'Connected';
    statusIndicator.className = 'status-indicator connected';
    panelState.connected = true;
}

function connecting() {
    connectionInfo.innerHTML = 'Connecting...';
    statusIndicator.className = 'status-indicator connecting';
}

function disconnected() {
    connectionInfo.innerHTML = 'Disconnected';
    statusIndicator.className = 'status-indicator disconnected';
    panelState.connected = false;
}

function powerSwitchOn() {
    powerSwitchButton.innerHTML = 'On';
    powerSwitchButton.className = 'power-on';
}

function powerSwitchOff() {
    powerSwitchButton.innerHTML = 'Off';
    powerSwitchButton.className = 'power-off';
}


csInterface.addEventListener('com.kureichi.rpc.connection-info', (e) => {
    const info = e.data

    if (info == "connected") {
        connected();
        return

    } else if (info == "connecting") {
        connecting();
    } else if (info == "disconnected") {
        disconnected();
    }
})

csInterface.addEventListener('com.kureichi.rpc.power-switch-info', (e) => {
    const power = e.data
    
    if (power == "on") {
        console.log('Power Switch Is On');
        powerSwitchOn();
    } else if (power == "off") {
        console.log('Power Switch Is Off');
        powerSwitchOff();
    }
})

powerSwitchButton.addEventListener('click', () => {
    csInterface.dispatchEvent(powerSwitchEvent);
})

versionInfo.addEventListener('click', () => {
    csInterface.openURLInDefaultBrowser('https://github.com/Kuredew/adobe-discord-rpc/releases/latest');
})

// Toggle event handlers
toggleDetails.addEventListener('change', (e) => {
    const enabled = e.target.checked ? 'on' : 'off';
    toggleDetailsEvent.data = enabled;
    // Save immediately for quick feedback
    localStorage.setItem('showDetails', enabled);
    // Dispatch event to background extension
    csInterface.dispatchEvent(toggleDetailsEvent);
    console.log(`Panel:: Details toggle set to ${enabled} - updating RPC immediately`);
})

toggleState.addEventListener('change', (e) => {
    const enabled = e.target.checked ? 'on' : 'off';
    toggleStateEvent.data = enabled;
    // Save immediately for quick feedback
    localStorage.setItem('showState', enabled);
    // Dispatch event to background extension
    csInterface.dispatchEvent(toggleStateEvent);
    console.log(`Panel:: State toggle set to ${enabled} - updating RPC immediately`);
})

// Listen for toggle info updates from extension
csInterface.addEventListener('com.kureichi.rpc.toggle-details-info', (e) => {
    const enabled = e.data === 'on';
    toggleDetails.checked = enabled;
})

csInterface.addEventListener('com.kureichi.rpc.toggle-state-info', (e) => {
    const enabled = e.data === 'on';
    toggleState.checked = enabled;
})

// Call Extension
window.onload = function() {
    //powerSwitchButton.click();
    csInterface.dispatchEvent(readyEvent);
    checkLatestVersion();
    
    // Wait for background extension to load after ready event
    // Background extensions start when readyEvent is dispatched
    setTimeout(() => {
        // Load saved toggle preferences
        const showDetails = localStorage.getItem('showDetails');
        const showState = localStorage.getItem('showState');
        
        if (showDetails) {
            toggleDetails.checked = showDetails === 'on';
            toggleDetailsEvent.data = showDetails;
            csInterface.dispatchEvent(toggleDetailsEvent);
        }
        
        if (showState) {
            toggleState.checked = showState === 'on';
            toggleStateEvent.data = showState;
            csInterface.dispatchEvent(toggleStateEvent);
        }
        
        console.log('WINDOW:: Updating info...')
        csInterface.dispatchEvent(getConnectionInfoEvent);
        csInterface.dispatchEvent(getPowerSwitchInfoEvent);
        csInterface.dispatchEvent(getToggleDetailsInfoEvent);
        csInterface.dispatchEvent(getToggleStateInfoEvent);
    }, 1000); // Wait for background extension to initialize
}
