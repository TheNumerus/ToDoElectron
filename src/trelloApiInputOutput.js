const fs = require('fs')
var pathToFolder = ''
var token = ''
const filename = 'trelloToken'

/**
 * Control function for saving
 * @param {token to write} token
 */
function writeToken (tokenToWrite) {
	// handle empty token
	if (tokenToWrite === null || tokenToWrite === undefined || tokenToWrite === '') return
	token = tokenToWrite
	createPathString()
	// check for folder
	checkExistence().then((value) => {
		// check for existence of token save
		checkExistence(pathToFolder + filename).then((value) => {
			writeFile()
		})
	}).catch((error) => {
		if (error.code !== 'ENOENT') {
			console.log(error)
		}
		createAppFolder()
	})
}

/**
 * Control function for opening
 * @param {callback} callback
 */
function openToken (callback) {
	createPathString()
	// check for folder
	checkExistence().then((value) => {
		// check for existence of token save and then read token
		Promise.all([checkExistence(filename), openFile()]).then((values) => {
			callback(values[1])
		})
	}).catch((error) => {
		if (error.code !== 'ENOENT') {
			console.log(error)
		}
		createAppFolder()
	})
}

/**
 * Writes token to file
 */
function writeFile () {
	var saveData = {}
	saveData.token = token
	fs.writeFile(pathToFolder + filename, JSON.stringify(saveData), (error) => {
		if (error !== null) {
			console.log(error)
		} else {
			console.log('file with token saved successfuly')
		}
	})
}
/**
 * Opens asynchonusly file and reads token from it
 * @return {Promise} promise
 */
function openFile () {
	return new Promise(function (resolve, reject) {
		fs.readFile(pathToFolder + filename, (error, data) => {
			if (error !== null) {
				console.log(error)
			} else {
				var object = JSON.parse(data.toString())
				resolve(object['token'])
			}
		})
	})
}

/**
 * creates string with path to folder, depending on OS
 * @todo add other OSs
 */
function createPathString () {
	switch (process.platform) {
	case 'win32': {
		pathToFolder = 'C:\\Users\\' + require('os').userInfo().username + '\\AppData\\Roaming\\ToDoElectron\\'
		break
	}
	}
}

/**
 * Creates folder for data
 */
function createAppFolder () {
	console.log('creating folder')
	fs.mkdir(pathToFolder, (error) => {
		if (error !== null) {
			console.log(error)
		}
	})
}

/**
 * asynchronusly checks for existence of file/folder in set path
 * @param {path} path to check
 * @return {Promise} Promise
 */
function checkExistence (path = '') {
	return new Promise(function (resolve, reject) {
		fs.access(pathToFolder + path, fs.constants.F_OK, (error) => {
			if (error !== null && error.code === 'ENOENT') {
				reject(error.code)
			} else {
				resolve(pathToFolder + path)
			}
		})
	})
}

/**
 * saves image to location if needed
 * @param {string} filename - saves to this path
 * @param {Buffer} data - data to save
 */
function saveImage (filename, data) {
	return new Promise(function (resolve, reject) {
		fs.writeFile(pathToFolder + filename, data, (error) => {
			if (error !== null && error.code === 'ENOENT') {
				reject(error.code)
			} else {
				resolve(pathToFolder + filename)
			}
		})
	})
}

module.exports = {
	writeToken: writeToken,
	openToken: openToken,
	saveImage: saveImage,
	checkExistence: checkExistence
}
