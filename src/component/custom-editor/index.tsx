import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./editor.scss";

type CustomEditorProps = {
  value?: EditorState
  onChange?: (value: EditorState) => void
}

const CustomEditor: React.FC<CustomEditorProps> = (props: CustomEditorProps) => {
  return (
    <Editor
      editorState={props.value}
      onEditorStateChange={props.onChange}
      toolbarClassName="toolbarClassName"
      wrapperClassName="wrapperClassName"
      editorClassName="editor"
    />
  )
}

export default CustomEditor;