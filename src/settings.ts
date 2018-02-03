import {Event, ipcMain} from 'electron'
import * as fs from 'fs'
import * as globalProperties from './globalProperties'

let settings: ISettings

export function load () {
	return new Promise((resolve, reject) => {
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
	return new Promise((resolve, reject) => {
		fs.writeFile(globalProperties.getPath() + 'settings', JSON.stringify(settings), (error) => {
			if (error) {reject(error)}
			resolve()
		})
	})
}

export function get () {
	return settings
}

export function set (object: IChangeSettings[]) {
	for (const setting of object) {
		if (setting[0] !== undefined && setting[1] !== undefined) {
			settings[setting[0]] = setting[1]
		}
	}
}

function handleIpc () {
	ipcMain.on('getSettings', (event: Event) => {
		event.sender.send('getSettings-reply', settings)
	})

	ipcMain.on('changeSettings', (event: Event, data: IChangeSettings) => {
		set(data)
		save()
	})
}

export function setDefaultValues (): ISettings {
	return {
		animateGIFs: true,
		useProgressBars: false,
		theme: Theme.light,
		windowMaximized: false,
		windowX: 1600,
		windowY: 900,
		labelNames: true,
		settingsFileVersion: '1.0',
		showCardCoverImages: true
	}
}

export async function initialize () {
	try {
		await load()
	} catch (e) {
		settings = setDefaultValues()
		await save()
	}
	handleIpc()
}

export enum Theme {
	light,
	dark
}

export type IChangeSettings = [string, any]

export interface ISettings {
	windowX?: number,
	windowY?: number,
	windowMaximized?: boolean,
	theme?: Theme,
	useProgressBars?: boolean,
	animateGIFs?: boolean,
	labelNames?: boolean
	settingsFileVersion?: string,
	showCardCoverImages?: boolean
}
