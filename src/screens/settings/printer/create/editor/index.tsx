import { PrintEditorModel } from "model/other/Print/print-model";
import React, { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type ToolBarType = {
  onClickRaw: () => void;
};
const Editor: React.FC<PrintEditorModel> = (props: PrintEditorModel) => {
  const { initialValue, onChange } = props;
  const [value, setValue] = useState(initialValue);
  const [rawHtml, setRawHtml] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const toolbarRef = useRef(null);
  const handleOnChange = (value: string) => {
    setValue(value);
    onChange(value);
  };
  const handleChangeRaw = (html: string) => {
    setRawHtml(html);
  };

  const syncViews = (fromRaw: boolean) => {
    if (fromRaw) {
      setValue(rawHtml);
    } else {
      if (value) {
        setRawHtml(value);
      }
    }
  };

  const handleClickShowRaw = () => {
    setShowRaw(!showRaw);
    syncViews(showRaw);
  };
  const CustomToolbar: React.FC<ToolBarType> = ({
    onClickRaw,
  }: ToolBarType) => (
    <div id="toolbar">
      <select className="ql-header">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
      </select>
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <select className="ql-color">
        <option value="red"></option>
        <option value="green"></option>
        <option value="blue"></option>
        <option value="orange"></option>
        <option value="violet"></option>
        <option value="#d0d1d2"></option>
      </select>
      <button onClick={onClickRaw}>Raw</button>
    </div>
  );
  const editorConfig = {
    modules: {
      toolbar: {
        container: "#toolbar",
        handlers: {},
      },
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
      "color",
    ],
    theme: "snow",
  };

  return (
    <div>
      <CustomToolbar onClickRaw={handleClickShowRaw} />
      <ReactQuill
        theme={editorConfig.theme}
        value={value}
        onChange={handleOnChange}
        modules={editorConfig.modules}
        formats={editorConfig.formats}
      />
      <textarea
        className={"raw-editor"}
        onChange={(e) => handleChangeRaw(e.target.value)}
        value={rawHtml}
      />
    </div>
  );
};

export default Editor;
