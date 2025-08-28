// Kureichi 2025

const smallImageURL = 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1751014304/Twitter_Verified_Badge.svg_qtdyir.png';

const connectionInfo = new CSEvent('com.kureichi.rpc.connection-info', 'APPLICATION')
const powerSwitchInfoEvent = new CSEvent('com.kureichi.rpc.power-switch-info', 'APPLICATION');

const csInterface = new CSInterface();
const RPC = require('discord-rpc');
const startTimestamp = new Date();

const appCode = csInterface.getApplicationID();
const appName = client[appCode].name;
const appClientId = client[appCode].id;
const appImg = client[appCode].img;

let rpc;
let interval;

const state = {
        power: 'on',
        connection: "disconnected",
        details: '',
        state: ''
    }

function dispatchEvent(stateProps, value, event) {
    if (value) { 
        state[stateProps] = value
        event.data = value
    } else {
        value = state[stateProps]
        event.data = value
    }

    console.log(`DISPATCH EVENT:: Dispatching ${stateProps} event with value : ${value}`)
    csInterface.dispatchEvent(event);
}

function executeScript(stateProps, func) {
    csInterface.evalScript(func, (r) => {
        if (r != state[stateProps]) {
            console.log(`EXECUTE SCRIPT:: New value for '${stateProps}' state : ${r}. Updating RPC...`)
            state[stateProps] = r;
            updateActivity();
        }
    })
}


function login() {
    if (state.connection == "disconnected") {
        // WHY? for some reason rpc can't appear when logging in again after destroying, do you know something?
        // yeah so i created a new instance to clean it up, but another problem came up, 
        // if you disconnect and connect too fast, discord will stop responding to rpc
        rpc = new RPC.Client({ transport: 'ipc' });
        dispatchEvent('connection', "connecting", connectionInfo);


        rpc.on('ready', () => {
            console.log('LOGIN:: Discord RPC has Connected guys!');
            console.log(`LOGIN:: Logged in to (${rpc.user.username})`);
            
            interval = setInterval(main, 1000);
            console.log('LOGIN:: Interval started.');

            dispatchEvent('connection', "connected", connectionInfo);

            // Update activity for the first time.
            updateActivity();
        })

        // Handle disconnect for closed discord
        rpc.on('disconnected', () => {
            console.log('LOGIN:: Discord RPC is Disconnected!');
            rpc.destroy();

            dispatchEvent('connection', "disconnected", connectionInfo);
            
            clearInterval(interval);
            console.log('LOGIN:: Interval stopped.');
            
            // only reconnect if power is on
            if (state.power == 'on') {
                console.log('LOGIN:: Reconnecting in 10s...');
                setTimeout(login, 10000);
            }
        })

        rpc.login({
            clientId: appClientId
        }).catch((e) => {
            console.log(`LOGIN:: Error while trying login to Discord : ${e}`);
            
            dispatchEvent('connection', "disconnected", connectionInfo);

            clearInterval(interval);
            console.log('LOGIN:: Interval stopped.');

            // Reconnect if power on
            if (state.power == 'on') {
                console.log('LOGIN:: Reconnecting in 10s...');
                setTimeout(login, 10000);
            }
        })
    } else {
        updateActivity();
        dispatchEvent('connection', "connected", connectionInfo);
    }
}

function destroy() {
    rpc.destroy();
    console.log('DESTROY:: RPC destroyed')
}

function updateActivity() {
    rpc.setActivity({
        details: state.details,
        state: state.state,
        startTimestamp: startTimestamp,
        largeImageKey: appImg,
        largeImageText: appName,
        smallImageKey: smallImageURL
    })

    console.log('UPDATE ACTIVITY:: Updated Activity');
}

function main() {
    if (state.connection == "connected") {

        // Inspired by tee
        executeScript('details', 'getDetails()');
        executeScript('state', 'getState()');
    }
}


csInterface.addEventListener('com.kureichi.rpc.power-switch', () => {
    if (state.power == 'off') {
        dispatchEvent('power', 'on', powerSwitchInfoEvent);
        login();
    } else if (state.power == 'on') {
        dispatchEvent('power', 'off', powerSwitchInfoEvent);
        destroy();
    }
})


csInterface.addEventListener('com.kureichi.rpc.get-power-switch-info', () => {
    dispatchEvent('power', null, powerSwitchInfoEvent);
})

csInterface.addEventListener('com.kureichi.rpc.get-connection-info', () => {
    dispatchEvent('connection', null, connectionInfo);
})


window.onload = function() {
    login();
}