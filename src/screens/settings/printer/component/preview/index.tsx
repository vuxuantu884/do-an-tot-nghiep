import { Button } from "antd";
import {
  listKeyWordsModel,
  PrintPreviewModel,
} from "model/editor/editor.model";
import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import { StyledComponent } from "./styles";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const { htmlContent, listKeyWords } = props;
  console.log("htmlContent", htmlContent);
  const componentRef = useRef(null);
  // const FAKE_WORDS = [
  //   {
  //     symbol: "{ten_cong_ty}",
  //     value: "YODY",
  //   },
  //   {
  //     symbol: "{dia_chi_cong_ty}",
  //     value: "Hải dương",
  //   },
  // ];

  /**
   * https://stackoverflow.com/questions/47794036/replace-with-multiple-value-in-string-typescript
   */
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
  // const replaceSymbolByText = (text: string) => {
  //   FAKE_WORDS.forEach((singleWord) => {
  //     text = text.replaceAll(singleWord.symbol, singleWord.value);
  //   });
  //   return text;
  // };
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
            <span>Bản xem trước</span>
            <ReactToPrint
              trigger={() => <Button>In thử</Button>}
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
