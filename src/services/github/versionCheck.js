export function isNewer(latest, current) {
  const parse = (v) => String(v).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0)
  const a = parse(latest)
  const b = parse(current)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] || 0) - (b[i] || 0)
    if (diff !== 0) return diff > 0
  }
  return false
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

class VersionCheck {
  constructor(manifestReader, logger) {
    this.logger = logger
    this.isLatestVersion = null
    this.currentVersion = null
    this.currentVersionStr = null
    this.repoUrl = 'https://api.github.com/repos/Kuredew/adobe-discord-rpc'
    this.manifestReader = manifestReader
    this.MAX_ATTEMPTS = 3
    this.TIMEOUT_MS = 8000
  }

  async fetchLatestTag() {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS)
    try {
      const response = await fetch(`${this.repoUrl}/releases/latest`, {
        signal: controller.signal,
        headers: { Accept: 'application/vnd.github+json' }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!data.tag_name) throw new Error('tag_name missing')
      return data.tag_name
    } finally {
      clearTimeout(timer)
    }
  }

  async getVersion() {
    this.manifestReader.load()
    this.currentVersion = this.manifestReader.getManifestVersion()
    this.currentVersionStr = 'v' + this.currentVersion

    for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
      try {
        this.logger.info(`Checking latest version (attempt ${attempt})...`)
        const latest = await this.fetchLatestTag()
        this.logger.info(`Latest ${latest}, current ${this.currentVersionStr}`)

        if (isNewer(latest, this.currentVersion)) {
          this.logger.warn(`Outdated (${this.currentVersionStr}), update to ${latest}`)
          this.isLatestVersion = false
          return `New Update ${latest} ↗`
        }
        this.isLatestVersion = true
        return this.currentVersionStr
      } catch (e) {
        this.logger.error(`Version check failed: ${e}`)
        if (attempt < this.MAX_ATTEMPTS) await sleep(3000 * attempt)
      }
    }

    this.logger.warn('Version check gave up, showing current version')
    return this.currentVersionStr
  }
}

export default VersionCheck