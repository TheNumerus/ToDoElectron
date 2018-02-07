import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {ipcRenderer, shell} from 'electron'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as globalProperties from '../../globalProperties'
import {TrelloInterfacesProps} from '../../trelloInterfacesProps'

export default class ImageAttachment extends React.Component<TrelloInterfacesProps.IAttachmentControlProps, {}> {
	constructor (props) {
		super(props)
		this.changeCover = this.changeCover.bind(this)
	}

	public openImage (path: string) {
		shell.openExternal(path)
		console.log('opening')
	}

	public changeCover (idCover: string) {
		this.props.changeCover(idCover)
	}

	public render () {
		const extension = this.props.attData.url.match(/.+([.].+)/)
		const filename = `${this.props.attData.id}${extension[1]}`
		const path = `${globalProperties.getPath()}attachments/${filename}`
		const date = new Date(this.props.attData.date)
		const dateString = `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()} - ${date.getUTCHours()}:${date.getUTCMinutes()}`
		const coverString = ` ${this.props.isCover ? ' Remove cover' : ' Set as cover'}`
		return (
			<div className='att'>
				<img onClick={(e) => this.openImage(path)} className='attThumb' src={path}/>
				<div className='attControl'>
					<div className='attUpperBar'>
						<div className='attName'>{this.props.attData.name}</div>
						<div className='attDate'>{dateString}</div>
					</div>
					<div className='attButtonBar'>
						<button onClick={(e) => this.changeCover(this.props.attData.id)}>
							<FontAwesomeIcon icon='image' className='attIcon'/>{coverString}
						</button>
						<button><FontAwesomeIcon icon='comment' className='attIcon'/> Comment</button>
						<button><FontAwesomeIcon icon='trash' className='attIcon'/> Delete</button>
					</div>
				</div>
			</div>
		)
	}
}
