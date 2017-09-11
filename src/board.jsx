const ReactDOM = require('react-dom')
const React = require('react')
const CardComponent = require('./trelloComponents').CardComponent
const ListComponent = require('./trelloComponents').ListComponent
const Board = require('./trelloComponents').Board
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const boardId = new URL(window.location.href).searchParams.get('id')

ipcRenderer.send('trelloGetBoardData', boardId)
ipcRenderer.on('trelloGetBoardData-reply', (event, boardData) => {
	var lists = []
	boardData.values.forEach((list) => {
		lists.push(list.id)
	}, this)
	ipcRenderer.send('trelloGetBackground', boardData.id)
	ReactDOM.render(<Board boardData={boardData}/>, document.querySelector('#lists'))
})

ipcRenderer.on('trelloGetBackground-reply', (event, imagePath) => {
	// handle solid color background
	if (imagePath[0] === '#') {
		document.querySelector('body').style.backgroundColor = imagePath
	} else {
		document.querySelector('body').background = imagePath
	}
})

document.querySelector('.button.back').addEventListener('click', (event) => {
	ipcRenderer.send('goBack')
})
