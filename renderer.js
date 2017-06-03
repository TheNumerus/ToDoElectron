const ipcRenderer = require('electron').ipcRenderer

document.querySelector('#authorizeTrello').addEventListener('click', function () {
	ipcRenderer.send('trelloAuthorize')
})

document.querySelector('#userInfo').addEventListener('click', function () {
	ipcRenderer.send('trelloGetUser')
})

ipcRenderer.on('trelloGetUserData', (event, arg) => {
	document.querySelector('#data').innerHTML = JSON.stringify(arg)
})
