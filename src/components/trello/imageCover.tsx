import {Event, ipcRenderer} from 'electron'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as globalProperties from '../../globalProperties'
import * as HelperUI from '../../HelperUI'
import { ISettings } from '../../settings'
import { TrelloTypes } from '../../TrelloInterfaces'

export default class ImageCover extends React.Component<IimageCoverProps, {}> {
	public render () {
		let extension: string = this.props.attData.url.match(/.+([.].+)/)[1]
		if (this.props.settings !== undefined && !this.props.settings.animateGIFs && extension === '.gif') {
			extension = '.png'
		}
		const filename = `${this.props.attData.id}${extension}`
		const pathToImage = `${globalProperties.getPath()}attachments/${filename}`
		return (
			<div style={{backgroundColor: this.props.attData.edgeColor}}>
				<img className='imgCover' src={pathToImage}/>
			</div>
		)
	}
}

interface IimageCoverProps {
	attData: TrelloTypes.Attachment
	// TODO - remove this and use Redux
	settings: ISettings
}
