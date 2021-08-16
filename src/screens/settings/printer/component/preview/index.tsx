import {
  listKeyWordsModel,
  PrintPreviewModel,
} from "model/editor/editor.model";
import React from "react";
import "react-quill/dist/quill.snow.css";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const { htmlContent, listKeyWords } = props;
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
    <div
      id="divcontents"
      dangerouslySetInnerHTML={{
        __html: renderHtml(htmlContent),
      }}
    ></div>
  );
};

export default Preview;
