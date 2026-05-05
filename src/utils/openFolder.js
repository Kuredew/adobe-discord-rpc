import { exec } from 'child_process'

export function openFolder(dirName) {
  const command = process.platform === 'win32' ? `explorer "${dirName}"` : `open "${dirName}"`
  exec(command)
}