const {ipcMain, BrowserWindow} = require('electron')
const path = require('path')
const settings = require('./settings')
const url = require('url')

let history = []
/**
 * @type {Electron.BrowserWindow}
 */
var mainWindow
/**
 * Opens provided url in main window
 * @param {url.URL} url - url to load
 */
function openURL (url) {
	history.push(url)
	mainWindow.loadURL(url)
}

function createWindow () {
	var size = settings.windowSize.get()
	mainWindow = new BrowserWindow({ width: size.x, height: size.y, experimentalFeatures: true, show: false })
	openURL(url.format({
		pathname: path.join(__dirname, 'homepage.html'),
		protocol: 'file:',
		slashes: true
	}))
	mainWindow.on('close', function () {
		save()
	})
	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

function save () {
	var size = mainWindow.getSize()
	settings.windowSize.set({ x: size[0], y: size[1] })
	settings.save()
}

ipcMain.on('goBack', (event) => {
	if (history.length > 0) {
		history.pop()
		mainWindow.loadURL(history[history.length - 1])
	}
})

ipcMain.on('readyToShow', (event) => {
	mainWindow.show()
})

module.exports = {
	openURL: openURL,
	save: save,
	createWindow: createWindow
}
