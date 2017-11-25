import {ipcMain, BrowserWindow, Menu} from 'electron'
import {URL} from 'url'
import * as path from 'path'
import * as settings from './settings'

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
var mainWindow : Electron.BrowserWindow

/**
 * Opens provided url in main window
 */
export function openURL (filename: string) {
	var urlToLoad = new URL('file://' + __dirname + '/' + filename).toString()
	history.push(urlToLoad)
	mainWindow.loadURL(urlToLoad)
}

export function createWindow () {
	var size = settings.functions.windowSize.get()
	const menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)
	mainWindow = new BrowserWindow({ width: size.x, height: size.y, minHeight: 480, minWidth: 640, show: false, webPreferences: {experimentalFeatures: true, nodeIntegration: true} })
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
	settings.functions.windowSize.set({ x: size[0], y: size[1], maximized: maximized })
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
 */
export function sendMessage (channel: string, data) {
	mainWindow.webContents.send(channel, data)
}

export function getMainWindow () {
	return mainWindow
}
