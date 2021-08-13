import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
// import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
// import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
// import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
// import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";

import React from "react";
import "react-quill/dist/quill.snow.css";
import { StyledComponent } from "./styles";

const CkEditor = (props: any) => {
  const { initialValue, onChange } = props;
  let atoolbar = [
		{ name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'ExportPdf', 'Preview', 'Print', '-', 'Templates' ] },
		{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
		{ name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
		{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
		'/',
		{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
		{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
		{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
		{ name: 'insert', items: [ 'Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
		'/',
		{ name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
		{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
		{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
		{ name: 'about', items: [ 'About' ] }
	];
  let toolbar2 =[ 'bold', 'italic', 'link', 'undo', 'redo', 'numberedList', 'bulletedList' ]
  const editorConfiguration = {
    // toolbar: toolbar2,
    toolbar: {
      items: [
        { name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'ExportPdf', 'Preview', 'Print', '-', 'Templates' ] },
          'heading', '|',
          'alignment', '|',
          'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
          'link', '|',
          'bulletedList', 'numberedList', 'todoList',
          '-', // break point
          'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', '|',
          'code', 'codeBlock', '|',
          'insertTable', '|',
          'outdent', 'indent', '|',
          'uploadImage', 'blockQuote', '|',
          'undo', 'redo'
      ],
      shouldNotGroupWhenFull: true
  }
    // toolbar: [
    //   {
    //     name: "document",
    //     items: [
    //       "Source",
    //       "-",
    //       "Save",
    //       "NewPage",
    //       "ExportPdf",
    //       "Preview",
    //       "Print",
    //       "-",
    //       "Templates",
    //     ],
    //   },
    //   {
    //     name: "clipboard",
    //     items: [
    //       "Cut",
    //       "Copy",
    //       "Paste",
    //       "PasteText",
    //       "PasteFromWord",
    //       "-",
    //       "Undo",
    //       "Redo",
    //     ],
    //   },
    //   {
    //     name: "editing",
    //     items: ["Find", "Replace", "-", "SelectAll", "-", "Scayt"],
    //   },
    //   {
    //     name: "forms",
    //     items: [
    //       "Form",
    //       "Checkbox",
    //       "Radio",
    //       "TextField",
    //       "Textarea",
    //       "Select",
    //       "Button",
    //       "ImageButton",
    //       "HiddenField",
    //     ],
    //   },
    //   "/",
    //   {
    //     name: "basicstyles",
    //     items: [
    //       "Bold",
    //       "Italic",
    //       "Underline",
    //       "Strike",
    //       "Subscript",
    //       "Superscript",
    //       "-",
    //       "CopyFormatting",
    //       "RemoveFormat",
    //     ],
    //   },
    //   {
    //     name: "paragraph",
    //     items: [
    //       "NumberedList",
    //       "BulletedList",
    //       "-",
    //       "Outdent",
    //       "Indent",
    //       "-",
    //       "Blockquote",
    //       "CreateDiv",
    //       "-",
    //       "JustifyLeft",
    //       "JustifyCenter",
    //       "JustifyRight",
    //       "JustifyBlock",
    //       "-",
    //       "BidiLtr",
    //       "BidiRtl",
    //       "Language",
    //     ],
    //   },
    //   { name: "links", items: ["Link", "Unlink", "Anchor"] },
    //   {
    //     name: "insert",
    //     items: [
    //       "Image",
    //       "Flash",
    //       "Table",
    //       "HorizontalRule",
    //       "Smiley",
    //       "SpecialChar",
    //       "PageBreak",
    //       "Iframe",
    //     ],
    //   },
    //   "/",
    //   { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
    //   { name: "colors", items: ["TextColor", "BGColor"] },
    //   { name: "tools", items: ["Maximize", "ShowBlocks"] },
    //   { name: "about", items: ["About"] },
    // ],
  };
  return (
    <StyledComponent>
      <CKEditor
        editor={ClassicEditor}
        config={editorConfiguration}
        // config={toolbar2}
        data="<p>Hello from CKEditor 5!</p>"
        onReady={(editor: any) => {
          // You can store the "editor" and use when it is needed.
          console.log("Editor is ready to use!", editor);
        }}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          console.log({ event, editor, data });
          onChange(data);
        }}
        onBlur={(editor: any) => {
          console.log("Blur.", editor);
        }}
        onFocus={(editor: any) => {
          console.log("Focus.", editor);
        }}
      />
    </StyledComponent>
  );
};

export default CkEditor;
