import { Client } from 'discord-rpc'
import AdobeApp from './adobeApp'
import EventEmitter from 'events'
import { Logger } from '../../logger/logger'

class AdobeRPC extends EventEmitter{
    constructor(stateManager) {
        super()

        this.logger = new Logger('AdobeRPC')
        this.client = null
        this.callback = null
        this.interval = null

        this.adobeApp = new AdobeApp()
        this.stateManager = stateManager
        this.getCurrentState = null
        this.startTimestamp = new Date()
        this.csInterface = new CSInterface()
        this.isReconnecting = false
        this.lastActivityInfo = null

        this.adobeApp.load()

        this.logger.info('AdobeRPC Initialized.')
    }

    createNewClient() {
        this.client = new Client({ transport: 'ipc' })
        this.logger.info('Created new RPC Client')
    }
    
    emitConnection(connection) {
        this.emit('connectionChange', connection)
    }
    
    emitAdobeInfo(info) {
        this.emit('adobeInfoChange', info)
    }

    login() {
        if (this.isReconnecting) return

        const state = this.stateManager.getState()
        if (!state.power) {
            this.emitConnection('disconnected')
            this.logger.warn('Power is OFF. login job aborted.')
            return
        }

        this.createNewClient()

        const reconnect = () => {
            const state = this.stateManager.getState()
            if (state.power && !this.isReconnecting) {
                this.logger.info(`Reconnecting RPC after 5 sec...`)
                this.emitConnection('connecting')

                setTimeout(() => {
                    this.logger.info('Reconnecting RPC...')
                    this.isReconnecting = false

                    this.login()
                }, 4000)

                this.isReconnecting = true
                return
            }

            this.logger.warn('Aborted reconnect')
        }

        this.client.once("ready", () => {
            this.logger.info('RPC Connected!')
            this.emitConnection('connected')

            this.logger.info('Starting poll...')
            this.startPolling()
        })
        this.client.once("disconnected", () => {
            reconnect()

            this.logger.info(`RPC Disconnected`)
            this.emitConnection('disconnected')
        })


        this.logger.info(`Connecting with ClientID(${this.adobeApp.clientId})...`)
        this.emitConnection('connecting')

        this.client.login({
            clientId: this.adobeApp.clientId
        }).catch((err) => {
            this.logger.error(`Error while trying to login : ${err}`)
            reconnect()

            this.emitConnection('disconnected')
        })
    }

    logout() {
        this.client.clearActivity().then(() => {
            return this.client.destroy()
        }).then(() => {
            this.logger.info('Successfully logout')
        }).catch((err) => {
            this.logger.error('Error while trying to logout: ' + err)
        }).finally(() => {
            clearInterval(this.interval)
            this.emitConnection('disconnected')
        })
        
    }

    setActivity(state) {
        const activity = {
            startTimestamp: this.startTimestamp,
            largeImageKey: this.adobeApp.appImg,
            largeImageText: this.adobeApp.appName,
        }

        if (state.rpcDetails && state.showDetails) {
            activity.details = state.rpcDetails;
        }

        if (state.rpcState && state.showState) {
            let stateStr = ""

            if (state.customPrefix && state.customPrefixStr) {
                stateStr += state.customPrefixStr + " "
            } else {
                stateStr += "Working on "
            }

            if (state.rpcState === 'Idling.') {
                stateStr = state.rpcState
            } else {
                stateStr += state.rpcState
            }

            activity.state = stateStr;
        }

        if (state.rpcSmallImageKey) {
            activity.smallImageKey = state.rpcSmallImageKey
        }

        if (state.rpcPartySize && state.rpcPartyMax) {
            activity.partySize = parseInt(state.rpcPartySize)
            activity.partyMax = parseInt(state.rpcPartyMax)
        }

        if (state.customImage && state.customImageURL) {
            activity.largeImageKey = state.customImageURL
        }

        if (this.lastActivityInfo && JSON.stringify(this.lastActivityInfo) === JSON.stringify(activity)) {
            this.logger.warn('Aborted setActivity request')
            return
        }

        this.client.setActivity(activity).catch((err) => {
            this.logger.error(`Failed to update activity : ${err}`)
        }).then(() => {
            this.logger.info('Set activity to: ' + JSON.stringify(activity, null, 4))
            this.lastActivityInfo = activity
        });
    }

    async executeScript(func) {
        return new Promise((resolve) => {
            this.csInterface.evalScript(func, (r) => {
                resolve(r)
            })
        })
        
    }
    
    startPolling() {
        const funcs = [
            { props: 'rpcDetails', func: 'getDetails()' },
            { props: 'rpcState', func: 'getState()' },
            { props: 'rpcSmallImageKey', func: 'getSmallImageKey()' },
            { props: 'rpcPartySize', func: 'getPartySize()' },
            { props: 'rpcPartyMax', func: 'getPartyMax()' },
        ]

        this.interval = setInterval(async () => {
            let isChanged = false

            const state = this.stateManager.getState()
            const responses = []
            
            for (const func of funcs) {
                const response = await this.executeScript(func.func)
                responses.push({ props: func.props, response: response })
            }
            
            const adobeInfo = {}
            responses.forEach((response) => {
                if (state[response.props] !== response.response) {
                    this.logger.info(`Detected changes in '${response.props}' (${state[response.props]} -> ${response.response})`)
                    adobeInfo[response.props] = response.response
                    isChanged = true
                }
            })
            
            if (isChanged) {
                this.emit('adobeInfoChange', adobeInfo)
            }
        }, 1000)

        this.logger.info('Polling Started')
    }

    reload(state) {
        if (!state.power && state.rpcConnection === "connected") {
            this.logger.info("Power is OFF but rpc connection is connected, disconnecting RPC...")
            this.logout()
        }

        if (state.power && state.rpcConnection === "disconnected") {
            this.logger.info("Power is ON but rpc connection is disconnected, connecting RPC...")
            this.login()
        }

        if (state.power && state.rpcConnection === "connected") {
            this.logger.info('Updating RPC activity...')
            this.setActivity(state)
        }
    }
    
    startService() {
        this.login()
        this.stateManager.on('stateChange', (state) => this.reload(state))
    }
}

export default AdobeRPC
