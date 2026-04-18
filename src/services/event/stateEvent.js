import EventEmitter from "events"

class StateEvent extends EventEmitter {
    constructor({ stateManager, logger, csInterface, csEvent }) {
        super()

        this.logger = logger
        this.stateManager = stateManager
        this.csInterface = csInterface
        this.stateEvent = new csEvent('com.kureichi.rpc.state-from-backend', 'APPLICATION')
        
        this.stateManager.on('stateChange', (state) => this.dispatchEvent(state))
        
    }

    registerListener() {
        this.csInterface.addEventListener('com.kureichi.rpc.get-state', () => this.dispatchEvent(this.stateManager.getState()))

        this.logger.info('Registered Listener Event.')

        this.csInterface.addEventListener('com.kureichi.rpc.state-from-view', (r) => {
            this.logger.info('Got State from View')
            this.emit('stateFromView', r.data)
        })
    }

    dispatchEvent(state) {
        this.stateEvent.data = JSON.stringify(state)
        this.csInterface.dispatchEvent(this.stateEvent)

        this.logger.info('Dispatched event')
    }
}

export default StateEvent
