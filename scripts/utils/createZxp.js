import zxpSignCmd from "zxp-sign-cmd";
import Logger from "./logger.js";
import path from "path";

const logger = new Logger("createZXP")

export default async function createZxp(extensionFolderPath, outputCertPath, outputZxpPath) {
  const password = "kureichi"
  outputCertPath = path.resolve(outputCertPath)

  try {
    logger.log(`Creating Certificate to ${outputCertPath}`)
    await zxpSignCmd.selfSignedCert({
      country: "US",
      province: "yapyapyap",
      org: "org ganteng",
      name: "ajimawok",
      password: password,
      output: outputCertPath
    })

    logger.log("Creating ZXP with Certificate...")
    await zxpSignCmd.sign({
      input: extensionFolderPath,
      output: outputZxpPath,
      cert: outputCertPath,
      password: password
    })
  } catch (e) {
    throw new Error(logger.parse(e.message))
  }
}