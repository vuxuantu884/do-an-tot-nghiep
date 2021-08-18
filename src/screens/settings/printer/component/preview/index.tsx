import { Button } from "antd";
import {
  listKeyWordsModel,
  PrintPreviewModel,
} from "model/editor/editor.model";
import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import IconPrintHover from "./images/iconPrintHover.svg";
import { StyledComponent } from "./styles";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const { htmlContent, listKeyWords } = props;
  // console.log("htmlContent", htmlContent);
  const componentRef = useRef(null);

  const replaceSymbolByText = (
    text: string,
    replacements: listKeyWordsModel
  ) => {
    let resultText = text;
    let replacementLength = replacements.length;
    if (replacementLength > 0) {
      for (let i = 0; i < replacementLength; i++) {
        resultText = resultText.replaceAll(
          replacements[i].key,
          replacements[i].value
        );
      }
    }
    // console.log("resultText", resultText);
    return resultText;
  };

  const renderHtml = (htmlContent: string) => {
    // console.log("htmlContent", htmlContent);
    let result = htmlContent;
    if (listKeyWords) {
      result = replaceSymbolByText(htmlContent, listKeyWords);
    }
    return result;
  };

  return (
    <StyledComponent>
      <div className="preview">
        <div className="preview__header">
          <div className="preview__header-inner">
            <h3 className="preview__header-title">Bản xem trước</h3>
            <ReactToPrint
              trigger={() => (
                <Button className="button--print">
                  <div className="icon">
                    <img src={IconPrintHover} alt="" className="icon--hover" />
                  </div>
                  In thử
                </Button>
              )}
              content={() => componentRef.current}
            />
          </div>
        </div>
        <div className="preview__content printContent" ref={componentRef}>
          <div
            id="divcontents"
            dangerouslySetInnerHTML={{
              __html: renderHtml(htmlContent),
            }}
          ></div>
        </div>
      </div>
    </StyledComponent>
  );
};

export default Preview;
