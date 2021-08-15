import { CKEditor } from "ckeditor4-react";
import React, { useState } from "react";
import EditorModal from "../editor/modal";
import { StyledComponent } from "./styles";

function Editor(props: any) {
  const { initialHtmlContent, onChange, listKeyWords } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyword, setKeyword] = useState("333");

  const handleChange = (evt: any) => {
    onChange(evt.editor.getData());
  };
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const handleInsertKeyword = (text: string) => {
    console.log("text", text);
    setKeyword(text);
    let editor = document.getElementsByClassName(
      "cke_button__inserthtml_label"
    )[0] as HTMLElement;
    console.log("keyword33", keyword);
    // setTimeout(() => {
    //   editor.click();
    // }, 1000);
    console.log("click");
    editor.click();
  };
  const handleFocus = () => {
    setTimeout(() => {
      console.log("keyword44", keyword);
    }, 1000);
  };

  return (
    <StyledComponent>
      <CKEditor
        name="editorName"
        initData={initialHtmlContent}
        onChnage={handleFocus}
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
            { name: "openModalButton", items: ["InsertHtml"] },
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
                  showModal();
                },
              });
              editor.ui.addButton("OpenModalButton", {
                label: "Xem chi tiết",
                command: "openModalDialog",
                toolbar: "insert",
                icon: "https://cdn4.iconfinder.com/data/icons/24x24-free-pixel-icons/24/Clock.png",
              });
              editor.addCommand("insertHtml", {
                exec: function (editor: any) {
                  setKeyword("111");
                  setTimeout(() => {
                    editor.insertHtml(keyword);
                    console.log("keyword", keyword);
                    editor.focus();
                  }, 1500);
                },
              });
              editor.ui.addButton("InsertHtml", {
                label: "Insert html",
                command: "insertHtml",
                toolbar: "insert",
                icon: "https://cdn4.iconfinder.com/data/icons/24x24-free-pixel-icons/24/Clock.png",
              });
            },
          });
        }}
        onChange={handleChange}
      />
      <EditorModal
        isModalVisible={isModalVisible}
        handleCancel={handleCancelModal}
        listKeyWords={listKeyWords}
        insertKeyword={(text) => handleInsertKeyword(text)}
      />
    </StyledComponent>
  );
}

export default Editor;
