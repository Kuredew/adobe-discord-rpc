const PanelVersion = 'v2.1.1';
const apiUrl = 'https://api.github.com/repos/Kuredew/adobe-discord-rpc/releases/latest';

const csInterface = new CSInterface();

const powerSwitchEvent = new CSEvent('com.kureichi.rpc.power-switch', 'APPLICATION');
const readyEvent = new CSEvent('com.kureichi.rpc.ready', 'APPLICATION');
const getConnectionInfoEvent = new CSEvent('com.kureichi.rpc.get-connection-info', 'APPLICATION');

const versionInfo = document.getElementById('version');
const powerSwitchButton = document.getElementById('button');
const connectionInfo = document.getElementById('state');
const loader = document.getElementById('loader');

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

            setTimeout(3000, checkLatestVersion());
        }
    } catch (e) {
        console.log('Panel:: Error while trying to fetch api, ' + e);
        
        setTimeout(5000, checkLatestVersion());
    }
}


function stateConnectedSwitch() {
    connectionInfo.innerHTML = 'Connected!'
    connectionInfo.style.color = 'green';
    powerSwitchButton.innerHTML = 'Disconnect';

    loader.style.opacity = '0%';
    state.connected = true
}

function stateConnectingSwitch() {
    powerSwitchButton.innerHTML = 'Connecting';
    loader.style.opacity = '80%';
}

function stateDisconnectedSwitch() {
    connectionInfo.innerHTML = 'Disconnected';
    connectionInfo.style.color = 'brown';
    powerSwitchButton.innerHTML = 'Connect';

    loader.style.opacity = '0%';
    state.connected = false;
}

csInterface.addEventListener('com.kureichi.rpc.connecting-state', () => {
    stateConnectingSwitch();
})

csInterface.addEventListener('com.kureichi.rpc.connected-state', () => {
    stateConnectedSwitch();
})

csInterface.addEventListener('com.kureichi.rpc.disconnected-state', () => {
    stateDisconnectedSwitch();
})

powerSwitchButton.addEventListener('click', () => {
    csInterface.dispatchEvent(powerSwitchEvent);
})

versionInfo.addEventListener('click', () => {
    csInterface.openURLInDefaultBrowser('https://github.com/Kuredew/adobe-discord-rpc/releases/latest');
})

function getConnectionInfo() {
    csInterface.dispatchEvent(getConnectionInfoEvent);
}

// Call Extension
window.onload = function() {
    //powerSwitchButton.click();
    csInterface.dispatchEvent(readyEvent);
    checkLatestVersion();
    // me while trying to fixing race condition
    setTimeout(getConnectionInfo, 3000);
}