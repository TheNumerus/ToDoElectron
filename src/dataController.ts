import * as windowManager from './windowManager'
const dataControllerIO = require('./dataControllerIO')
const {ipcMain} = require('electron')
const cacheModule = require('./cache')
const trelloApi = require('./trelloApi')

export async function initialize () {
	await dataControllerIO.initialize()
	trelloApi.initialize()
	handleIpcCalls()
}

function handleIpcCalls () {
	ipcMain.on('clearCache', (event) => {
		cacheModule.clearCache()
	})

	ipcMain.on('goToSettings', (event) => {
		windowManager.openURL('settingsPage.html')
	})
}
