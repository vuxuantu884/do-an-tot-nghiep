import { CKEditor } from "ckeditor4-react";
import React, { useEffect, useState } from "react";
import EditorModal from "./modal";
import { StyledComponent } from "./styles";

/**
 * keyword is variable, outside component and not use useState: so that Ck editor can read
 * function handleInsertKeyword sets value of keyword
 * hide button class cke_button__inserthtml_label and trigger event click
 */
let keyword = "whatever";
function Editor(props: any) {
  const {
    initialHtmlContent,
    onChange,
    listKeywords,
    selectedPrintSize,
    previewHeaderHeight,
  } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    keyword = text;
    let editorButtonInsertHtml = document.getElementsByClassName(
      "cke_button__inserthtml_label"
    )[0] as HTMLElement;
    editorButtonInsertHtml.click();
  };

  const renderModal = () => {
    let html = null;
    if (isModalVisible) {
      html = (
        <EditorModal
          isModalVisible={isModalVisible}
          handleCancel={handleCancelModal}
          listKeywords={listKeywords}
          insertKeyword={(text) => handleInsertKeyword(text)}
        />
      );
    }
    return html;
  };

  const toolbarElement = document.getElementsByClassName("cke_top")[0] as HTMLElement;

  useEffect(() => {
    const getPreviewHeaderHeight = () => {
      if (toolbarElement) {
        const toolbarHeight = toolbarElement.offsetHeight;
        previewHeaderHeight(toolbarHeight);
      }
    };
    getPreviewHeaderHeight();
  }, [previewHeaderHeight, toolbarElement]);

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
            { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
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

            { name: "colors", items: ["TextColor", "BGColor"] },
            { name: "tools", items: ["Maximize", "ShowBlocks"] },

            {
              name: "editing",
              items: ["Find", "Replace", "-", "SelectAll", "-", "Scayt"],
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
              name: "document",
              items: [
                "-",
                "Save",
                "NewPage",
                "ExportPdf",
                "Preview",
                "Print",
                "-",
                "Templates",
                "Source",
              ],
            },
            { name: "openModalButton", items: ["OpenModalButton"] },
            { name: "openModalButton", items: ["InsertHtml"] },
          ],
          allowedContent: true,

          // remove button to display sup and sub tags
          removeButtons: "Cut,Copy,Paste,Undo,Redo,Anchor",
          // contentsCss: [
          //   "http://cdn.ckeditor.com/4.16.2/full-all/contents.css",
          //   "assets/css/pastefromgdocs.css",
          // ],
          bodyClass: "document-editor",
          extraPlugins:
            "colordialog, tableresize, font, colorbutton, justify, timestamp, dialogadvtab",
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
                  // showModal();
                  let editorButtonShowModal = document.getElementsByClassName(
                    "buttonShowModal"
                  )[0] as HTMLElement;
                  editorButtonShowModal.click();
                },
              });
              editor.ui.addButton("OpenModalButton", {
                label: "Xem danh sách từ khóa",
                command: "openModalDialog",
                toolbar: "insert",
                icon: "https://cdn4.iconfinder.com/data/icons/24x24-free-pixel-icons/24/Clock.png",
              });
              editor.addCommand("insertHtml", {
                exec: function (editor: any) {
                  editor.insertHtml(keyword);
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
      <button className="buttonShowModal" onClick={showModal} style={{ display: "none" }}>
        showModal
      </button>
      {renderModal()}
    </StyledComponent>
  );
}

export default Editor;
