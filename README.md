<div align="center">
<h2>Adobe Discord Rich Presence</h2>
  <p>
    A streamlined, lightweight Discord RPC extension for Adobe applications. Built for maintainability and efficiency. Inspired by <a href="https://github.com/teeteeteeteetee/adobe-discord-rpc">tee/adobe-discord-rpc</a>.
    <br />
  </p>
    <br />
    <img src="https://img.shields.io/badge/Status-Under%20Development-green?style=for-the-badge">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge">
    <img src="https://img.shields.io/badge/Build%20with-ESBuild-yellow?style=for-the-badge">
    <br />
    <br />
    <img src="https://github.com/user-attachments/assets/e1f2f78e-2105-4707-9647-9666d99637aa">
</div>

#### Supported Applications

* Adobe After Effects
* Adobe Photoshop
* Adobe Premiere Pro
* Adobe InCopy
* Adobe Audition
* Adobe Dreamweaver
* Adobe Animate
* Adobe InDesign
* Adobe Illustrator
* Adobe Prelude
* Adobe Premiere Rush

## Preview
![v3.0.0-rpc-demo](https://i.ibb.co/VcvSMxHQ/v3-0-0-rpc-demo.png)

## How To Install

Before installing the extension, you must enable Adobe's `PlayerDebugMode` to allow unsigned extensions. 

You can follow this [video tutorial](https://youtu.be/dUXCviKRUGg) or use the manual commands below:

**Windows (Command Prompt or PowerShell):**
```cmd
reg add "HKCU\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f
```
*(Note: Change `CSXS.12` to `CSXS.11` or `CSXS.10` if you are using older Adobe versions).*

**macOS (Terminal):**
```bash
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
```
*(Note: Change `CSXS.12` to `CSXS.11` or `CSXS.10` if you are using older Adobe versions).*

> **Important:** Adobe updates may delete this registry key. If the panel disappears or you get a "no signature" error, you will need to run the command again.

### Stuck on "Connecting"?

Discord and Adobe applications must run with the same privilege level. 
If Discord is running as Administrator, make sure to open the Adobe application as Administrator as well.

### ZIP Version
1. Download and extract the `com.kureichi.discordrpc.zip` file from [Releases](https://github.com/Kuredew/adobe-discord-rpc/releases).
2. Cut or copy the `com.kureichi.discordrpc` folder from the extracted file to `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions`.
3. Done.

### ZXP Version
1. Download the `com.kureichi.discordrpc.zxp` file from [Releases](https://github.com/Kuredew/adobe-discord-rpc/releases).
2. Download and install the **ZXP/UXP Installer** from [aescripts](https://aescripts.com/learn/post/zxp-installer).
3. Open the **ZXP/UXP Installer** and open the `com.kureichi.discordrpc.zxp` file in it to start installing the extension.
4. Done.

After that, open the Adobe app you want to use, then go to `Window > Extensions`. You will see a new extension named `Discord RPC`. Open it and dock the panel wherever you prefer.

> [!NOTE]  
> RPC will automatically turn on (because the default power value is true), you can turn off the RPC on the panel.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contributors

- **Kureichi** - Original creator
- **[mar](https://github.com/omaralhami)**
- **[xjuanfxx](https://github.com/xjuanfxx)**

## License

This project is licensed under the [MIT License](LICENSE.md).