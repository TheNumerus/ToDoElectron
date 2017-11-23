import {ipcMain, BrowserWindow, Menu} from 'electron'
import {URL} from 'url'
const path = require('path')
const settings = require('./settings')

// get rid of menu eventually
const menuTemplate = [
	{
		role: 'quit'
	},
	{
		'role': 'reload'
	},
	{
		'role': 'toggledevtools'
	}
]

let history = []
/**
 * @type {Electron.BrowserWindow}
 */
var mainWindow
/**
 * Opens provided url in main window
 * @param {string} filename - url to load
 */
export function openURL (filename) {
	var urlToLoad = new URL('file://' + __dirname + '/' + filename).toString()
	history.push(urlToLoad)
	mainWindow.loadURL(urlToLoad)
}

export function createWindow () {
	var size = settings.windowSize.get()
	const menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)
	mainWindow = new BrowserWindow({ width: size.x, height: size.y, minHeight: 480, minWidth: 640, experimentalFeatures: true, show: false })
	// mainWindow.setMenuBarVisibility(false)
	if (size.maximized) {
		mainWindow.maximize()
	}
	openURL('homepage.html')
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
