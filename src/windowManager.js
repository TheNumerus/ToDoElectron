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
export function openURL (url) {
	history.push(url)
	mainWindow.loadURL(url)
}

export function createWindow () {
	var size = settings.windowSize.get()
	mainWindow = new BrowserWindow({ width: size.x, height: size.y, minHeight: 480, minWidth: 640, experimentalFeatures: true, show: false })
	if (size.maximized) {
		mainWindow.maximize()
	}
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

export function save () {
	var size = mainWindow.getSize()
	var maximized = mainWindow.isMaximized()
	settings.windowSize.set({ x: size[0], y: size[1], maximized: maximized })
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

/**
 * Sends message to renderer process
 * 
 * @param {string} channel 
 * @param {any} data 
 */
export function sendMessage (channel, data) {
	mainWindow.webContents.send(channel, data)
}

export function getMainWindow () {
	return mainWindow
}
