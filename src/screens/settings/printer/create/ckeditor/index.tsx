import { CKEditor } from "ckeditor4-react";
import React from "react";
import { StyledComponent } from "./styles";

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
    <StyledComponent>
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
            { name: "openModalButton", items: ["OpenModalButton"] },
          ],
          // remove button to display sup and sub tags
          removeButtons: "Cut,Copy,Paste,Undo,Redo,Anchor",
          contentsCss: [
            "http://cdn.ckeditor.com/4.16.2/full-all/contents.css",
            "assets/css/pastefromgdocs.css",
          ],
          bodyClass: "document-editor",
          extraPlugins:
            "colordialog, tableresize, font, colorbutton, justify, timestamp",
        }}
        /**
         * https://stackoverflow.com/questions/65339020/how-to-add-custom-plugin-in-ckeditor4-react
         */
        onBeforeLoad={(CKEDITOR: any) => {
          CKEDITOR.plugins.add("timestamp", {
            init: function (editor: any) {
              editor.addCommand("openModalDialog", {
                exec: function (editor: any) {
                  var now = new Date();
                  editor.insertHtml(
                    "The current date and time is: <em>" +
                      now.toString() +
                      "</em>"
                  );
                },
              });
              editor.ui.addButton("OpenModalButton", {
                label: "Xem chi tiết",
                command: "openModalDialog",
                toolbar: "insert",
                icon: "https://cdn4.iconfinder.com/data/icons/24x24-free-pixel-icons/24/Clock.png",
              });
            },
          });
        }}
        onChange={handleChange}
      />
    </StyledComponent>
  );
}

export default Editor;
