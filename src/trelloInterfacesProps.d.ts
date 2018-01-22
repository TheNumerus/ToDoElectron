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
		settings?: ISettings,
		changePage?: any
	}

	interface ILabelProps {
		labelData: TrelloTypes.Label,
		settings?: ISettings
	}

	interface IBoardProps {
		boardData: TrelloTypes.BoardData
	}

	interface IBoardButtonProps extends IBoardProps {
		changePage?: any
	}

	interface IBoardButtonImageProps extends IBoardButtonProps {
		loaded: boolean
	}

	interface IListProps {
		listData: TrelloTypes.ListData,
		settings?: ISettings,
		changePage?: any
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

	interface ILabelContainerProps {
		labels: TrelloTypes.Label[]
		settings?: ISettings
	}
}
