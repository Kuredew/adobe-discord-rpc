// Kureichi 2025
// Last Modified at 25 June 2025

const largeImageURL = 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1750852817/adobe-after-effects-icon_m2za1h.png';
const smallImageURL = 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1751014304/Twitter_Verified_Badge.svg_qtdyir.png';


//const clientId = '1387049921982501055';

const csInterface = new CSInterface();
const RPC = require('discord-rpc');
const startTimestamp = new Date();
//const { clientId } = require('./clientId');


const stateHTML = document.getElementById('state');
const connectButton = document.getElementById('button');
const loader = document.getElementById('loader');

const state = {
        appCode: null,
        clientId: null,
        connected: false,
        details: null,
        state: null
    }

function stateConnectedSwitch() {
    stateHTML.innerHTML = 'Connected!'
    stateHTML.style.color = 'green';
    connectButton.innerHTML = 'Disconnect';

    loader.style.opacity = '0%';
    state.connected = true
}

function stateConnectingSwitch() {
    connectButton.innerHTML = 'Connecting';
    loader.style.opacity = '80%';
}

function stateDisconnectedSwitch() {
    stateHTML.innerHTML = 'Disconnected';
    stateHTML.style.color = 'brown';
    connectButton.innerHTML = 'Connect';

    loader.style.opacity = '0%';
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
            console.log('Discord RPC has Connected guys!');
            console.log(`Logged in to (${rpc.user.username})`);
            
            stateConnectedSwitch();
            updateActivity();
        })

        rpc.on('disconnected', () => {
            console.log('Discord RPC is Disconnected!');
            rpc.destroy();

            stateDisconnectedSwitch();
        })

        rpc.login({
            clientId: state.clientId
        }).catch((e) => {
            console.log(e);
            
            stateDisconnectedSwitch();

            // if discord stop responding to rpc, you must restart discord.
            stateHTML.innerHTML = 'Please restart your Discord.';
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
        largeImageKey: largeImageURL,
        smallImageKey: smallImageURL//'https://res.cloudinary.com/ddsuizdgf/image/upload/v1744520448/uwkzfgvgpp9curiqyjwi.png'
    })

    console.log('Updated Activity');
}

function main() {
    if (state.connected) {
        csInterface.evalScript('getInfo()', function(result) {

            //console.log(result)
            parsed = JSON.parse(result);
            
            if (parsed.details != state.details ||
                parsed.state != state.state
            ) {
                console.log(`Info Changed!\n Detaiils : ${parsed.details}\n State: ${parsed.state}`);

                state.details = parsed.details;
                state.state = parsed.state;
                
                updateActivity();
            }
        })
    }
}


connectButton.addEventListener('click', () => {
    if (!state.connected) {
        login();
    } else {
        clearActivity();
    }
})


function init() {
    csInterface.evalScript('getAppCode()', (result) => {
        state.clientId = clientId[result];
        login();
        setInterval(main, 1000);
    })
}


window.onload = function() {
    init();
}