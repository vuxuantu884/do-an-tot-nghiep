import { CKEditor } from "ckeditor4-react";
import React, { useState } from "react";
import EditorModal from "./modal";
import { StyledComponent } from "./styles";

/**
 * keyword is variable, outside component and not use useState: so that Ck editor can read
 * function handleInsertKeyword sets value of keyword
 * hide button class cke_button__inserthtml_label and trigger event click
 */
let keyword = "whatever";
function Editor(props: any) {
  const { initialHtmlContent, onChange, listKeyWords, selectedPrintSize } =
    props;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleChange = (evt: any) => {
    // console.log("change");
    onChange(evt.editor.getData());
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };
  console.log("sg");

  const handleInsertKeyword = (text: string) => {
    // console.log("text", text);
    keyword = text;
    let editor = document.getElementsByClassName(
      "cke_button__inserthtml_label"
    )[0] as HTMLElement;
    editor.click();
  };
  console.log("initialHtmlContent", initialHtmlContent);
  return (
    <StyledComponent>
      {/* use key to change value */}
      <CKEditor
        key={selectedPrintSize}
        name="editorName"
        // initData={initialHtmlContent}
        onInstanceReady={(event) => {
          event.editor.setData(initialHtmlContent);
        }}
        onChange={handleChange}
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
            // "/",
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
         * use onNamespaceLoaded to fix  error
         */
        // onBeforeLoad={(CKEDITOR: any) => {
        onNamespaceLoaded={(CKEDITOR: any) => {
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
                  // console.log("keyword", keyword);
                  editor.insertHtml(keyword);
                  console.log("initialHtmlContent", initialHtmlContent);
                  setTimeout(() => {
                    editor.focus();
                  }, 500);
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
