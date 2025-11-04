// Kureichi 2025
import { client } from './client.js';

const smallImageURL = 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1751014304/Twitter_Verified_Badge.svg_qtdyir.png';

const connectionInfo = new CSEvent('com.kureichi.rpc.connection-info', 'APPLICATION')
const powerSwitchInfoEvent = new CSEvent('com.kureichi.rpc.power-switch-info', 'APPLICATION');
const toggleDetailsInfoEvent = new CSEvent('com.kureichi.rpc.toggle-details-info', 'APPLICATION');
const toggleStateInfoEvent = new CSEvent('com.kureichi.rpc.toggle-state-info', 'APPLICATION');

const csInterface = new CSInterface();
const RPC = require('discord-rpc');
const startTimestamp = new Date();

// Get application ID and validate it
let appCode = csInterface.getApplicationID();
const extensionId = csInterface.getExtensionID();
console.log(`INIT:: Raw application ID from CSInterface: ${appCode}`);
console.log(`INIT:: Extension ID: ${extensionId}`);

// Try to infer app from extension ID as backup validation
if (extensionId.includes('after-effect') && appCode !== 'AEFT') {
    console.error(`INIT:: WARNING - Extension ID suggests After Effects but appCode is ${appCode}`);
}
if (extensionId.includes('premiere-pro') && appCode !== 'PPRO') {
    console.error(`INIT:: WARNING - Extension ID suggests Premiere Pro but appCode is ${appCode}`);
}
if (extensionId.includes('photoshop') && appCode !== 'PHSP' && appCode !== 'PHXS') {
    console.error(`INIT:: WARNING - Extension ID suggests Photoshop but appCode is ${appCode}`);
}

// Ensure appCode is a valid string
if (!appCode || typeof appCode !== 'string') {
    console.error(`INIT:: ERROR - Invalid application ID: ${appCode}`);
    appCode = 'UNKNOWN';
}

// Validate app code exists in client config
if (!client[appCode]) {
    console.error(`INIT:: ERROR - Unknown application code: ${appCode}`);
    console.error(`INIT:: Available apps: ${Object.keys(client).join(', ')}`);
    console.error(`INIT:: This extension should only run in: PPRO, AEFT, PHSP, or PHXS`);
    
    // Try to get more info about the host environment
    try {
        const hostEnv = csInterface.getHostEnvironment();
        console.error(`INIT:: Host Environment App ID: ${hostEnv.appId}`);
        console.error(`INIT:: Host Environment App Name: ${hostEnv.appName}`);
    } catch (e) {
        console.error(`INIT:: Could not get host environment: ${e}`);
    }
}

// Get app config - CRITICAL: Use the detected appCode, not hardcoded
const appName = client[appCode] ? client[appCode].name : 'Adobe Application';
const appClientId = client[appCode] ? client[appCode].id : '';
const appImg = client[appCode] ? client[appCode].img : '';

console.log(`INIT:: Using App Code: ${appCode}`);
console.log(`INIT:: App Name: ${appName}, Client ID: ${appClientId}`);
console.log(`INIT:: App Image URL: ${appImg}`);

// Final validation - ensure we have required values
if (!appClientId || !appImg) {
    console.error(`INIT:: CRITICAL ERROR - Missing client ID or image for app: ${appCode}`);
    console.error(`INIT:: Client ID: ${appClientId}, Image: ${appImg}`);
}

let rpc;
let interval;

const state = {
        power: 'on',
        connection: "disconnected",
        details: '',
        state: '',
        showDetails: 'on',
        showState: 'on'
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
    // Always fetch data, but only show it if toggle is ON
    // This ensures we have fresh data when toggle is turned on
    csInterface.evalScript(func, (r) => {
        // Check if result is valid (not null/undefined/error)
        if (r === undefined || r === null) {
            console.log(`EXECUTE SCRIPT:: Warning - got undefined/null for '${stateProps}'`);
            return;
        }
        
        const oldValue = state[stateProps];
        state[stateProps] = r;
        
        // Always update if value changed and we're connected
        if (r != oldValue && state.connection === "connected" && rpc) {
            console.log(`EXECUTE SCRIPT:: New value for '${stateProps}' in ${appCode}: ${r}. Updating RPC...`)
            updateActivity();
        }
    })
}


