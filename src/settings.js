import globalProperties from './globalProperties'
import * as fs from 'fs'
import {ipcMain} from 'electron'

var settings = {
	windowSize: {
		x: 1600,
		y: 900,
		maximized: false
	},
	theme: 'default',
	board: {
		useProgressBars: false,
		animateGIFs: true
	}
}

function load () {
	return new Promise(function (resolve, reject) {
		fs.readFile(globalProperties.getPath() + 'settings', (error, data) => {
			if (error) {
				reject(error)
			} else {
				if (data.length === 0) {
					reject(new Error('Empty file'))
				}
				try {
					settings = JSON.parse(data.toString())
				} catch (e) {
					reject(new Error('JEBAT'))
				}
				resolve()
			}
		})
	})
}

function save () {
	return new Promise(function (resolve, reject) {
		fs.writeFile(globalProperties.getPath() + 'settings', JSON.stringify(settings), (error) => {
			if (error) reject(error)
			resolve()
		})
	})
}

var functions = {
	windowSize: {
		get: () => {
			return settings.windowSize
		},
		set: (obj) => {
			if (obj.x !== undefined && obj.y !== undefined) {
				if (typeof (obj.x) === 'number' && typeof (obj.y) === 'number') {
					settings.windowSize.x = obj.x
					settings.windowSize.y = obj.y
					settings.windowSize.maximized = obj.maximized
				} else {
					throw new Error('invalid values in function setWindowSize')
				}
			} else {
				throw new Error('invalid object in function setWindowSize')
			}
		}
	},
	board: {
		get: () => {
			return settings.board
		},
		set: (obj) => {
			if (obj.animateGIFs !== undefined && obj.animateGIFs !== undefined) {
				if (typeof (obj.animateGIFs) === 'boolean' && typeof (obj.animateGIFs) === 'boolean') {
					settings.board.animateGIFs = obj.animateGIFs
					settings.board.useProgressBars = obj.useProgressBars
				} else {
					throw new Error('invalid values in function setBoard')
				}
			} else {
				throw new Error('invalid object in function setBoard')
			}
		}
	},
	initialize: async () => {
		try {
			await load()
		} catch (e) {
			await save()
		}
		handleIpc()
	},
	save: save
}

function handleIpc () {
	ipcMain.on('getSettings', (event) => {
		event.sender.send('getSettings-reply', settings)
	})
}

// TODO rewrite
module.exports = functions
