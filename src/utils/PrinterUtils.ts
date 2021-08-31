import { listKeywordsModel, productKeywordsModel } from "model/editor/editor.model";

export const checkIfStringContainsOneInArray = (
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
  export const replaceSymbolByText = (text: string, listKeywords: listKeywordsModel[] | undefined, listProductKeywords: {
    name: string;
    list: productKeywordsModel[];
} | undefined) => {
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
        let tableElements = docFromCkEditor.getElementsByTagName("table");
        // console.log("tableElements", tableElements);

        let listProductKeywordsLength = listProductKeywords?.list?.length;
        // console.log("listProductKeywordsLength", listProductKeywordsLength);
        if (
          listProductKeywords &&
          listProductKeywordsLength &&
          listProductKeywordsLength > 0 &&
          tableElements
        ) {
          let resultTextReplaced = "";
          // let textReplaced = "";
          for (const item of tableElements) {
            // console.log("2222222222222222222");
            let tBodyElements = item.getElementsByTagName("tbody");
            if (!tBodyElements[0]) return "";
            let trElements = tBodyElements[0].getElementsByTagName("tr");
            if (!trElements) return "";
            const trLength = trElements.length;
            let productsChange =
              listProductKeywords.list[0].preview_value_format;
            // console.log("productsChange", productsChange);
            let numberOfProducts = productsChange?.length;

            if (!numberOfProducts) {
              return;
            }

            // check từng row
            // nếu có thì replace, và thay row bằng kết quả
            for (let i = 0; i < trLength; i++) {
              let resultTextReplacedArray: string[] = [];
              let eachRow = trElements[i].outerHTML;
              // console.log("eachRow", eachRow);
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
                      // console.log("textToReplaced", textToReplaced);
                      resultTextReplacedArray[j] = resultTextReplacedArray[
                        j
                      ].replaceAll(textToReplaced, textReplaced);
                    }
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


  export const renderHtml = (htmlContent: string, listKeywords: listKeywordsModel[] | undefined,listProductKeywords: {
    name: string;
    list: productKeywordsModel[];
} | undefined ) => {
    // console.log("htmlContent", htmlContent);
    let result = htmlContent;
    if (listKeywords) {
      result = replaceSymbolByText(htmlContent,listKeywords, listProductKeywords );
      // console.log("htmlContent", htmlContent);
      // console.log("result", result);
    }
    return result;
  };