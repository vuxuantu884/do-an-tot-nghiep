import { PrintPreviewModel } from "model/other/Print/print-model";
import React from "react";
import "react-quill/dist/quill.snow.css";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const { htmlContent } = props;
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: htmlContent,
      }}
    ></div>
  );
};

export default Preview;
