import * as protocols from './protocols'
const electron = require('electron')
const app = electron.app
// enable backdrop blur in css
app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
const windowManager = require('./windowManager')
const dataController = require('./dataController')
const connectionChecker = require('./connectionChecker')

let mainWindow

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
