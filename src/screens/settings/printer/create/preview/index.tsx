import { PrintPreviewModel } from "model/other/Print/print-model";
import React from "react";
import "react-quill/dist/quill.snow.css";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const { htmlContent } = props;
  const FAKE_WORDS = [
    {
      symbol: "{ten_cong_ty}",
      value: "YODY",
    },
    {
      symbol: "{dia_chi_cong_ty}",
      value: "Hải dương",
    },
  ];
  const renderHtml = (htmlContent: string) => {
    let result = "";
    FAKE_WORDS.forEach((singleWord) => {
      result = htmlContent.replaceAll(singleWord.symbol, singleWord.value);
    });
    console.log("result", result);
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
