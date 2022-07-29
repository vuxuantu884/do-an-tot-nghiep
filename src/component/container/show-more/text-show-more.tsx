import React, { ReactElement, ReactNode, useCallback, useEffect } from "react";
import { TextShowMoreStyle } from "./text-show-more-style";

interface Props {
  children: string;
  maxLength: number;
  splitCharactor?: string;
  endCharactor?: string;
  ShowMoreComponent?: ReactNode;
  onShowMore?: () => void;
  ShowLessComponent?: ReactNode;
  onShowLess?: () => void;
}

TextShowMore.defaultProps = {
  splitCharactor: " ",
  endCharactor: " ...",
  ShowMoreComponent: <span className="show-more-text">&nbsp; Xem thêm</span>,
  ShowLessComponent: <span className="show-more-text">&nbsp; Thu gọn</span>,
  maxLength: 500,
} as Partial<Props>;

function TextShowMore(props: Props): ReactElement {
  const {
    maxLength,
    children,
    splitCharactor,
    endCharactor,
    ShowMoreComponent,
    ShowLessComponent,
    onShowMore,
    onShowLess,
  } = props;

  const [isShowFull, setIsShowFull] = React.useState(false);
  const [textShow, setTextShow] = React.useState<ReactNode>(children);

  /**
   * show full text
   * @param text
   */
  const showMoreText = (text: string) => {
    setTextShow(text);
    setIsShowFull(false);
    onShowLess?.();
  };

  /**
   * collapse text
   * @param text
   * @param maxLength
   */
  const showLessText = useCallback(
    (text: string, maxLength: number) => {
      if (text) {
        const maxText = text.substring(0, maxLength);
        const lastSpace = maxText.lastIndexOf(splitCharactor!);
        let trimmedText = "";

        if (lastSpace > maxLength / 2) {
          trimmedText = maxText.substring(0, lastSpace);
        } else {
          trimmedText = maxText + endCharactor;
        }
        setTextShow(trimmedText);
        setIsShowFull(true);
        onShowMore?.();
      }
    },
    [splitCharactor, endCharactor, onShowMore],
  );

  /**
   *
   * @returns {ReactElement}
   */
  const ShowChilren = () => {
    if (typeof textShow === "string" && children?.length > maxLength) {
      if (isShowFull) {
        return <span onClick={() => showMoreText(children)}>{ShowMoreComponent}</span>;
      } else {
        return <span onClick={() => showLessText(children, maxLength)}>{ShowLessComponent}</span>;
      }
    } else {
      return <></>;
    }
  };
  /**
   * First load : check if text is too long => collapse
   */
  useEffect(() => {
    if (typeof children === "string" && children.length > maxLength!) {
      showLessText(children, maxLength!);
    } else {
      setTextShow(children);
    }
  }, [children, maxLength, showLessText]);

  return (
    <TextShowMoreStyle>
      <span className="content-show">{textShow}</span>
      {<ShowChilren />}
    </TextShowMoreStyle>
  );
}

export default TextShowMore;
