import { Button } from "antd";
import {
  listKeywordsModel,
  PrintPreviewModel,
  productKeywordsModel,
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
  // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  const checkIfStringContainsOneInArray = (
    text: string,
    arr: productKeywordsModel[]
  ) => {
    let result = false;
    arr.find((single) => {
      if (text.includes(single.key)) {
        result = true;
      }
      return "";
    });
    return result;
  };
  /**
   * từ string html trả về, tạo dom
   * lặp từng table
   * trong table, lặp tr xem có chứa từ khóa về sản phẩm, nếu có thì thay
   *
   */
  const replaceSymbolByText = (text: string) => {
    let resultText = text;
    // console.log("resultText", resultText);
    const replaceKeyword = () => {
      if (listKeywords) {
        let replacementLength = listKeywords.length;
        if (replacementLength > 0) {
          for (let i = 0; i < replacementLength; i++) {
            resultText = resultText.replaceAll(
              listKeywords[i].key,
              listKeywords[i].value
            );
          }
        }
      }
    };
    const replaceProduct = () => {
      const docFromCkEditor = new DOMParser().parseFromString(
        resultText,
        // "text/xml"
        "text/html"
      );
      if (docFromCkEditor) {
        let tableElements = docFromCkEditor.getElementsByTagName("table");
        // console.log("tableElements", tableElements);

        let listProductKeywordsLength = listProductKeywords?.length;
        if (
          listProductKeywords &&
          listProductKeywordsLength &&
          listProductKeywordsLength > 0
        ) {
          let resultTextReplaced = "";
          // let textReplaced = "";
          for (const item of tableElements) {
            let tBodyElements = item.getElementsByTagName("tbody");
            let trElements = tBodyElements[0].getElementsByTagName("tr");
            const trLength = trElements.length;
            let productsChange = listProductKeywords[0].value;
            let numberOfProducts = productsChange.length;

            // check từng row
            // nếu có thì replace, và thay row bằng kết quả
            for (let i = 0; i < trLength; i++) {
              let resultTextReplacedArray: string[] = [];
              let eachRow = trElements[i].outerHTML;
              // console.log("eachRow", eachRow);
              if (
                checkIfStringContainsOneInArray(eachRow, listProductKeywords)
              ) {
                for (let j = 0; j < numberOfProducts; j++) {
                  resultTextReplacedArray[j] = eachRow;
                  for (let k = 0; k < listProductKeywords.length; k++) {
                    let textToReplaced = listProductKeywords[k].key;
                    let textReplaced = listProductKeywords[k].value[j];
                    // console.log("textToReplaced", textToReplaced);
                    resultTextReplacedArray[j] = resultTextReplacedArray[
                      j
                    ].replaceAll(textToReplaced, textReplaced);
                  }
                }
                resultTextReplaced = resultTextReplacedArray.join("");
                // console.log("resultTextReplaced", resultTextReplaced);
                resultText = resultText.replaceAll(eachRow, resultTextReplaced);
              }
            }
          }
        }
      }
    };
    replaceKeyword();
    replaceProduct();
    return resultText;
  };

  const renderHtml = (htmlContent: string) => {
    // console.log("htmlContent", htmlContent);
    let result = htmlContent;
    if (listKeywords) {
      result = replaceSymbolByText(htmlContent);
      // console.log("htmlContent", htmlContent);
      // console.log("result", result);
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
        <div
          className="preview__content printContent 222"
          id="1111"
          ref={printElementRef}
        >
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
