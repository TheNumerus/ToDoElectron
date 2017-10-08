const ReactDOM = require('react-dom')
const React = require('react')
const Board = require('./trelloComponents').Board
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const boardId = new URL(window.location.href).searchParams.get('id')

ReactDOM.render(<Board/>, document.querySelector('#lists'))

function goBack () {
	ipcRenderer.send('goBack')
}

function update () {
	document.querySelector('#updateIcon').classList.add('fa-spin')
	ipcRenderer.send('trelloGetBoardData', boardId, true)
}
