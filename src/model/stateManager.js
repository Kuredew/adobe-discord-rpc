import EventEmitter from "events";

const volatile = [
  'versionInfo', 'rpcConnection', 'rpcDetails', 'rpcState',
  'rpcSmallImageKey', 'rpcPartySize', 'rpcPartyMax'
]

class StateManager extends EventEmitter {
  constructor(localStorage, logger) {
    super()
    this.logger = logger
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
      privacyMode: false,
      customStateStr: null,
      customDetailsStr: null,
      customImage: false,
      customImageURL: null,
      customPrefix: false,
      customPrefixStr: null
    }
    this.state = { ...this.defaults }
  }

  init() {
    this.logger.info('Initializing...')

    let data = null
    try {
      data = JSON.parse(this.localStorage.getItem('data'))
    } catch (e) {
      this.logger.error(`Corrupted saved state, using defaults: ${e}`)
    }

    if (!data || typeof data !== 'object') return

    for (const key in this.defaults) {
      if (volatile.includes(key)) continue
      if (key in data) this.state[key] = data[key]
    }

    this.logger.info('State Initialized, Last State: ' + JSON.stringify(this.state, null, 2))
  }

  getState() {
    return this.state
  }

  setState(newState) {
    if (typeof newState === 'string') {
      try {
        newState = JSON.parse(newState)
      } catch (e) {
        this.logger.error(`setState got invalid JSON: ${e}`)
        return
      }
    }
    if (!newState || typeof newState !== 'object') return

    const keys = Object.keys(newState).filter(
      (key) => newState[key] !== undefined && newState[key] !== this.state[key]
    )
    if (keys.length === 0) return

    keys.forEach((key) => {
      this.logger.info(`State changed in '${key}' (${this.state[key]} -> ${newState[key]})`)
    })

    const patch = {}
    keys.forEach((key) => { patch[key] = newState[key] })

    this.state = { ...this.state, ...patch }

    this.updateLocalStorage()
    this.emit('stateChange', this.state)
  }

  updateLocalStorage() {
    this.localStorage.setItem('data', JSON.stringify(this.state))
    this.logger.info('Updated localStorage state')
  }
}

export default StateManager