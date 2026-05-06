import { Client } from 'discord-rpc'
import EventEmitter from 'events'

class AdobeRPC extends EventEmitter {
  constructor({ stateManager, logger, adobeApp, csInterface }) {
    super()

    this.logger = logger
    this.client = new Client({ transport: 'ipc' })
    this.callback = null
    this.pollingTimeoutId = null
    this.reconnectTimeoutId = null
    this.MAX_RECONNECT = 5

    this.adobeApp = adobeApp
    this.stateManager = stateManager
    this.getCurrentState = null
    this.startTimestamp = new Date()
    this.csInterface = csInterface
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
    let reconnectCount = 1

    const connect = () => {
      const state = this.stateManager.getState()
      if (!state.power || state.rpcConnection === "connecting") {
        this.logger.warn('Power is OFF or RPC is connecting. connect job aborted.')

        this.emitConnection('disconnected')
        return
      }

      this.createNewClient()
      this.logger.info(`Connecting with ClientID(${this.adobeApp.clientId})...`)
      this.emitConnection('connecting')

      this.client.on("ready", () => {
        this.logger.info('RPC Connected!')
        this.emitConnection('connected')

        this.logger.info('Starting poll...')
        this.startPolling()
      })
      this.client.on("disconnected", () => {
        this.logger.info(`RPC Disconnected`)
        reconnect()
      })

      this.lastActivityInfo = null
      this.client.login({
        clientId: this.adobeApp.clientId
      }).catch((err) => {
        this.logger.error(`Error while trying to login : ${err}`)
        reconnect()
      })
    }

    const reconnect = () => {
      this.stopPolling()

      const makeTimeout = (ms) => {
        this.emitConnection('reconnecting')
        this.reconnectTimeoutId = setTimeout(() => {
          this.logger.info('Reconnecting RPC...')
          reconnectCount += 1

          connect()
        }, ms)
      }

      const state = this.stateManager.getState()
      if (!state.power || state.rpcConnection === "reconnecting") {
        this.logger.warn('Abort reconnect')
        return
      }

      if (reconnectCount <= this.MAX_RECONNECT) {
        this.logger.info(`Reconnecting RPC after 5 sec... | reconnect count: ${reconnectCount}`)
        makeTimeout(5000)
        return
      }

      this.logger.warn('Reconnecting RPC after 10 sec...')
      makeTimeout(10000)
    }

    connect()
  }

  logout() {
    this.stopPolling()
    clearTimeout(this.reconnectTimeoutId)

    this.client.clearActivity().then(() => {
      return this.client.destroy()
    }).then(() => {
      this.logger.info('Successfully logout')
    }).catch((err) => {
      this.logger.error('Error while trying to logout: ' + err)
    }).finally(() => {
      this.emitConnection('disconnected')
    })
  }

  setActivity(state) {
    const activity = {
      startTimestamp: this.startTimestamp,
      largeImageText: this.adobeApp.appName,
    }

    if (state.rpcDetails && state.showDetails) {
      activity['details'] = state.privacyMode ? state.customDetailsStr || "[Redacted]" : state.rpcDetails
    }

    if (state.rpcState && state.showState) {
      const prefix = state.customPrefix ? state.customPrefixStr : "Working on"
      const stateStr = state.privacyMode ? state.customStateStr || "Private" : state.rpcState

      activity['state'] = `${state.rpcState === 'Idling.' ? '' : `${prefix} `}${stateStr}`;
    }

    activity['smallImageKey'] = state.rpcSmallImageKey

    activity['partySize'] = parseInt(state.rpcPartySize)
    activity['partyMax'] = parseInt(state.rpcPartyMax)

    state.customImage ? (state.customImageURL ? (activity['largeImageKey'] = state.customImageURL) : null) : null

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
    this.stopPolling()

    const funcs = [
      { props: 'rpcDetails', func: 'getDetails()' },
      { props: 'rpcState', func: 'getState()' },
      { props: 'rpcSmallImageKey', func: 'getSmallImageKey()' },
      { props: 'rpcPartySize', func: 'getPartySize()' },
      { props: 'rpcPartyMax', func: 'getPartyMax()' },
    ]

    const poll = async () => {
      const currentId = this.pollingTimeoutId

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

      if (this.pollingTimeoutId === currentId) {
        this.pollingTimeoutId = setTimeout(poll, 1000)
      } else {
        this.logger.warn('Polling schedule eliminated due to interval ID mismatch')
      }
    }

    this.pollingTimeoutId = setTimeout(poll, 1000)
    this.logger.info('Polling schedule created')
  }

  stopPolling() {
    if (!this.pollingTimeoutId) {
      this.logger.warn('Stop polling aborted because interval is already null')
      return
    }

    this.logger.info(`Stopping polling with ID: ${this.pollingTimeoutId}`)
    clearTimeout(this.pollingTimeoutId)
    this.pollingTimeoutId = null
    this.logger.info('Polling stopped')
  }

  reload(state) {
    if (!state.power && (state.rpcConnection === "connected" || state.rpcConnection === "reconnecting")) {
      this.logger.info("Power is OFF but rpc connection is connected or reconnecting, disconnecting RPC...")
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
