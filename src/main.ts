import * as electron from 'electron'
import * as protocols from './protocols'
import * as windowManager from './windowManager'
import * as dataController from './dataController'
import * as connectionChecker from './connectionChecker'
const app = electron.app
// enable backdrop blur in css
app.commandLine.appendSwitch('--enable-experimental-web-platform-features')

let mainWindow : Electron.BrowserWindow

/**
 * call methods after app has loaded
 */
app.on('ready', async function () {
	await dataController.initialize()
	windowManager.createWindow()
	protocols.registerToDoProtocol()
	connectionChecker.startCheck()
})

app.on('window-all-closed', function () {
	// special behaviour for macOS
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	if (mainWindow === null) {
		windowManager.createWindow()
	}
})
