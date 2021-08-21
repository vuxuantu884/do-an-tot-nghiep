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
    let editorElement = document.getElementById("1111");
    if (editorElement) {
      let tableElements = editorElement.getElementsByTagName("table");
      console.log("editorElement", editorElement);
      console.log("tableElements", tableElements);

      let listKeywordLength = listKeywords?.length;
      let listProductKeywordsLength = listProductKeywords?.length;

      if (
        listProductKeywords &&
        listProductKeywordsLength &&
        listProductKeywordsLength > 0
      ) {
        let result = "";
        let bbb = "";
        let textReplaced = "";
        for (const item of tableElements) {
          let tBodyElements = item.getElementsByTagName("tbody");
          let trElements = tBodyElements[0].getElementsByTagName("tr");
          console.log("trElements", trElements);
          let numberOfProducts = listProductKeywords[0].value.split(",").length;
          console.log("numberOfProducts", numberOfProducts);
          let aaa: string[] = [];

          // mỗi số lượng sản phẩm trả về 1 row
          for (let i = 0; i < numberOfProducts; i++) {
            let eachRow = trElements[0].outerHTML;
            for (const value of listProductKeywords) {
              console.log("value", value);
              textReplaced = value.value.split(", ")[i];
              console.log("value.key", value.key);
              console.log("textReplaced", textReplaced);
              console.log("eachRow1", eachRow);
              eachRow = eachRow.replaceAll(value.key, textReplaced);
              console.log("eachRow2", eachRow);
              eachRow.replaceAll(/\t/g, "");
              eachRow.replaceAll(/\n/g, "");
            }
            aaa[i] = eachRow;

            // // result=trElements[0].innerHTML.replaceAll()
          }
          console.log("aaa", aaa);
          bbb = aaa.join("");
          let ccc = item.outerHTML.replaceAll(trElements[0].outerHTML, bbb);
          console.log("ccc", ccc);
          resultText = resultText.replaceAll(item.outerHTML, ccc);
        }
      }
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
