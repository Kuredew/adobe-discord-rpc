export class Logger{
  constructor(...scope) {
    this.scope = scope
  }
  
  log(opts) {
    const scopes = this.scope.map(scope => (`${scope}: `))
    const formatted = `${opts.level}: ${scopes.join('')}${opts.message}`
    console.log(formatted)
  }
  
  info(msg) {
    this.log({ level: 'INFO', message: msg })
  }
  warn(msg) {
    this.log({ level: 'WARN', message: msg })
  }
  error(msg) {
    this.log({ level: 'ERROR', message: msg })
  }
  
  child(labelName) {
    return new Logger(...this.scope, labelName)
  }
}