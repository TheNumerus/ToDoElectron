import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { changePage } from '../../actions'
import { ISettings } from '../../settings'
import { TrelloTypes } from '../../trelloInterfaces'
import ChecklistBadge from './checklistBadge'
import DueDate from './dueDate'
import ImageCover from './imageCover'
import LabelContainer from './labelContainer'

class Card extends React.Component<ICardProps, {}> {
	public openCard () {
		this.props.dispatch(changePage('TRELLO_CARD', this.props.cardData.id))
	}

	public render () {
		const card = this.props.cardData
		// setting these variables to null, so React won't create any DOM element
		let desc = null
		let comments = null
		let attachments = null
		let imageCover = null
		if (card.placeholder === undefined) {
			if (card.desc !== '') {
				desc = <div><FontAwesomeIcon icon='align-left'/></div>
			}

			if (card.badges.comments > 0) {
				comments = <div><FontAwesomeIcon icon={['far', 'comment']}/>{card.badges.comments}</div>
			}

			if (card.badges.attachments > 0) {
				attachments = <div><FontAwesomeIcon icon='paperclip'/>{card.badges.attachments}</div>
			}

			if (card.idAttachmentCover && card.attachments && this.props.settings.showCardCoverImages) {
				let attachment
				card.attachments.forEach((element) => {
					if (element.id === card.idAttachmentCover) {
						attachment = element
					}
				})
				imageCover = <ImageCover attData={attachment} settings={this.props.settings}/>
			}
		}
		return (
			<div className='cardComponent' onClick={() => this.openCard()} id={card.id} draggable={true}>
				{imageCover}
				<LabelContainer labels={card.labels} settings={this.props.settings}/>
				<div className='cardTitle'>{card.name}</div>
				<div className='cardInfo'>
					<DueDate cardData={card}/>
					{desc}
					<ChecklistBadge badges={card.badges}/>
					{comments}
					{attachments}
				</div>
			</div>
		)
	}
}

export default connect()(Card)

interface ICardProps {
	cardData: TrelloTypes.CardData,
	settings: ISettings,
	dispatch: any
}
