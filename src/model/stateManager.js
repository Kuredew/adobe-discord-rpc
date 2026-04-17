import EventEmitter from "events";

class StateManager extends EventEmitter {
    constructor(localStorage) {
        super()
        //localStorage.clear()
        this.localStorage = localStorage
        
        this.defaults = {
            versionInfo: null,
            power: true,
            
            rpcConnection: null,
            rpcDetails: null,
            rpcState: null,
            rpcSmallImageKey: null,
            rpcPartySize: null,
            rpcPartyMax: null,

            showDetails: true,
            showState: true,
            showMoreSettingsWindow: false,
            customImage: false,
            customImageURL: null,
            customPrefix: false,
            customPrefixStr: null
        }
        this.state = this.defaults

    }

    init() {
        console.log('[StateManager:init] Initializing...')

        const rawData = this.localStorage.getItem('data');
        let data = JSON.parse(rawData)

        if (!data) return

        for (const key in this.defaults) {
            if (key in data) {
                this.state[key] = data[key]
            } else {
                this.state[key] = this.defaults[key]
            }
        }
    }

    getState() {
        return this.state
    }
    
    setState(newState) {
        const keys = Object.keys(newState).filter((key) => {
            if (newState[key] !== this.state[key]) {
                return true
            }
            return false
        })
        keys.forEach((key) => {
            console.log(`[stateManager:setState] State changed in '${key}' (${this.state[key]} -> ${newState[key]})`)
        })

        // ignore emit stateChange if none state changed
        if (keys.length === 0) return

        this.state = { ...this.state, ...newState }
        
        this.updateLocalStorage()
        this.emit('stateChange', this.state)
    }

    updateLocalStorage() {
        const jsonStr = JSON.stringify(this.state)
        
        this.localStorage.setItem('data', jsonStr)
        console.log(`[StateManager:updateLocalStorage] Updated localStorage state`)
    }
}

export default StateManager
