import { PrintPreviewModel } from "model/other/Print/print-model";
import React from "react";
import "react-quill/dist/quill.snow.css";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const { htmlContent } = props;
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
  const FAKE_WORDS = {
    ten_cong_ty: "YODY",
    dia_chi_cong_ty: "Hải dương",
  };

  /**
   * https://stackoverflow.com/questions/47794036/replace-with-multiple-value-in-string-typescript
   */
  const replaceSymbolByText = (
    text: string,
    replacements: { [name: string]: string }
  ) => {
    return text.replace(new RegExp("{([A-z]*)}", "g"), (m) => {
      console.log("m", m);
      return replacements[m.substring(1, m.length - 1)];
    });
  };
  // const replaceSymbolByText = (text: string) => {
  //   FAKE_WORDS.forEach((singleWord) => {
  //     text = text.replaceAll(singleWord.symbol, singleWord.value);
  //   });
  //   return text;
  // };
  const renderHtml = (htmlContent: string) => {
    const result = replaceSymbolByText(htmlContent, FAKE_WORDS);
    return result;
  };
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: renderHtml(htmlContent),
      }}
    ></div>
  );
};

export default Preview;
