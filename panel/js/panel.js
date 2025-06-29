
const csInterface = new CSInterface();

const powerSwitchEvent = new CSEvent('com.kureichi.rpc.power-switch', 'APPLICATION');
const readyEvent = new CSEvent('com.kureichi.rpc.ready', 'APPLICATION');
const getConnectionInfoEvent = new CSEvent('com.kureichi.rpc.get-connection-info', 'APPLICATION');

const powerSwitchButton = document.getElementById('button');
const connectionInfo = document.getElementById('state');
const loader = document.getElementById('loader');

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


function getConnectionInfo() {
    csInterface.dispatchEvent(getConnectionInfoEvent);
}

// Call Extension
window.onload = function() {
    //powerSwitchButton.click();
    csInterface.dispatchEvent(readyEvent);

    // me while trying to fixing race condition
    setTimeout(getConnectionInfo, 3000);
}