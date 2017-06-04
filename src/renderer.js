const ipcRenderer = require('electron').ipcRenderer

document.querySelector('#authorizeTrello').addEventListener('click', () => {
	ipcRenderer.send('trelloAuthorize')
})

document.querySelector('#userInfo').addEventListener('click', () => {
	ipcRenderer.send('trelloGetAllUserInfo')
})

document.querySelector('#getBoards').addEventListener('click', () => {
	ipcRenderer.send('trelloGetBoards')
})

ipcRenderer.on('trelloGetAllUserInfo-reply', (event, value) => {
	document.querySelector('#data').innerHTML = JSON.stringify(value)
})

ipcRenderer.on('trelloGetBoards-reply', (event, value) => {
	// var string = ''
	value.boards.forEach((element) => {
		// string += '<button>'
	}, this)
	document.querySelector('#data').innerHTML = JSON.stringify(value)
})
