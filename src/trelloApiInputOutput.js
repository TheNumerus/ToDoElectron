const fs = require('fs')
var path = ''
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
	createPath()
	// create folder if non-existent
	checkExistence(path).then((value) => {
		if (!value) {
			createAppFolder()
		}
		// check for existence of token save
		checkExistence(path + filename).then((value) => {
			writeFile()
		})
	})
}
/**
 * Control function for opening
 * @param {callback} callback
 */
function openToken (callback) {
	createPath()
	// create folder if non-existent
	checkExistence(path).then((value) => {
		if (!value) {
			createAppFolder()
		}
		// check for existence of token save and then read token
		Promise.all([checkExistence(path + filename), openFile()]).then((values) => {
			callback(values[1])
		})
	})
}
/**
 * Writes token to file
 */
function writeFile () {
	var saveData = {}
	saveData.token = token
	fs.writeFile(path + filename, JSON.stringify(saveData), (error) => {
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
		fs.readFile(path + filename, (error, data) => {
			if (error !== null) {
				console.log(error)
			} else {
				var object = JSON.parse(data.toString())
				resolve(object['token'])
			}
		})
	})
}
function createPath () {
	// create path depending on OS
	// TODO add other OSs
	switch (process.platform) {
	case 'win32': {
		path = 'C:\\Users\\' + require('os').userInfo().username + '\\AppData\\Roaming\\ToDoElectron\\'
		break
	}
	}
}

/**
 * Creates folder for data
 */
function createAppFolder () {
	console.log('creating folder')
	fs.mkdir(path, (error) => {
		if (error !== null) {
			console.log(error)
		}
	})
}

/**
 * asynchronusly checks for existence of file/folder on path
 * @return {Promise} Promise
 */
function checkExistence () {
	return new Promise(function (resolve, reject) {
		fs.access(path, fs.constants.F_OK, (error) => {
			if (error !== null && error.code === 'ENOENT') {
				resolve(false)
			} else {
				resolve(true)
			}
		})
	})
}
module.exports = {
	writeToken: writeToken,
	openToken: openToken
}
