import { Client } from 'discord-rpc'
import AdobeApp from './adobeApp'

class AdobeRPC {
    constructor(stateManager) {
        this.client = null
        this.callback = null
        this.interval = null

        this.adobeApp = new AdobeApp()
        this.stateManager = stateManager
        this.startTimestamp = new Date()
        this.csInterface = new CSInterface()

        this.adobeApp.load()

        console.log('[AdobeRPC] AdobeRPC Initialized.')
    }

    createNewClient() {
        this.client = new Client({ transport: 'ipc' })
        console.log('[AdobeRPC:createNewClient] Created new RPC Client')
    }

    login(callback) {
        this.callback = callback
        if (!this.stateManager.power) {
            this.stateManager.rpcConnection = 'disconnected'
            callback()

            console.log('[AdobeRPC:login] Power is OFF. login job aborted.')
            return
        }

        this.createNewClient()

        let isReconnecting = false
        const reconnect = () => {
            if (!isReconnecting) {
                console.log(`[AdobeRPC:reconnect] Reconnecting RPC after 5 sec...`)
                this.stateManager.rpcConnection = 'connecting'
                callback()

                setTimeout(() => {
                    console.log('[AdobeRPC:reconnect] Reconnecting RPC...')
                    this.login(this.callback)
                }, 4000)

                isReconnecting = true
                return
            }

            console.log('[AdobeRPC:reconnect] Aborted reconnect job because rpc is currently reconnecting')
        }

        this.client.once("ready", () => {
            console.log('[AdobeRPC:ready] RPC Connected!')
            this.stateManager.rpcConnection = 'connected'
            callback()

            console.log('[AdobeRPC:ready] Request startPolling...')
            this.startPolling()
        })
        this.client.once("disconnected", () => {
            if (this.stateManager.power) {
                console.log('[AdobeRPC:disconnected] RPC Disconnected, request reconnect job...')
                reconnect()
                return
            }

            console.log(`[AdobeRPC:disconnected] RPC Disconnected`)
            this.stateManager.rpcConnection = 'disconnected'
            callback()
        })


        console.log(`[AdobeRPC:login] Connecting with ClientID(${this.adobeApp.clientId})...`)
        this.stateManager.rpcConnection = 'connecting'
        callback()

        this.client.login({
            clientId: this.adobeApp.clientId
        }).catch((err) => {
            console.log(`[AdobeRPC:loginError] Error while trying to login : ${err}`)
            if (this.stateManager.power) {
                console.log('[AdobeRPC:loginError] Request reconnect job...')
                reconnect()
                return
            }

            this.stateManager.rpcConnection = 'disconnected'
            callback()

        })
    }

    logout() {
        this.client.destroy().then(() => {
            clearInterval(this.interval)
            console.log('[AdobeRPC:logout] Successfully logout and clear interval')
        })

    }

    executeScript(props, func) {
        this.csInterface.evalScript(func, (r) => {
            if (r === null) {
                console.log("[AdobeRPC:executeScript] Aborting null response");
                return;
            }

            const stateObj = this.stateManager.toObj()

            if (r != stateObj[props]) {
                console.log(`[AdobeRPC:executeScript] Detected changes (${stateObj[props]} -> ${r})`)
                stateObj[props] = r;

                this.stateManager.updateFromObj(stateObj)
                this.updateActivity();
            }
        })
    }

    updateActivity() {
        console.log('[AdobeRPC:updateActivity] Begin update...')
        if (this.stateManager.rpcConnection == "disconnected" || this.stateManager.rpcConnection == "connecting") {
            console.log('[AdobeRPC:updateActivity] RPC is not connected, aborted job.')
            return
        }
        if (!this.stateManager.power) {
            console.log('[AdobeRPC:updateActivity] RPC Power is OFF, aborted job.')
            return
        }

        const activity = {
            startTimestamp: this.startTimestamp,
            largeImageKey: this.adobeApp.appImg,
            largeImageText: this.adobeApp.appName,
            smallImageKey: this.adobeApp.smallImageURL,
        }

        if (this.stateManager.rpcDetails && this.stateManager.showDetails) {
            activity.details = this.stateManager.rpcDetails;
        }

        if (this.stateManager.rpcState && this.stateManager.showState) {
            let stateStr = ""

            if (this.stateManager.customPrefix && this.stateManager.customPrefixStr) {
                stateStr += this.stateManager.customPrefixStr + " "
            } else {
                stateStr += "Working on "
            }

            stateStr += this.stateManager.rpcState

            activity.state = stateStr;
        }

        if (this.stateManager.customImage && this.stateManager.customImageURL) {
            activity.largeImageKey = this.stateManager.customImageURL
        }

        console.log('[AdobeRPC:updateActivity] Updating activity to ' + JSON.stringify(activity, null, 4))

        this.client.setActivity(activity).catch((err) => {
            console.log(`[AdobeRPC:updateActivity] Failed updating activity : ${err}`)
        }).then(() => {
            console.log(`[AdobeRPC:updateActivity] Update Finished.`)

            // Update view state
            this.callback()
        });
    }

    startPolling() {
        this.updateActivity()
        this.interval = setInterval(() => {
            // Return if RPC Connection is disconnected or connecting
            if (this.stateManager.rpcConnection == "disconnected" || this.stateManager.rpcConnection == "connecting") return

            // console.log('[AdobeRPC:startPolling] Polling executed.')

            this.executeScript('rpcDetails', 'getDetails()');
            this.executeScript('rpcState', 'getState()');
        }, 1000)

        console.log('[AdobeRPC:startPolling] Polling Started')
    }

    reload() {
        if (!this.stateManager.power && this.stateManager.rpcConnection == "connected") {
            console.log("[AdobeRPC:reload] Power is OFF but rpc connection is connected, logged out...")
            clearInterval(this.interval)
            this.logout()
        }

        if (this.stateManager.power && this.stateManager.rpcConnection == "disconnected") {
            console.log("[AdobeRPC:reload] Power is ON but rpc connection is disconnected, logged in...")
            this.login(this.callback)
        }

        if (this.stateManager.power) {
            console.log('[AdobeRPC:reload] Run updateActivity...')
            this.updateActivity()
        }
    }
}

export default AdobeRPC
