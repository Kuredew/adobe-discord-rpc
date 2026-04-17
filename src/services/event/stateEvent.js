import EventEmitter from "events"

class StateEvent extends EventEmitter {
    constructor(stateManager, csInterface) {
        super()

        this.stateManager = stateManager
        this.csInterface = csInterface
        this.stateEvent = new CSEvent('com.kureichi.rpc.state-from-backend', 'APPLICATION')
        
        this.stateManager.on('stateChange', (state) => this.dispatchEvent(state))
        
    }

    registerListener() {
        this.csInterface.addEventListener('com.kureichi.rpc.get-state', () => this.dispatchEvent(this.stateManager.getState()))

        console.log('[StateEvent:registerListener] Registered Listener Event.')

        this.csInterface.addEventListener('com.kureichi.rpc.state-from-view', (r) => {
            console.log('[StateEvent:Listener] Got State from View')
            this.emit('stateFromView', r.data)
        })
    }

    dispatchEvent(state) {
        this.stateEvent.data = JSON.stringify(state)
        this.csInterface.dispatchEvent(this.stateEvent)

        console.log('[StateEvent:dispatchEvent] Dispatched event')
    }
}

export default StateEvent
