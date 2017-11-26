import {BrowserWindow, ipcMain, Menu} from 'electron'
import * as path from 'path'
import {URL} from 'url'
import * as settings from './settings'

// get rid of menu eventually
const menuTemplate = [
	{
		role: 'quit'
	},
	{
		role: 'reload'
	},
	{
		role: 'toggledevtools'
	}
]

const history = []
let mainWindow: Electron.BrowserWindow

/**
 * Opens provided url in main window
 */
export function openURL (filename: string) {
	const urlToLoad = new URL('file://' + __dirname + '/' + filename).toString()
	history.push(urlToLoad)
	mainWindow.loadURL(urlToLoad)
}

export function createWindow () {
	const size = settings.get()
	const menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)
	mainWindow = new BrowserWindow({ height: size.windowY, minHeight: 480, minWidth: 640, show: false, width: size.windowX,
		webPreferences: {experimentalFeatures: true, nodeIntegration: true} })
	// mainWindow.setMenuBarVisibility(false)
	if (size.windowMaximized) {
		mainWindow.maximize()
	}
	openURL('homepage.html')
	mainWindow.on('close', () => {
		save()
	})
	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

export function save () {
	const size = mainWindow.getSize()
	const maximized = mainWindow.isMaximized()
	settings.set([
		['windowX', size[0]],
		['windoxY', size[1]],
		['windowMaximized', maximized]
	])
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
