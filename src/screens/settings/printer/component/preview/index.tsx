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
  const checkIfStringContainsOneInArray = (
    text: string,
    arr: listKeywordsModel
  ) => {
    let result = false;
    arr.find((single) => {
      // console.log("text", text);
      // console.log("single", single);
      if (text.includes(single.key)) {
        result = true;
      }
      return "";
    });
    return result;
  };
  const replaceSymbolByText = (text: string) => {
    let resultText = text;
    console.log("resultText", resultText);
    var docFromCkEditor = new DOMParser().parseFromString(
      resultText,
      // "text/xml"
      "text/html"
    );
    console.log("docFromCkEditor", docFromCkEditor);
    if (docFromCkEditor) {
      let tableElements = docFromCkEditor.getElementsByTagName("table");
      console.log("tableElements", tableElements);
      // console.log("editorElement", editorElement);
      // console.log("tableElements", tableElements);

      let listProductKeywordsLength = listProductKeywords?.length;
      if (
        listProductKeywords &&
        listProductKeywordsLength &&
        listProductKeywordsLength > 0
      ) {
        let bbb = "";
        // let textReplaced = "";
        for (const item of tableElements) {
          let tBodyElements = item.getElementsByTagName("tbody");
          let trElements = tBodyElements[0].getElementsByTagName("tr");
          const trLength = trElements.length;
          let hadChanged = false;
          let productsChange = listProductKeywords[0].value;
          let numberOfProducts = productsChange.length;

          // check từng row
          // nếu có thì replace, và thay row bằng kết quả
          for (let i = 0; i < trLength; i++) {
            let aaa: string[] = [];
            let eachRow = trElements[i].outerHTML;
            // console.log("eachRow", eachRow);
            if (checkIfStringContainsOneInArray(eachRow, listProductKeywords)) {
              hadChanged = true;
              for (let j = 0; j < numberOfProducts; j++) {
                aaa[j] = eachRow;
                for (let k = 0; k < listProductKeywords.length; k++) {
                  let textToReplaced = listProductKeywords[k].key;
                  let textReplaced = listProductKeywords[k].value[j];
                  // console.log("textToReplaced", textToReplaced);
                  aaa[j] = aaa[j].replaceAll(textToReplaced, textReplaced);
                }
                // console.log("ddd", ddd);
                // console.log("value", value);
                // let textToReplaced = listProductKeywords[i].key;
                // let textReplaced = listProductKeywords[i].value;
                // console.log("value.key", value.key);
                // console.log("textToReplaced", textToReplaced);
                // console.log("textReplaced", textReplaced);
                // aaa[j] = aaa[j].replaceAll(value.key, textReplaced);
                let abc = aaa[j];

                // console.log("eachRow2", eachRow);
                // aaa[i] = eachRow;
                // abc = abc.replaceAll(value.key, textReplaced);
                // for (let k = 0; k < listProductKeywords.length; k++) {
                //   const element = array[k];

                // }
                // eachRow = eachRow.replaceAll(value.key, textReplaced);
                // console.log("eachRow2", eachRow);
                // trElements[i].outerHTML.replaceAll(value.key, textReplaced);
              }
              // for (const value of listProductKeywords) {
              //   console.log("value", value);
              //   textReplaced = value.value.split(", ")[i];
              //   // console.log("value.key", value.key);
              //   console.log("textReplaced", textReplaced);
              //   aaa[i] = aaa[i].replaceAll(value.key, textReplaced);
              //   // console.log("eachRow2", eachRow);
              //   // aaa[i] = eachRow;
              //   console.log("aaa[i]", aaa[i]);
              //   // eachRow = eachRow.replaceAll(value.key, textReplaced);
              //   // console.log("eachRow2", eachRow);
              //   // trElements[i].outerHTML.replaceAll(value.key, textReplaced);
              // }
              bbb = aaa.join("");
              console.log("bbb", bbb);
              // let ccc = item.outerHTML.replaceAll(trElements[i].outerHTML, bbb);
              // console.log("ccc", ccc);
              // resultText = resultText.replaceAll(item.outerHTML, ccc);
              resultText = resultText.replaceAll(eachRow, bbb);
            } else {
              hadChanged = false;
            }

            // // result=trElements[0].innerHTML.replaceAll()
            // console.log("hadChanged", hadChanged);
            // if (hadChanged) {
            //   console.log("aaa", aaa);
            // }
          }
        }
      }
      // resultText = editorElement.innerHTML;
    }
    // console.log("resultText333", resultText);
    // if (listKeywords && listKeywordLength && listKeywordLength > 0) {
    //   for (let i = 0; i < listKeywordLength; i++) {
    //     resultText = resultText.replaceAll(
    //       listKeywords[i].key,
    //       listKeywords[i].value
    //     );
    //     if (!listKeywords[i].isRepeat) {
    //     }
    //   }
    //   // else {
    //   //   console.log("replacements[i]", replacements[i]);
    //   //   const textToReplace = replacements[i].key;
    //   //   const arrayKeys = replacements[i].value.split(",");
    //   //   console.log("arrayKeys", arrayKeys);
    //   //   const htmlReplaced = trElements.item(0);
    //   //   console.log("htmlReplaced", htmlReplaced);
    //   //   let textReplaced = "";
    //   //   for (const element of arrayKeys) {
    //   //     textReplaced += htmlReplaced?.outerHTML.replace(
    //   //       textToReplace,
    //   //       element
    //   //     );
    //   //   }
    //   //   console.log("textReplaced", textReplaced);
    //   //   if (tableElements[0]) {
    //   //     tableElements[0].innerHTML = textReplaced;
    //   //     resultText = tableElements[0].innerHTML;
    //   //   }
    //   // }
    //   // if(tableElement.includes(tableElement)) {

    //   // }
    //   // tableElement.innerHTML.re
    // }

    // console.log("resultText", resultText);
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
              //   __html: `<table><tbody>
              //   <tr>
              //     <td>{sản phẩm 1}</td>
              //     <td>{100}</td>
              //     <td>{xanh}</td>
              //   </tr><tr>
              //     <td>{sản phẩm 2}</td>
              //     <td>{200}</td>
              //     <td>{vàng}</td>
              //   </tr>
              // </tbody></table>`,
            }}
          ></div>
        </div>
      </div>
    </StyledComponent>
  );
};

export default Preview;
