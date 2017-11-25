/// <reference path="settings.d.ts" />

import globalProperties from './globalProperties'
import * as fs from 'fs'
import {ipcMain, Event} from 'electron'

var settings: SettingsType

export function load () {
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

export function save () {
	return new Promise(function (resolve, reject) {
		fs.writeFile(globalProperties.getPath() + 'settings', JSON.stringify(settings), (error) => {
			if (error) reject(error)
			resolve()
		})
	})
}

export const functions = {
	windowSize: {
		get: () => {
			return settings.windowSize
		},
		set: (obj) => {
			if (obj.x !== undefined && obj.y !== undefined) {
				settings.windowSize.x = obj.x
				settings.windowSize.y = obj.y
				settings.windowSize.maximized = obj.maximized
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
				settings.board.animateGIFs = obj.animateGIFs
				settings.board.useProgressBars = obj.useProgressBars
			} else {
				throw new Error('invalid object in function setBoard')
			}
		}
	}
}

function handleIpc () {
	ipcMain.on('getSettings', (event: Event) => {
		event.sender.send('getSettings-reply', settings)
	})
}

function setDefaultValues () {
	settings = {
		board:{
			animateGIFs: true,
			useProgressBars: false
		},
		theme: Theme.light,
		windowSize: {
			x: 1600,
			y: 900,
			maximized: false
		}
	}
}

export enum Theme {
    light,
    dark
}

export type SettingsType = {
    windowSize: {
        x:number,
        y:number,
        maximized: boolean
    },
    theme: Theme,
    board: {
        useProgressBars: boolean,
        animateGIFs: boolean
    }
}

export async function initialize () {
	try {
		await load()
	} catch (e) {
		setDefaultValues()
		await save()
	}
	handleIpc()
}