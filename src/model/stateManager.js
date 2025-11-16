class StateManager {
    constructor(localStorage) {
        localStorage.clear()
        this.localStorage = localStorage
        
        this.defaults = {
            versionInfo: null,
            power: false,
            
            rpcConnection: null,
            rpcDetails: null,
            rpcState: null,
            rpcSmallImageKey: null,

            showDetails: true,
            showState: true,
            showMoreSettingsWindow: false,
            customImage: false,
            customImageURL: null,
            customPrefix: false,
            customPrefixStr: null
        }

        this.init()
    }

    init() {
        console.log('[StateManager:init] Initializing...')

        const rawData = this.localStorage.getItem('data');
        let data = JSON.parse(rawData)

        for (const key in this.defaults) {
            this[key] = this.defaults[key]

            if (!data) continue

            if (key in data) {
                this[key] = data[key]
            }
        }

        this.updateLocalStorage()
    }

    toObj() {
        // console.log('[StateManager:toObj] Convert State to Object')
        const data = {}

        for (const key in this.defaults) {
            data[key] = this[key]
        }

        console.log('[StateManager:toObj] Converted State to JS Object');
        
        return data
    }

    toJsonStr() {
        const data = {}

        for (const key in this.defaults) {
            data[key] = this[key]
        }
        
        console.log('[StateManager:toJsonStr] Converted State to JSON String')
        return JSON.stringify(data, null, 4)
    }

    updateFromObj(obj) {
        try {
            console.log('[StateManager:updateFromObj] Processing update from Object data')

            for (const key in this.defaults) {
                this[key] = obj[key]
            }

            this.updateLocalStorage()
        } catch (error) {
            console.log('[StateManager:updateFromObj] Error while processing update' + error)
        }
    }

    updateFromJsonStr(jsonStr) {
        try {
            console.log('[StateManager:updateFromJsonStr] Processing update from JSON data')
            const data = JSON.parse(jsonStr)

            this.updateFromObj(data)
        } catch (error) {
            console.log('[StateManager:updateFromJsonStr] Error while processing update : ' + error)
        }
    }

    updateLocalStorage() {
        const jsonStr = this.toJsonStr()
        
        this.localStorage.setItem('data', jsonStr)
        console.log(`[StateManager:updateLocalStorage] Updated localStorage data to ${jsonStr}`)
        // console.log('[StateManager:updateLocalStorage] Updated LocalStorage');
    }
}

export default StateManager
