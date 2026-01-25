export default class Logger {
  constructor(funcName) {
    this.funcName = funcName ? funcName : "default"
  }

  parse(msg) {
    return `[${this.funcName}] ${msg}`
  }

  log(msg) {
    console.log(`[INFO] ${this.parse(msg)}`)
  }

  error(msg) {
    console.log(`[ERROR] ${this.parse(msg)}`)
  }

  warning(msg) {
    console.log(`[WARNING] ${this.parse(msg)}`)
  }
}