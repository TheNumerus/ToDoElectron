const ReactDOM = require('react-dom')
const React = require('react')
const Board = require('./trelloComponents').Board
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const Sortable = require('sortablejs')
const boardId = new URL(window.location.href).searchParams.get('id')

ipcRenderer.send('trelloGetBoardData', boardId, false)
ipcRenderer.on('trelloGetBoardData-reply', (event, boardData) => {
	ipcRenderer.send('trelloGetBackground', boardData.id)
	ReactDOM.render(<Board boardData={boardData}/>, document.querySelector('#lists'))
	postRender()
})

function postRender () {
	var lists = document.querySelectorAll('.cardContainer')
	lists.forEach((list) => {
		Sortable.create(list, {group: 'cards', animation: 150, ghostClass: 'card-ghost'})
	})
}
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

document.querySelector('#update.button').addEventListener('click', (event) => {
	ipcRenderer.send('trelloGetBoardData', boardId, true)
})
