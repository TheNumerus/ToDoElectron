import {ipcMain} from 'electron'
import * as cacheModule from './cache'
import * as dataControllerIO from './dataControllerIO'
import * as trelloApi from './trelloApi'
import * as windowManager from './windowManager'

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
