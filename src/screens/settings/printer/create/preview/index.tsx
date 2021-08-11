import { PrintPreviewModel } from "model/other/Print/print-model";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Preview: React.FC<PrintPreviewModel> = (props: PrintPreviewModel) => {
  const { htmlContent } = props;
  return <div>{htmlContent}</div>;
};

export default Preview;
