import { AnyPtrRecord } from "dns";
// import { PrintEditorModel } from "model/other/Print/print-model";
import React, { useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { StyledComponent } from "./styles";

type ToolBarType = {
  onClickRaw: () => void;
  modules?: any;
};
const Editor = (props: any) => {
  const { initialValue, onChange } = props;
  // const [value, setValue] = useState(initialValue);
  const [rawHtml, setRawHtml] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const editor = useRef(undefined);
  const toolbarRef = useRef(null);
  const handleOnChange = (value: string) => {
    console.log("value", value);
    // setValue(value);
    // onChange(value);
  };
  const handleChangeRaw = (html: string) => {
    setRawHtml(html);
  };

  const syncViews = (fromRaw: boolean) => {
    // console.log("editor.getContents()", editor.current.getContents());
    // if (fromRaw) {
    //   setValue(rawHtml);
    // } else {
    //   if (value) {
    //     setRawHtml(value);
    //   }
    // }
  };

  const handleClickShowRaw = () => {
    const isEditingRaw = showRaw;

    setShowRaw(!isEditingRaw);
    syncViews(showRaw);
  };
  const CustomToolbar = ({ onClickRaw }: ToolBarType) => (
    <div id="toolbar">
      <select className="ql-font">
        <option value="arial" selected>
          Arial
        </option>
        <option value="comic-sans">Comic Sans</option>
        <option value="courier-new">Courier New</option>
        <option value="georgia">Georgia</option>
        <option value="helvetica">Helvetica</option>
        <option value="lucida">Lucida</option>
      </select>
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

  const Font = Quill.import("formats/font");
  Font.whitelist = [
    "arial",
    "comic-sans",
    "courier-new",
    "georgia",
    "helvetica",
    "lucida",
  ];
  Quill.register(Font, true);

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
    <StyledComponent>
      <div className={`editor ${showRaw ? "showRaw" : ""}`}>
        <CustomToolbar onClickRaw={handleClickShowRaw} />
        <div className="editor__content">
          <ReactQuill
            theme={editorConfig.theme}
            // value={value}
            onChange={handleOnChange}
            // modules={editorConfig.modules}
            modules={Editor.modules}
            formats={editorConfig.formats}
          />
          <textarea
            className={"raw-editor"}
            onChange={(e) => handleChangeRaw(e.target.value)}
            value={rawHtml}
          />
        </div>
      </div>
    </StyledComponent>
  );
};

Editor.modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {},
  },
};

export default Editor;
