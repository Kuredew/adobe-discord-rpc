const PanelVersion = 'v2.1.1';
const apiUrl = 'https://api.github.com/repos/Kuredew/adobe-discord-rpc/releases/latest';

const csInterface = new CSInterface();

const powerSwitchEvent = new CSEvent('com.kureichi.rpc.power-switch', 'APPLICATION');
const getPowerSwitchInfoEvent = new CSEvent('com.kureichi.rpc.get-power-switch-info', 'APPLICATION');

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


function connected() {
    connectionInfo.innerHTML = 'Connected!'
    connectionInfo.style.color = 'green';

    loader.style.opacity = '0%';
    state.connected = true
}

function connecting() {
    loader.style.opacity = '80%';
}

function disconnected() {
    connectionInfo.innerHTML = 'Disconnected';
    connectionInfo.style.color = 'brown';

    loader.style.opacity = '0%';
    state.connected = false;
}

function powerSwitchOn() {
    powerSwitchButton.innerHTML = 'On';
    powerSwitchButton.style.borderColor = 'green';
}

function powerSwitchOff() {
    powerSwitchButton.innerHTML = 'Off';
    powerSwitchButton.style.borderColor = 'red';
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

// Call Extension
window.onload = function() {
    //powerSwitchButton.click();
    csInterface.dispatchEvent(readyEvent);
    checkLatestVersion();
    
    console.log('WINDOW:: Updating info...')
    csInterface.dispatchEvent(getConnectionInfoEvent);
    csInterface.dispatchEvent(getPowerSwitchInfoEvent);
}