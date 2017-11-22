import globalProperties from './globalProperties'
import * as fs from 'fs'

var settings = {
	windowSize: {
		x: 1600,
		y: 900,
		maximized: false
	},
	theme: 'default',
	board: {
		useProgessBars: false
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
				settings = JSON.parse(data.toString())
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

export var functions = {
	windowSize: {
		get: () => {
			return settings.windowSize
		},
		set: (obj) => {
			if (obj.x !== undefined || obj.y !== undefined) {
				if (typeof (obj.x) === 'number' || typeof (obj.y) === 'number') {
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
	initialize: async () => {
		try {
			await load()
		} catch (e) {
			await save()
		}
	},
	save: save
}
