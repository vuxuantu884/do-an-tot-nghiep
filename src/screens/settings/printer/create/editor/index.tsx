import { PrintEditorModel } from "model/other/Print/print-model";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Editor: React.FC<PrintEditorModel> = (props: PrintEditorModel) => {
  const { initialValue, onChange } = props;
  const [value, setValue] = useState(initialValue);
  const handleOnChange = (value: string) => {
    setValue(value);
    onChange(value);
  };
  const editorConfig = {
    modules: {
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image", "video"],
        ["clean"],
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      },
    },
    formats: [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "link",
      "image",
      "video",
    ],
    theme: "snow",
  };
  return (
    <div>
      <ReactQuill
        theme={editorConfig.theme}
        value={value}
        onChange={handleOnChange}
        modules={editorConfig.modules}
        formats={editorConfig.formats}
      />
    </div>
  );
};

export default Editor;
