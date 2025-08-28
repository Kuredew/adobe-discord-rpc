// Kureichi 2025
// Last Modified at 25 June 2025

const smallImageURL = 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1751014304/Twitter_Verified_Badge.svg_qtdyir.png';

//const connectingStateEvent = new CSEvent('com.kureichi.rpc.connecting-state', 'APPLICATION');
//const connectedStateEvent = new CSEvent('com.kureichi.rpc.connected-state', 'APPLICATION');
//const disconnectedStateEvent = new CSEvent('com.kureichi.rpc.disconnected-state', 'APPLICATION');
const connectionInfo = new CSEvent('com.kureichi.rpc.connection-info', 'APPLICATION')

//const powerSwitchOnEvent = new CSEvent('com.kureichi.rpc.power-switch-on', 'APPLICATION');
//const powerSwitchOffEvent = new CSEvent('com.kureichi.rpc.power-switch-off', 'APPLICATION');
const powerSwitchInfoEvent = new CSEvent('com.kureichi.rpc.power-switch-info', 'APPLICATION');
//const clientId = '1387049921982501055';

const csInterface = new CSInterface();
const RPC = require('discord-rpc');
const startTimestamp = new Date();

const appCode = csInterface.getApplicationID();
const appName = client[appCode].name;
const appClientId = client[appCode].id;
const appImg = client[appCode].img;
//const { clientId } = require('./clientId');

let rpc;
let interval;

const state = {
        power: 'on',
        connection: "disconnected",
        details: '',
        state: '-'
    }

function changeAndSendConnectionInfo(info) {
    state.connection = info
    connectionInfo.data = info
    csInterface.dispatchEvent(connectionInfo);
}

function login() {
    if (state.connection == "disconnected") {
        // WHY? for some reason rpc can't appear when logging in again after destroying, do you know something?
        // yeah so i created a new instance to clean it up, but another problem came up, 
        // if you disconnect and connect too fast, discord will stop responding to rpc
        rpc = new RPC.Client({ transport: 'ipc' });
        changeAndSendConnectionInfo("connecting");


        rpc.on('ready', () => {
            console.log('RPC:: Discord RPC has Connected guys!');
            console.log(`RPC:: Logged in to (${rpc.user.username})`);
            console.log('RPC:: Interval started.');
            interval = setInterval(main, 1000);
            
            changeAndSendConnectionInfo("connected");
        })

        rpc.on('disconnected', () => {
            console.log('RPC:: Discord RPC is Disconnected!');
            rpc.destroy();

            changeAndSendConnectionInfo("disconnected");
            
            console.log('RPC:: Interval stopped.');
            clearInterval(interval);
            
            // only reconnect if power is on
            if (state.power == 'on') {
                console.log('RPC:: Reconnecting in 10s...');
                setTimeout(login, 10000);
            }
        })

        rpc.login({
            clientId: appClientId
        }).catch((e) => {
            console.log(`RPC:: Error : ${e}`);
            
            changeAndSendConnectionInfo("disconnected");

            console.log('RPC:: Interval stopped.');
            clearInterval(interval);

            // Reconnect if error
            if (state.power == 'on') {
                console.log('RPC:: Reconnecting in 10s...');
                setTimeout(login, 10000);
            }
            // if discord stop responding to rpc, you must restart discord.
            //stateHTML.innerHTML = 'Please restart your Discord.';
        })
    } else {
        updateActivity();

        changeAndSendConnectionInfo("connected");
    }
}

function destroy() {
    rpc.destroy();

    //stateDisconnectedSwitch();
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
    if (state.connection == "connected") {

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
        //console.log(`RPC:: Got ${stateProps} as ${r}`)

        if (r != state[stateProps]) {
            state[stateProps] = r;
            updateActivity();
        }
    })
}

function sendPowerSwitchInfo() {
    powerSwitchInfoEvent.data = state.power
    csInterface.dispatchEvent(powerSwitchInfoEvent)
    /*
    if (state.power == 'off') {
        csInterface.dispatchEvent(powerSwitchOffEvent);
    } else if (state.power == 'on') {
        csInterface.dispatchEvent(powerSwitchOnEvent);
    }*/
}

csInterface.addEventListener('com.kureichi.rpc.power-switch', () => {
    if (state.power == 'off') {
        state.power = 'on';

        login();
    } else if (state.power == 'on') {
        state.power = 'off';

        if (state.connection == "connected") {
            destroy();
        }
    }

    sendPowerSwitchInfo();
})

csInterface.addEventListener('com.kureichi.rpc.get-power-switch-info', () => {
    sendPowerSwitchInfo();
})

csInterface.addEventListener('com.kureichi.rpc.get-connection-info', () => {
    changeAndSendConnectionInfo(state.connection);
})


function init() {
    login();
}

init();