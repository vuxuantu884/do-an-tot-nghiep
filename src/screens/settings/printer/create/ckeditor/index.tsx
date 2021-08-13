import { CKEditor } from "ckeditor4-react";
import React from "react";

type EditorType = {
  initialHtmlContent: string;
  onChange: (data: string) => void;
};

function Editor(props: EditorType) {
  const { initialHtmlContent, onChange } = props;
  const handleChange = (evt: any) => {
    onChange(evt.editor.getData());
  };
  return (
    <div>
      <CKEditor
        initData={initialHtmlContent}
        config={{
          toolbar: [
            {
              name: "document",
              items: [
                "Source",
                "-",
                "Save",
                "NewPage",
                "ExportPdf",
                "Preview",
                "Print",
                "-",
                "Templates",
              ],
            },
            {
              name: "clipboard",
              items: [
                "Cut",
                "Copy",
                "Paste",
                "PasteText",
                "PasteFromWord",
                "-",
                "Undo",
                "Redo",
              ],
            },
            {
              name: "editing",
              items: ["Find", "Replace", "-", "SelectAll", "-", "Scayt"],
            },
            {
              name: "forms",
              items: [
                "Form",
                "Checkbox",
                "Radio",
                "TextField",
                "Textarea",
                "Select",
                "Button",
                "ImageButton",
                "HiddenField",
              ],
            },
            "/",
            {
              name: "basicstyles",
              items: [
                "Bold",
                "Italic",
                "Underline",
                "Strike",
                "Subscript",
                "Superscript",
                "-",
                "CopyFormatting",
                "RemoveFormat",
              ],
            },
            {
              name: "paragraph",
              items: [
                "NumberedList",
                "BulletedList",
                "-",
                "Outdent",
                "Indent",
                "-",
                "Blockquote",
                "CreateDiv",
                "-",
                "JustifyLeft",
                "JustifyCenter",
                "JustifyRight",
                "JustifyBlock",
                "-",
                "BidiLtr",
                "BidiRtl",
                "Language",
              ],
            },
            { name: "links", items: ["Link", "Unlink", "Anchor"] },
            {
              name: "insert",
              items: [
                "Image",
                "Flash",
                "Table",
                "HorizontalRule",
                "Smiley",
                "SpecialChar",
                "PageBreak",
                "Iframe",
              ],
            },
            "/",
            { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
            { name: "colors", items: ["TextColor", "BGColor"] },
            { name: "tools", items: ["Maximize", "ShowBlocks"] },
            { name: "about", items: ["About"] },
          ],
          extraPlugins: "colordialog,tableresize",
        }}
        onChange={handleChange}
      />
    </div>
  );
}

export default Editor;
