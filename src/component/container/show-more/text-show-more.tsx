import React, { ReactElement, ReactNode, useCallback, useEffect } from 'react';
import { TextShowMoreStyle } from './text-show-more-style';

interface Props {
    children: string;
    maxLength?: number;
    splitCharactor?: string;
    endCharactor?: string;
    ShowMoreComponent?: ReactNode;
    onShowMore?: () => void;
    ShowLessComponent?: ReactNode;
    onShowLess?: () => void;
}

TextShowMore.defaultProps = {
    splitCharactor: ' ',
    endCharactor: " ...",
    ShowMoreComponent: <span className='show-more-text'>Xem thêm</span>,
    ShowLessComponent: <span className='show-more-text'>Thu gọn</span>,
    maxLength: 500
} as Partial<Props>

function TextShowMore(props: Props): ReactElement {
    const { maxLength, children,
        splitCharactor,
        endCharactor,
        ShowMoreComponent,
        ShowLessComponent,
        onShowMore, onShowLess } = props;

    const [isShowFull, setIsShowFull] = React.useState(false)
    const [textShow, setTextShow] = React.useState(children)

    /**
     * show full text
     * @param text 
     */
    const showMoreText = (text: string) => {
        setTextShow(text);
        setIsShowFull(false);
        onShowLess?.()
    }


    /**
     * collapse text 
     * @param text 
     * @param maxLength 
     */
    const showLessText = useCallback((text: string, maxLength: number) => {
        const maxText = text.substring(0, maxLength);
        const lastSpace = maxText.lastIndexOf(splitCharactor!);
        const trimmedText = maxText.substring(0, lastSpace);
        setTextShow(trimmedText + endCharactor);
        setIsShowFull(true);
        onShowMore?.()

    }, [splitCharactor, endCharactor, onShowMore])


    /**
     * First load : check if text is too long => collapse 
     */
    useEffect(() => {
        if (children.length > maxLength!) {
            showLessText(children, maxLength!);
        }
    }, [children, maxLength, showLessText])

    return (
        <TextShowMoreStyle>
            {textShow} {isShowFull
                ? <span onClick={() => showMoreText(children)}>{ShowMoreComponent}</span>
                : <span onClick={() => showLessText(children, maxLength!)}>{ShowLessComponent}</span>}
        </TextShowMoreStyle>
    )
}

export default TextShowMore
