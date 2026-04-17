import path from 'path'

export const bundleName = "com.kureichi.discordrpc"

export const distFolderPath = "./dist"
export const outputExtensionFolderPath = `${distFolderPath}/${bundleName}`
export const outputExtensionZipPath = `${distFolderPath}/${bundleName}.zip`
export const outputCertPath = `${distFolderPath}/cert.p12`
export const outputExtensionZxpPath = `${distFolderPath}/${bundleName}.zxp`

export const symlinkTarget = path.join(process.env.APPDATA, 'Adobe', 'CEP', 'extensions', `${bundleName}`)