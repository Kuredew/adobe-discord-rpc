import { describe, it, expect, vi } from 'vitest'
import StateManager from '../src/model/stateManager.js'

const logger = { info() { }, warn() { }, error() { } }
const storage = (raw = null) => ({
    data: raw,
    getItem() { return this.data },
    setItem(_, v) { this.data = v }
})

describe('StateManager', () => {
    it('sobrevive a JSON corrompido', () => {
        const sm = new StateManager(storage('{oops'), logger)
        expect(() => sm.init()).not.toThrow()
        expect(sm.getState().power).toBe(true)
    })

    it('não restaura estado volátil', () => {
        const raw = JSON.stringify({ power: false, rpcConnection: 'connecting', versionInfo: 'old' })
        const sm = new StateManager(storage(raw), logger)
        sm.init()
        expect(sm.getState().power).toBe(false)
        expect(sm.getState().rpcConnection).toBeNull()
        expect(sm.getState().versionInfo).toBeNull()
    })

    it('não muta os defaults', () => {
        const a = new StateManager(storage(), logger)
        a.setState({ power: false })
        const b = new StateManager(storage(), logger)
        expect(b.getState().power).toBe(true)
    })

    it('aceita estado como string JSON', () => {
        const sm = new StateManager(storage(), logger)
        sm.setState(JSON.stringify({ versionInfo: 'v1.0.0' }))
        expect(sm.getState().versionInfo).toBe('v1.0.0')
        expect(Object.keys(sm.getState())).not.toContain('0')
    })

    it('ignora undefined', () => {
        const sm = new StateManager(storage(), logger)
        sm.setState({ versionInfo: 'v1' })
        sm.setState({ versionInfo: undefined })
        expect(sm.getState().versionInfo).toBe('v1')
    })

    it('só emite quando algo muda', () => {
        const sm = new StateManager(storage(), logger)
        const spy = vi.fn()
        sm.on('stateChange', spy)
        sm.setState({ power: true })
        expect(spy).not.toHaveBeenCalled()
        sm.setState({ power: false })
        expect(spy).toHaveBeenCalledTimes(1)
    })
})