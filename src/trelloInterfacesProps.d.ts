import {TrelloTypes} from './trelloInterfaces'
import {ISettings} from './settings'

export module TrelloInterfacesProps {
	interface IAttachmentProps {
		attData: TrelloTypes.Attachment,
		settings?: ISettings
	}

	interface IAttachmentControlProps extends IAttachmentProps {
		isCover: boolean,
		changeCover (idCover: string): void
	}

	interface IBadgesProps {
		badges: TrelloTypes.Badges
	}

	interface ICardDataProps {
		cardData: TrelloTypes.CardData,
		settings?: ISettings
	}

	interface ILabelProps {
		labelData: TrelloTypes.Label
	}

	interface IBoardProps {
		boardData: TrelloTypes.BoardData
	}

	interface IListProps {
		listData: TrelloTypes.ListData,
		settings?: ISettings
	}

	interface IChecklistProps {
		checklistData: TrelloTypes.Checklist
	}

	interface ICheckProps {
		check: TrelloTypes.Check
	}
	interface ICommentProps {
		commentData: TrelloTypes.Action
	}

}