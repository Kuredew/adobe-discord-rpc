class StateEvent {
    constructor(stateManager) {
        this.csInterface = new CSInterface()
        this.stateEvent = new CSEvent('com.kureichi.rpc.state-from-backend', 'APPLICATION')
        this.stateManager = stateManager
    }

    registerListener(callback) {
        this.csInterface.addEventListener('com.kureichi.rpc.get-state', () => this.dispatchEvent())

        this.csInterface.addEventListener('com.kureichi.rpc.state-from-view', (r) => {
            console.log('[StateEvent:Listener] Got State from View')
            this.stateManager.updateFromObj(r.data)
            this.dispatchEvent()

            callback()
        })

        console.log('[StateEvent:registerListener] Registered Listener Event.')
    }

    dispatchEvent() {
        this.stateEvent.data = this.stateManager.toJsonStr()
        this.csInterface.dispatchEvent(this.stateEvent)

        console.log('[StateEvent:dispatchEvent] Dispatched event')
    }
}

export default StateEvent
