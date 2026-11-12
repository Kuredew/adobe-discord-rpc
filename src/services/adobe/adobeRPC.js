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
    this.LOGIN_TIMEOUT = 10000

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

  destroyClient() {
    const client = this.client
    if (!client) return

    try {
      client.removeAllListeners()
      client.destroy().catch((err) => {
        this.logger.warn(`Client destroy failed: ${err}`)
      })
    } catch (err) {
      this.logger.warn(`Client already destroyed: ${err}`)
    }
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
      if (!state.power || state.rpcConnection === 'connecting') {
        this.logger.warn('Power is OFF or RPC is connecting. connect job aborted.')

        this.emitConnection('disconnected')
        return
      }

      this.destroyClient()
      this.createNewClient()
      this.logger.info(`Connecting with ClientID(${this.adobeApp.clientId})...`)
      this.emitConnection('connecting')

      const client = this.client
      let handled = false

      // evita dois reconnects pro mesmo cliente
      const fail = () => {
        if (handled || client !== this.client) return
        handled = true
        reconnect()
      }

      client.on('ready', () => {
        reconnectCount = 1
        this.logger.info('RPC Connected!')
        this.emitConnection('connected')

        this.logger.info('Starting poll...')
        this.startPolling()
      })
      client.on('disconnected', () => {
        this.logger.info('RPC Disconnected')
        fail()
      })

      this.lastActivityInfo = null

      let timeoutId
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('login timeout')), this.LOGIN_TIMEOUT)
      })

      Promise.race([client.login({ clientId: this.adobeApp.clientId }), timeout])
        .catch((err) => {
          this.logger.error(`Error while trying to login : ${err}`)
          fail()
        })
        .finally(() => clearTimeout(timeoutId))
    }

    const reconnect = () => {
      this.stopPolling()
      clearTimeout(this.reconnectTimeoutId)

      const state = this.stateManager.getState()
      if (!state.power) {
        this.logger.warn('Abort reconnect')
        return
      }

      const ms = reconnectCount <= this.MAX_RECONNECT ? 5000 : 10000
      this.logger.info(`Reconnecting RPC after ${ms / 1000} sec... | reconnect count: ${reconnectCount}`)

      this.emitConnection('reconnecting')
      this.reconnectTimeoutId = setTimeout(() => {
        this.logger.info('Reconnecting RPC...')
        reconnectCount += 1
        connect()
      }, ms)
    }

    connect()
  }

  logout() {
    this.stopPolling()
    clearTimeout(this.reconnectTimeoutId)

    this.client.clearActivity()
      .catch((err) => {
        this.logger.error('Error while trying to logout: ' + err)
      })
      .finally(() => {
        this.destroyClient()
        this.logger.info('Successfully logout')
        this.emitConnection('disconnected')
      })
  }

  setActivity(state) {
    const activity = {
      startTimestamp: this.startTimestamp,
      largeImageText: this.adobeApp.appName,
    }

    if (state.rpcDetails && state.showDetails) {
      activity['details'] = state.privacyMode ? state.customDetailsStr || '[Redacted]' : state.rpcDetails
    }

    if (state.rpcState && state.showState) {
      const prefix = state.customPrefix ? state.customPrefixStr : 'Working on'
      const stateStr = state.privacyMode ? state.customStateStr || 'Private' : state.rpcState

      activity['state'] = `${state.rpcState === 'Idling.' ? '' : `${prefix} `}${stateStr}`
    }

    activity['smallImageKey'] = state.rpcSmallImageKey

    activity['partySize'] = parseInt(state.rpcPartySize)
    activity['partyMax'] = parseInt(state.rpcPartyMax)

    if (state.customImage && state.customImageURL) {
      activity['largeImageKey'] = state.customImageURL
    }

    if (this.lastActivityInfo && JSON.stringify(this.lastActivityInfo) === JSON.stringify(activity)) {
      this.logger.warn('Aborted setActivity request')
      return
    }

    this.client.setActivity(activity)
      .then(() => {
        this.logger.info('Set activity to: ' + JSON.stringify(activity, null, 4))
        this.lastActivityInfo = activity
      })
      .catch((err) => {
        this.logger.error(`Failed to update activity : ${err}`)
      })
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
    if (!state.power && (state.rpcConnection === 'connected' || state.rpcConnection === 'reconnecting')) {
      this.logger.info('Power is OFF but rpc connection is connected or reconnecting, disconnecting RPC...')
      this.logout()
    }

    if (state.power && state.rpcConnection === 'disconnected') {
      this.logger.info('Power is ON but rpc connection is disconnected, connecting RPC...')
      this.login()
    }

    if (state.power && state.rpcConnection === 'connected') {
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