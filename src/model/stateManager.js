class StateManager {
    constructor(localStorage) {
        // localStorage.clear()
        this.localStorage = localStorage
        this.rawData = this.localStorage.getItem('data');

        if (!this.rawData) {
            this.init()
        } else {
            try {
                this.data = JSON.parse(this.rawData)
            } catch (error) {
                console.log('[StateManager] Error while parsing data from localStorage, resetting...')
                this.init()
            }
        }

        this.power = this.data.power
        this.rpcConnection = "disconnected"
        this.rpcDetails = this.data.rpcDetails
        this.rpcState = this.data.rpcState

        this.showDetails = this.data.showDetails
        this.showState = this.data.showState

        this.showMoreSettingsWindow = this.data.showMoreSettingsWindow

        this.customImage = this.data.customImage
        this.customImageURL = this.data.customImageURL
        this.customPrefix = this.data.customPrefix
        this.customPrefixStr = this.data.customPrefixStr

        this.updateLocalStorage()
    }

    init() {
        console.log('[StateManager:init] Initializing...')
        this.data = {
            power: false,
            rpcConnection: "disconnected",
            rpcDetails: null,
            rpcState: null,

            showDetails: true,
            showState: true,

            showMoreSettingsWindow: false,

            customImage: true,
            customImageURL: null,
            customPrefix: true,
            customPrefixStr: null
        }
    }

    toObj() {
        // console.log('[StateManager:toObj] Convert State to Object')
        return {
            power: this.power,
            rpcConnection: this.rpcConnection,
            rpcDetails: this.rpcDetails,
            rpcState: this.rpcState,

            showDetails: this.showDetails,
            showState: this.showState,

            showMoreSettingsWindow: this.showMoreSettingsWindow,

            customImage: this.customImage,
            customImageURL: this.customImageURL,
            customPrefix: this.customPrefix,
            customPrefixStr: this.customPrefixStr,
        }
    }

    toJsonStr() {
        // console.log('[StateManager:toJsonStr] Convert State to JSON String')
        return JSON.stringify(this.toObj(), null, 4)
    }

    updateFromObj(obj) {
        try {
            console.log('[StateManager:updateFromObj] Processing update from Object data')

            this.power = obj.power
            this.rpcConnection = obj.rpcConnection
            this.rpcDetails = obj.rpcDetails
            this.rpcState = obj.rpcState

            this.showDetails = obj.showDetails
            this.showState = obj.showState

            this.showMoreSettingsWindow = obj.showMoreSettingsWindow

            this.customImage = obj.customImage
            this.customImageURL = obj.customImageURL
            this.customPrefix = obj.customPrefix
            this.customPrefixStr = obj.customPrefixStr

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
        console.log(`[StateManager:updateLocalStorage] Updating localStorage data to ${jsonStr}`)

        this.localStorage.setItem('data', jsonStr)
    }
}

export default StateManager
