import { appendFileSync, mkdirSync } from "fs"
import path from "path"

export class Logger{
  constructor(csInterface, outputFileName, { label, date }) {
    this.csInterface = csInterface
    this.outputFileName = outputFileName
    this.date = date ?? new Date()

    this.outputFilePath = path.join(
      csInterface.getSystemPath(SystemPath.USER_DATA),
      'adobe-discord-rpc',
      'logs',
      `${outputFileName} (${this.date.getDate()}-${this.date.getMonth() + 1}-${this.date.getFullYear()}).txt`
    )
    mkdirSync(path.dirname(this.outputFilePath), { recursive: true })

    this.labelStr = `${label}: `
  }
  
  log(opts) {
    const formatted = `${opts.level}: ${this.labelStr}${opts.message}`
    console.log(formatted)
    
    appendFileSync(this.outputFilePath, `${formatted}\n`)
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
  
  child(label) {
    return new Logger(this.csInterface, this.outputFileName, {
      label: `${this.labelStr}${label}`,
      date: this.date
    })
  }
}