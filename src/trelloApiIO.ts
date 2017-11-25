import * as fs from 'fs'
import globalProperties from './globalProperties'
let pathToFolder

/**
 * asynchronusly checks for existence of file/folder in set path
 */
export function checkExistence (path = '') {
	return new Promise<string>((resolve, reject) => {
		fs.access(pathToFolder + path, fs.constants.F_OK, (error: Error) => {
			if (error) {
				reject(error)
			} else {
				resolve(pathToFolder + path)
			}
		})
	})
}

/**
 * saves image to location
 */
export function saveImage (filename: string, data: Buffer) {
	return new Promise<string>((resolve, reject) => {
		fs.writeFile(pathToFolder + filename, data, (error: Error) => {
			if (error) {
				reject(error)
			} else {
				resolve(pathToFolder + filename)
			}
		})
	})
}
export function initialize () {
	pathToFolder = globalProperties.getPath()
}
