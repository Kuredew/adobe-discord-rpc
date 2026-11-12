import { describe, it, expect, vi, afterEach } from 'vitest'
import VersionCheck, { isNewer } from '../src/services/github/versionCheck.js'

const logger = { info() { }, warn() { }, error() { } }
const manifest = (v) => ({ load() { }, getManifestVersion: () => v })

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('isNewer', () => {
    it('compara semver direito', () => {
        expect(isNewer('v3.10.0', '3.9.9')).toBe(true)
        expect(isNewer('v3.1.2', '3.1.2')).toBe(false)
        expect(isNewer('v3.1.1', '3.1.2')).toBe(false)
        expect(isNewer('v4.0.0', '3.10.2')).toBe(true)
    })
})

describe('VersionCheck.getVersion', () => {
    it('avisa update novo', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ tag_name: 'v9.0.0' }) })))
        const vc = new VersionCheck(manifest('3.1.2'), logger)
        expect(await vc.getVersion()).toBe('New Update v9.0.0 ↗')
    })

    it('mostra versão atual se já é a última', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ tag_name: 'v3.1.2' }) })))
        const vc = new VersionCheck(manifest('3.1.2'), logger)
        expect(await vc.getVersion()).toBe('v3.1.2')
    })

    it('nunca fica pendurado em 403', async () => {
        vi.useFakeTimers()
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403 })))
        const vc = new VersionCheck(manifest('3.1.2'), logger)
        const p = vc.getVersion()
        await vi.runAllTimersAsync()
        expect(await p).toBe('v3.1.2')
    })

    it('nunca fica pendurado em erro de rede', async () => {
        vi.useFakeTimers()
        vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
        const vc = new VersionCheck(manifest('3.1.2'), logger)
        const p = vc.getVersion()
        await vi.runAllTimersAsync()
        expect(await p).toBe('v3.1.2')
    })
})