const dataControllerIO = require('./dataControllerIO')
const {ipcMain} = require('electron')
const cacheModule = require('./cache')
const trelloApi = require('./trelloApi')

async function initialize () {
	await dataControllerIO.initialize()
	trelloApi.initialize()
	handleIpcCalls()
}

function handleIpcCalls () {
	ipcMain.on('clearCache', (event) => {
		cacheModule.clearCache()
	})
}

module.exports = {
	initialize: initialize
}
