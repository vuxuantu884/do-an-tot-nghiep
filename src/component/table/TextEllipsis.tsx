
type TextConfig = {
  value: string|null
  line?: number;
}; 

const TextEllipsis: React.FC<TextConfig> = (props: TextConfig) => {
  return (
    <div title={`${props.value}`} className="yody-text-ellipsis">
          {props.value}
    </div>
  );
};

export default TextEllipsis;