function login() {
    // Re-validate app code before login to ensure we're using the correct app
    const currentAppCode = csInterface.getApplicationID();
    if (currentAppCode !== appCode) {
        console.error(`LOGIN:: CRITICAL - App code mismatch! Expected: ${appCode}, Got: ${currentAppCode}`);
        console.error(`LOGIN:: This should not happen - extension may be running in wrong app!`);
    }
    
    if (state.connection == "disconnected") {
        // WHY? for some reason rpc can't appear when logging in again after destroying, do you know something?
        // yeah so i created a new instance to clean it up, but another problem came up, 
        // if you disconnect and connect too fast, discord will stop responding to rpc
        console.log(`LOGIN:: Attempting login for ${appCode} (${appName}) with Client ID: ${appClientId}`);
        rpc = new RPC.Client({ transport: 'ipc' });
        dispatchEvent('connection', "connecting", connectionInfo);


        rpc.on('ready', () => {
            console.log('LOGIN:: Discord RPC has Connected guys!');
            console.log(`LOGIN:: Logged in to (${rpc.user.username})`);
            
            // Clear any previous activity FIRST before setting connection state
            rpc.clearActivity().then(() => {
                console.log('LOGIN:: Cleared previous activity');
                
                // Set connection state after clearing
                state.connection = "connected";
                dispatchEvent('connection', "connected", connectionInfo);
                
                // Reset state values to force fresh fetch
                state.details = '';
                state.state = '';
                
                // Start polling
                interval = setInterval(main, 1000);
                console.log('LOGIN:: Interval started.');

                // Wait a moment to ensure Discord processed the clear, then fetch fresh data
                setTimeout(() => {
                    // Force fresh data fetch - these will trigger updateActivity
                    executeScript('details', 'getDetails()');
                    executeScript('state', 'getState()');
                }, 800);
            }).catch((err) => {
                console.log('LOGIN:: Error clearing previous activity:', err);
                // Continue anyway
                state.connection = "connected";
                dispatchEvent('connection', "connected", connectionInfo);
                state.details = '';
                state.state = '';
                interval = setInterval(main, 1000);
                setTimeout(() => {
                    executeScript('details', 'getDetails()');
                    executeScript('state', 'getState()');
                }, 800);
            });
        })

        // Handle disconnect for closed discord
        rpc.on('disconnected', () => {
            console.log('LOGIN:: Discord RPC is Disconnected!');
            
            // Clear activity with empty state before destroying
            if (rpc) {
                rpc.setActivity({
                    state: '',
                    details: ''
                }).then(() => {
                    return rpc.clearActivity();
                }).catch((err) => {
                    console.log('LOGIN:: Error clearing activity on disconnect:', err);
                });
            }
            
            if (rpc) {
                rpc.destroy();
            }
            rpc = null;

            dispatchEvent('connection', "disconnected", connectionInfo);
            
            clearInterval(interval);
            interval = null;
            console.log('LOGIN:: Interval stopped.');
            
            // only reconnect if power is on
            if (state.power == 'on') {
                console.log('LOGIN:: Reconnecting in 10s...');
                setTimeout(login, 10000);
            }
        })

        // Validate we have client ID before attempting login
        if (!appClientId) {
            console.error(`LOGIN:: CRITICAL ERROR - No client ID for app: ${appCode}`);
            console.error(`LOGIN:: Cannot login without client ID!`);
            dispatchEvent('connection', "disconnected", connectionInfo);
            if (rpc) {
                rpc.destroy();
                rpc = null;
            }
            return;
        }
        
        console.log(`LOGIN:: Logging in to Discord with Client ID: ${appClientId} for ${appCode} (${appName})`);
        rpc.login({
            clientId: appClientId
        }).catch((e) => {
            console.log(`LOGIN:: Error while trying login to Discord for ${appCode}: ${e}`);
            
            // Clear any stale RPC instance
            if (rpc) {
                rpc.destroy();
            }
            rpc = null;
            
            dispatchEvent('connection', "disconnected", connectionInfo);

            if (interval) {
                clearInterval(interval);
                interval = null;
            }
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
    console.log('DESTROY:: Starting destroy - clearing all Discord status...');
    
    // Stop polling immediately to prevent any updates
    if (interval) {
        clearInterval(interval);
        interval = null;
        console.log('DESTROY:: Interval stopped');
    }
    
    // Prevent any further activity updates
    state.connection = "disconnected";
    state.power = 'off';
    
    // Clear Discord activity completely - remove all status
    if (rpc) {
        // Immediately clear activity to remove status from Discord
        rpc.clearActivity().then(() => {
            console.log('DESTROY:: Discord status cleared successfully');
        }).catch((err) => {
            console.log('DESTROY:: Error clearing activity:', err);
        });
        
        // Also set completely minimal activity as backup to ensure nothing shows
        rpc.setActivity({
            details: null,
            state: null
        }).then(() => {
            console.log('DESTROY:: Set null activity - removing all info');
            // Clear again immediately
            return rpc.clearActivity();
        }).then(() => {
            console.log('DESTROY:: Cleared again after null set');
        }).catch((err) => {
            console.log('DESTROY:: Error in null activity:', err);
        });
        
        // Wait a bit to ensure Discord processes the clear, then destroy
        setTimeout(() => {
            // One final clear to be absolutely sure
            if (rpc) {
                rpc.clearActivity().catch(() => {});
            }
            
            // Destroy the RPC connection
            setTimeout(() => {
                if (rpc) {
                    try {
                        rpc.destroy();
                        console.log('DESTROY:: RPC destroyed');
                    } catch (err) {
                        console.log('DESTROY:: Error destroying:', err);
                    }
                    rpc = null;
                }
                
                // Reset all state
                state.details = '';
                state.state = '';
                dispatchEvent('connection', "disconnected", connectionInfo);
                console.log('DESTROY:: Complete - Discord should show nothing/idle now');
            }, 400);
        }, 600);
    } else {
        // No RPC instance
        state.details = '';
        state.state = '';
        dispatchEvent('connection', "disconnected", connectionInfo);
        console.log('DESTROY:: Complete - No RPC instance');
    }
}

function updateActivity() {
    // Only update if connected and rpc exists AND power is on
    if (!rpc || state.connection !== "connected" || state.power !== "on") {
        if (state.connection !== "connected") {
            console.log('UPDATE ACTIVITY:: Skipping update - not connected');
        }
        return;
    }
    
    // Validate we have the correct app config before updating
    if (!appClientId || !appImg || !appName) {
        console.error(`UPDATE ACTIVITY:: ERROR - Missing app config! App: ${appCode}, Client ID: ${appClientId}, Image: ${appImg}`);
        return;
    }
    
    // Build activity object - don't include fields that should be hidden
    const activity = {
        startTimestamp: startTimestamp,
        largeImageKey: appImg,
        largeImageText: appName,
        smallImageKey: smallImageURL
    };
    
    // Only add details if toggle is ON and we have a value - otherwise omit it
    if (state.showDetails === 'on' && state.details && state.details.trim() !== '') {
        activity.details = state.details;
    }
    
    // Only add state if toggle is ON and we have a value - otherwise omit it
    if (state.showState === 'on' && state.state && state.state.trim() !== '') {
        activity.state = state.state;
    }
    
    // Log what we're sending to Discord for debugging
    console.log(`UPDATE ACTIVITY:: Updating for ${appCode} (${appName})`);
    
    // Update Discord RPC immediately
    rpc.setActivity(activity).then(() => {
        const detailsStr = activity.details || 'hidden';
        const stateStr = activity.state || 'hidden';
        console.log(`UPDATE ACTIVITY:: Updated successfully for ${appCode} (Details: ${detailsStr}, State: ${stateStr})`);
    }).catch((err) => {
        console.log(`UPDATE ACTIVITY:: Error updating activity for ${appCode}:`, err);
    });
}

function main() {
    // Only poll if connected AND power is on
    if (state.connection == "connected" && state.power == "on" && rpc) {
        // Inspired by tee
        executeScript('details', 'getDetails()');
        executeScript('state', 'getState()');
    }
}


csInterface.addEventListener('com.kureichi.rpc.power-switch', () => {
    if (state.power == 'off') {
        // Turning ON
        dispatchEvent('power', 'on', powerSwitchInfoEvent);
        state.power = 'on';
        localStorage.setItem('power', state.power);
        
        // Wait a moment to ensure any previous connection is fully closed
        setTimeout(() => {
            login();
        }, 500);
    } else if (state.power == 'on') {
        // Turning OFF - disconnect completely
        dispatchEvent('power', 'off', powerSwitchInfoEvent);
        state.power = 'off';
        localStorage.setItem('power', state.power);
        
        // Immediately destroy and clear Discord
        destroy();
    }
})


csInterface.addEventListener('com.kureichi.rpc.get-power-switch-info', () => {
    dispatchEvent('power', null, powerSwitchInfoEvent);
})

csInterface.addEventListener('com.kureichi.rpc.get-connection-info', () => {
    dispatchEvent('connection', null, connectionInfo);
})

csInterface.addEventListener('com.kureichi.rpc.toggle-details', (e) => {
    const value = e.data || 'on';
    state.showDetails = value;
    dispatchEvent('showDetails', value, toggleDetailsInfoEvent);
    localStorage.setItem('showDetails', value);
    console.log(`TOGGLE:: Details set to ${value}`);
    
    // Immediately update Discord RPC when toggle changes - only if connected and power on
    if (state.connection === "connected" && state.power === "on" && rpc) {
        // Force immediate update with current state
        updateActivity();
        
        // If turning ON, fetch fresh data immediately
        if (value === 'on' && state.details === '') {
            executeScript('details', 'getDetails()');
        }
    }
})

csInterface.addEventListener('com.kureichi.rpc.toggle-state', (e) => {
    const value = e.data || 'on';
    state.showState = value;
    dispatchEvent('showState', value, toggleStateInfoEvent);
    localStorage.setItem('showState', value);
    console.log(`TOGGLE:: State set to ${value}`);
    
    // Immediately update Discord RPC when toggle changes - only if connected and power on
    if (state.connection === "connected" && state.power === "on" && rpc) {
        // Force immediate update with current state
        updateActivity();
        
        // If turning ON, fetch fresh data immediately
        if (value === 'on' && state.state === '') {
            executeScript('state', 'getState()');
        }
    }
})

csInterface.addEventListener('com.kureichi.rpc.get-toggle-details-info', () => {
    dispatchEvent('showDetails', null, toggleDetailsInfoEvent);
})

csInterface.addEventListener('com.kureichi.rpc.get-toggle-state-info', () => {
    dispatchEvent('showState', null, toggleStateInfoEvent);
})


window.onload = function() {
    const power = localStorage.getItem('power');
    if (['on', 'off'].includes(power)) {
        console.log(`LOAD:: Detected power (${power}) session in localStorage, changing state...`)
        state.power = power;
    }

    // Load toggle preferences
    const showDetails = localStorage.getItem('showDetails');
    const showState = localStorage.getItem('showState');
    
    if (showDetails && ['on', 'off'].includes(showDetails)) {
        console.log(`LOAD:: Detected showDetails (${showDetails}) preference in localStorage`);
        state.showDetails = showDetails;
    }
    
    if (showState && ['on', 'off'].includes(showState)) {
        console.log(`LOAD:: Detected showState (${showState}) preference in localStorage`);
        state.showState = showState;
    }

    // Start RPC if power on only
    if (state.power == 'on') {
        console.log('LOAD:: Power is ON, Logged in...')
        login();
        return;
    }

    console.log('LOAD:: Power is OFF, not trying to login.')
}
