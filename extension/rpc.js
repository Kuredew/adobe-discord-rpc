// Kureichi 2025
// Last Modified at 25 June 2025

const smallImageURL = 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1751014304/Twitter_Verified_Badge.svg_qtdyir.png';

const connectingStateEvent = new CSEvent('com.kureichi.rpc.connecting-state', 'APPLICATION');
const connectedStateEvent = new CSEvent('com.kureichi.rpc.connected-state', 'APPLICATION');
const disconnectedStateEvent = new CSEvent('com.kureichi.rpc.disconnected-state', 'APPLICATION');
//const clientId = '1387049921982501055';

const csInterface = new CSInterface();
const RPC = require('discord-rpc');
const startTimestamp = new Date();

const appCode = csInterface.getApplicationID();
const appName = client[appCode].name;
const appClientId = client[appCode].id;
const appImg = client[appCode].img;
//const { clientId } = require('./clientId');


const state = {
        power: 'on',
        connected: false,
        details: null,
        state: null
    }

function stateConnectedSwitch() {
    csInterface.dispatchEvent(connectedStateEvent);
    state.connected = true;
}

function stateConnectingSwitch() {
    csInterface.dispatchEvent(connectingStateEvent);
}

function stateDisconnectedSwitch() {
    csInterface.dispatchEvent(disconnectedStateEvent);
    state.connected = false;
}

let rpc
function login() {
    stateConnectingSwitch();
    

    if (!state.connected) {
        // WHY? for some reason rpc can't appear when logging in again after destroying, do you know something?
        // yeah so i created a new instance to clean it up, but another problem came up, 
        // if you disconnect and connect too fast, discord will stop responding to rpc
        rpc = new RPC.Client({ transport: 'ipc' });

        rpc.on('ready', () => {
            console.log('RPC:: Discord RPC has Connected guys!');
            console.log(`RPC:: Logged in to (${rpc.user.username})`);
            
            stateConnectedSwitch();
            updateActivity();
        })

        rpc.on('disconnected', () => {
            console.log('RPC:: Discord RPC is Disconnected!');
            rpc.destroy();

            stateDisconnectedSwitch();

            if (state.power == 'on') {
                setTimeout(5000, login);
            }
        })

        rpc.login({
            clientId: appClientId
        }).catch((e) => {
            console.log(e);
            
            stateDisconnectedSwitch();

            // Reconnect if error
            if (state.power == 'on') {
                setTimeout(5000, login);
            }

            // if discord stop responding to rpc, you must restart discord.
            //stateHTML.innerHTML = 'Please restart your Discord.';
        })
    } else {
        updateActivity();

        stateConnectedSwitch();
    }
}

function clearActivity() {
    rpc.destroy();

    stateDisconnectedSwitch();
}

function updateActivity() {
    rpc.setActivity({
        details: state.details,
        state: state.state,
        startTimestamp: startTimestamp,
        largeImageKey: appImg,
        largeImageText: appName,
        smallImageKey: smallImageURL//'https://res.cloudinary.com/ddsuizdgf/image/upload/v1744520448/uwkzfgvgpp9curiqyjwi.png'
    })

    console.log('RPC:: Updated Activity');
}

function main() {
    if (state.connected) {

        // I dont use getInfo() function anymore.
        /*
        csInterface.evalScript('getInfo()', function(result) {

            console.log(result);
            parsed = JSON.parse(result);
            
            if (parsed.details != state.details ||
                parsed.state != state.state
            ) {
                console.log(`RPC:: Info Changed!\n Detaiils : ${parsed.details}\n State: ${parsed.state}`);

                state.details = parsed.details;
                state.state = parsed.state;
                
                updateActivity();
            }
        })*/

        // Inspired by tee
        updateState('details', 'getDetails()');
        updateState('state', 'getState()');
    }
}

function updateState(stateProps, func) {
    csInterface.evalScript(func, (r) => {
        if (r != state[stateProps]) {
            state[stateProps] = r;
            updateActivity();
        }
    })
}

csInterface.addEventListener('com.kureichi.rpc.power-switch', () => {
    if (!state.connected) {
        state.power = 'on';

        login();
    } else {
        state.power = 'off';

        clearActivity();
    }
})

// hellnah
csInterface.addEventListener('com.kureichi.rpc.get-connection-info', () => {
    if (state.connected) {
        stateConnectedSwitch();
    } else {
        stateDisconnectedSwitch();
    }
})


function init() {
    login();
    setInterval(main, 1000);
}

init();