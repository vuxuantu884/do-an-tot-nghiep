import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type CustomEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const CustomEditor: React.FC<CustomEditorProps> = (props: CustomEditorProps) => {
  const { value, onChange, disabled } = props;
  return (
    <ReactQuill
      readOnly={disabled}
      theme="snow"
      modules={{
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          [{ color: [] }],
          [{ background: [] }],
          [{ align: [] }],
          ["link"],
        ],
        clipboard: {
          matchVisual: false,
        },
      }}
      formats={[
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
        "align",
        "color",
        "background",
      ]}
      value={value}
      onChange={(content, delta, source, editor) => {
        onChange && onChange(content);
      }}
    />
  );
};

export default CustomEditor;
