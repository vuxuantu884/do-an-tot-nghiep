import React from "react";
import { renderContentWithBreakLine } from "utils/OrderUtils";

type PropTypes = {
  note: string | undefined | null;
};

function TextWithLineBreak(props: PropTypes) {
  const { note } = props;
  const renderContent = (content: string | null | undefined) => {
    let result = renderContentWithBreakLine(content);
    return (
      <React.Fragment>
        {result.map((single, index) => {
          return (
            <React.Fragment key={index}>
              {single}
              {index < result.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  };
  return <React.Fragment>{renderContent(note)}</React.Fragment>;
}

export default TextWithLineBreak;
