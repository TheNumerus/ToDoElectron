/**
 * @type {Electron.BrowserWindow}
 */
let window
/**
* Initialize windowManager
* @param {Electron.BrowserWindow} broswerWindow - window to manage
*/
function initialize (broswerWindow) {
	window = broswerWindow
}
/**
 * Opens provided url in main window
 * @param {url.URL} url - url to load
 */
function openURL (url) {
	window.loadURL(url)
}

module.exports = {
	initialize: initialize,
	openURL: openURL
}
