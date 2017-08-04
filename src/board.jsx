const ReactDOM = require('react-dom')
const React = require('react')
const CardCompoment = require('./trelloComponents').CardComponent
const ListCompoment = require('./trelloComponents').ListComponent
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const boardId = new URL(window.location.href).searchParams.get('id')

ipcRenderer.send('trelloGetBoardData', boardId)
ipcRenderer.on('trelloGetBoardData-reply', (event, boardData) => {
	// set board name
	document.querySelector('#boardName').innerHTML = boardData.name
	// render empty lists
	var lists = {ids: [], components: []}
	boardData.values.forEach((list) => {
		var element = <ListCompoment name={list.name} id={list.id}/>
		lists.components.push(element)
		// get ids for later use
		lists.ids.push(list.id)
	}, this)
	ReactDOM.render(<div>{lists.components}</div>, document.querySelector('#lists'))
	ipcRenderer.send('trelloGetBatchListData', lists.ids)
	ipcRenderer.send('trelloGetBackground', boardData.id)
})

ipcRenderer.on('trelloGetBatchListData-reply', (event, listData) => {
	var cardContainers = {}
	document.querySelectorAll('.cardContainer').forEach((element) => {
		cardContainers[element.id] = element
	})
	listData.values.forEach((list) => {
		// handle empty lists
		if (list.length < 1) { return }
		var target = cardContainers[list[0].idList]
		var cardComponents = []
		list.forEach((card) => {
			// handle archived cards
			if (card.closed) { return }
			var element = <CardCompoment card={card}/>
			cardComponents.push(element)
		})
		ReactDOM.render(<div>{cardComponents}</div>, target)
	}, this)
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
