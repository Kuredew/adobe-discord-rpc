import { describe, it, expect, vi } from 'vitest'
import EventEmitter from 'events'

vi.mock('discord-rpc', () => ({
    Client: class extends EventEmitter {
        login = vi.fn(() => new Promise(() => { }))
        destroy = vi.fn(() => Promise.resolve())
        clearActivity = vi.fn(() => Promise.resolve())
        setActivity = vi.fn(() => Promise.resolve())
    }
}))

import AdobeRPC from '../src/services/adobe/adobeRPC.js'

const make = (state) => {
    const states = []
    const rpc = new AdobeRPC({
        stateManager: Object.assign(new EventEmitter(), { getState: () => state }),
        logger: { info() { }, warn() { }, error() { } },
        adobeApp: { load() { }, clientId: '1', appName: 'x' },
        csInterface: { evalScript: (_, cb) => cb('') },
    })
    rpc.on('connectionChange', (c) => states.push(c))
    return { rpc, states }
}

describe('AdobeRPC', () => {
    it('reconecta se login travar', async () => {
        vi.useFakeTimers()
        const { rpc, states } = make({ power: true, rpcConnection: 'disconnected' })
        rpc.login()
        await vi.advanceTimersByTimeAsync(10000)
        expect(states).toContain('reconnecting')
        vi.useRealTimers()
    })

    it('não conecta com power off', () => {
        const { rpc, states } = make({ power: false, rpcConnection: 'disconnected' })
        rpc.login()
        expect(states).toEqual(['disconnected'])
    })
})