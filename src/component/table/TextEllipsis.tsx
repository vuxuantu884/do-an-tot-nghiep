import { ReactNode } from "react";

type TextConfig = {
  value: string | null;
  line?: number;
  children?: ReactNode;
};

const TextEllipsis: React.FC<TextConfig> = (props: TextConfig) => {
  return (
    <div
      title={props.value ?? ""}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: props.line ?? 4,
        WebkitBoxOrient: "vertical",
      }}
    >
      {props.value}
      {props.children}
    </div>
  );
};

export default TextEllipsis;
