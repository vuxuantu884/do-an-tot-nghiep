import { Button } from "antd";
import {
  listKeywordsModel,
  PrintPreviewModel,
} from "model/editor/editor.model";
import React, { useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import IconPrintHover from "./images/iconPrintHover.svg";
import { StyledComponent } from "./styles";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const {
    htmlContent,
    listKeywords,
    listProductKeywords,
    previewHeaderHeight,
  } = props;
  // console.log("htmlContent", htmlContent);
  const printElementRef = useRef(null);
  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  const replaceSymbolByText = (text: string) => {
    let resultText = text;
    let tableElements = document.getElementsByTagName("table");
    console.log("tableElements", tableElements);
    let listKeywordLength = listKeywords?.length;
    let listProductKeywordsLength = listProductKeywords?.length;

    let abc = "";
    if (
      listProductKeywords &&
      listProductKeywordsLength &&
      listProductKeywordsLength > 0
    ) {
      let result = "";
      let textReplaced = "";
      for (const item of tableElements) {
        let trElements = item.getElementsByTagName("tr");
        textReplaced = trElements[0].outerHTML;
        let numberOfProducts = listProductKeywords[0].value.length;
        console.log("numberOfProducts", numberOfProducts);
        for (const element of listProductKeywords) {
          const arrayKeys = element.value;
          console.log("element", element);
          console.log("arrayKeys", arrayKeys);
          // result = trElements[0].innerHTML.replaceAll(arrayKeys.);
          result += trElements[0].outerHTML;
          console.log("trElements[0].innerHTML", trElements[0].innerHTML);
        }
      }
      console.log("resultText1", resultText);
      console.log("result", result);
      console.log("textReplaced", textReplaced);
      abc = resultText.replaceAll(textReplaced, resultText);
    }
    console.log("resultText2", abc);
    if (listKeywords && listKeywordLength && listKeywordLength > 0) {
      // for (let i = 0; i < listKeywordLength; i++) {
      //   resultText = resultText.replaceAll(
      //     listKeywords[i].key,
      //     listKeywords[i].value
      //   );
      //   if (!listKeywords[i].isRepeat) {
      //   }
      // }
      // else {
      //   console.log("replacements[i]", replacements[i]);
      //   const textToReplace = replacements[i].key;
      //   const arrayKeys = replacements[i].value.split(",");
      //   console.log("arrayKeys", arrayKeys);
      //   const htmlReplaced = trElements.item(0);
      //   console.log("htmlReplaced", htmlReplaced);
      //   let textReplaced = "";
      //   for (const element of arrayKeys) {
      //     textReplaced += htmlReplaced?.outerHTML.replace(
      //       textToReplace,
      //       element
      //     );
      //   }
      //   console.log("textReplaced", textReplaced);
      //   if (tableElements[0]) {
      //     tableElements[0].innerHTML = textReplaced;
      //     resultText = tableElements[0].innerHTML;
      //   }
      // }
      // if(tableElement.includes(tableElement)) {
      // }
      // tableElement.innerHTML.re
    }

    // console.log("resultText", resultText);
    return resultText;
  };

  const renderHtml = (htmlContent: string) => {
    // console.log("htmlContent", htmlContent);
    let result = htmlContent;
    if (listKeywords) {
      result = replaceSymbolByText(htmlContent);
    }
    return result;
  };

  return (
    <StyledComponent>
      <div className="preview">
        <div className="preview__header">
          <div
            className="preview__header-inner"
            style={
              document.body.clientWidth > 1280
                ? { height: previewHeaderHeight }
                : {}
            }
          >
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
              content={() => printElementRef.current}
            />
          </div>
        </div>
        <div className="preview__content printContent" ref={printElementRef}>
          <div
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
