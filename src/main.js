const electron = require('electron')
const app = electron.app
// enable backdrop blur in css
app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const protocols = require('./protocols')
const windowManager = require('./windowManager')
const dataController = require('./dataController')
const connectionChecker = require('./connectionChecker')

let mainWindow

function createWindow () {
	mainWindow = new BrowserWindow({ width: 1600, height: 900, experimentalFeatures: true /* show: false */ })
	windowManager.initialize(mainWindow)
	windowManager.openURL(url.format({
		pathname: path.join(__dirname, 'homepage.html'),
		protocol: 'file:',
		slashes: true
	}))
	mainWindow.on('closed', function () {
		mainWindow = null
	})
}
/**
 * call methods after app has loaded
 */
app.on('ready', async function () {
	await dataController.initialize()
	createWindow()
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
		createWindow()
	}
})
