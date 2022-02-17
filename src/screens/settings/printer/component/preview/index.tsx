import { Button, Tooltip } from "antd";
import purify from "dompurify";
import {
  PrintPreviewModel,
  productKeywordsModel,
} from "model/editor/editor.model";
import React, { useEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import IconEdit from "./images/iconEdit.svg";
import IconPrintHover from "./images/iconPrintHover.svg";
import { StyledComponent } from "./styles";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const {
    htmlContent,
    listKeywords,
    listProductKeywords,
    previewHeaderHeight,
    isShowEditor,
    isPrint,
    onChangeShowEditor,
  } = props;
  const printElementRef = useRef(null);
  const checkIfStringContainsOneInArray = (
    text: string,
    arr: productKeywordsModel[]
  ) => {
    let result = false;
    arr.find((single) => {
      if (text.includes(single.value)) {
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
    const replaceKeyword = () => {
      if (listKeywords) {
        let replacementLength = listKeywords.length;
        if (replacementLength > 0) {
          for (let i = 0; i < replacementLength; i++) {
            let singleListKeywords = listKeywords[i].list;
            let singleListKeywordsLength = listKeywords[i].list?.length;
            if (singleListKeywordsLength && singleListKeywordsLength > 0) {
              for (let j = 0; j < singleListKeywordsLength; j++) {
                if (singleListKeywords && singleListKeywords[j].preview_value) {
                  let singleExample = singleListKeywords[j].preview_value;
                  if (singleExample) {
                    resultText = resultText.replaceAll(
                      singleListKeywords[j].value,
                      singleExample
                    );
                  }
                }
              }
            }
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
        // gán lại biến, trường hợp gõ tiếng Việt bị lỗi
        resultText = docFromCkEditor.getElementsByTagName("body")[0].innerHTML;
        let tableElements = docFromCkEditor.getElementsByTagName("table");

        let listProductKeywordsLength = listProductKeywords?.list?.length;
        if (
          listProductKeywords &&
          listProductKeywordsLength &&
          listProductKeywordsLength > 0 &&
          tableElements
        ) {
          let resultTextReplaced = "";
          for (const item of tableElements) {
            let tBodyElements = item.getElementsByTagName("tbody");
            if (!tBodyElements[0]) return "";
            let trElements = tBodyElements[0].getElementsByTagName("tr");
            if (!trElements) return "";
            const trLength = trElements.length;
            let productsChange =
              listProductKeywords.list[0].preview_value_format;
            let numberOfProducts = productsChange?.length;

            if (!numberOfProducts) {
              return;
            }

            // check từng row
            // nếu có thì replace, và thay row bằng kết quả
            for (let i = 0; i < trLength; i++) {
              let resultTextReplacedArray: string[] = [];
              let eachRow = trElements[i].outerHTML;
              if (
                checkIfStringContainsOneInArray(
                  eachRow,
                  listProductKeywords.list
                )
              ) {
                for (let j = 0; j < numberOfProducts; j++) {
                  resultTextReplacedArray[j] = eachRow;
                  for (let k = 0; k < listProductKeywords.list.length; k++) {
                    let textToReplaced = listProductKeywords.list[k].value;
                    let previewValueFormat =
                      listProductKeywords.list[k]?.preview_value_format;
                    if (previewValueFormat) {
                      let textReplaced = previewValueFormat[j];
                      resultTextReplacedArray[j] = resultTextReplacedArray[
                        j
                      ].replaceAll(textToReplaced, textReplaced);
                    }
                  }
                }
                resultTextReplaced = resultTextReplacedArray.join("");
                resultText = resultText.replaceAll(eachRow, resultTextReplaced);
              }
            }
          }
        }
      }
    };

    /**
     * xóa từ lặp {start_loop_product} và {end_loop}
     */
    const removeLoopSpecialCharacter = () => {
      const listHideCharacters = ["{start_loop_product}", "{end_loop}"];
      for (const hideCharacter of listHideCharacters) {
        resultText = resultText.replaceAll(hideCharacter, "");
      }
    };
    replaceKeyword();
    replaceProduct();
    removeLoopSpecialCharacter();
    return resultText;
  };

  const renderHtml = (htmlContent: string) => {
    let result = htmlContent;
    if (listKeywords) {
      result = replaceSymbolByText(htmlContent);
    }
    return result;
  };

  const [hasAlreadyPrint, setHasAlreadyPrint] = useState(false);

  /**
   * case url has param print=true,  print only one time
   */
  useEffect(() => {
    let buttonPrintElement = document.getElementsByClassName(
      "button__print"
    )[0] as HTMLElement;
    if (isPrint && htmlContent && !hasAlreadyPrint) {
      buttonPrintElement.click();
      setHasAlreadyPrint(true);
    }
  }, [hasAlreadyPrint, htmlContent, isPrint]);

  return (
    <StyledComponent>
      <div className={`preview ${isShowEditor ? "showEditor" : "hideEditor"}`}>
        <div className="preview__header">
          <div
            className="preview__header-inner"
            style={
              document.body.clientWidth > 1280 && isShowEditor
                ? { height: previewHeaderHeight }
                : {}
            }
          >
            <div>
              <h3 className="preview__header-title">Bản xem trước</h3>
            </div>
            <div>
              <ReactToPrint
                trigger={() => (
                  <Button className="button__print">
                    <div className="icon">
                      <img
                        src={IconPrintHover}
                        alt=""
                        className="icon--hover"
                      />
                    </div>
                    In thử
                  </Button>
                )}
                content={() => printElementRef.current}
              />
              <Tooltip
                title="Chỉnh sửa"
                color="#FCAF17"
                mouseEnterDelay={0}
                mouseLeaveDelay={0}
                overlayInnerStyle={{ textAlign: "center", padding: "5px 10px" }}
              >
                <img
                  src={IconEdit}
                  alt=""
                  className="iconEdit"
                  onClick={() => onChangeShowEditor(true)}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="preview__content printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              // __html: renderHtml(htmlContent),
              __html: purify.sanitize(renderHtml(htmlContent)),
            }}
          ></div>
        </div>
      </div>
    </StyledComponent>
  );
};

export default Preview;
