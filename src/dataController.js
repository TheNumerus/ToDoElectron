const dataControllerIO = require('./dataControllerIO')
const {ipcMain} = require('electron')
const cacheModule = require('./cache')
const trelloApi = require('./trelloApi')

function initialize () {
	dataControllerIO.initialize().then(() => {
		trelloApi.initialize()
		handleIpcCalls()
	})
}

function handleIpcCalls () {
	ipcMain.on('clearCache', (event) => {
		cacheModule.clearCache()
	})
}

module.exports = {
	initialize: initialize
}
