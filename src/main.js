const electron = require('electron')
const app = electron.app
// enable backdrop blur in css
app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const protocols = require('./protocols')
const trelloApi = require('./trelloApi')
const windowManager = require('./windowManager')
const dataController = require('./dataController')

let mainWindow

function createWindow () {
	mainWindow = new BrowserWindow({ width: 1280, height: 720, experimentalFeatures: true })
	windowManager.initialize(mainWindow)
	windowManager.openURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
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
app.on('ready', function () {
	createWindow()
	protocols.registerToDoProtocol()
	trelloApi.loadToken()
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
