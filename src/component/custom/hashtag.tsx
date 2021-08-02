import { Select } from "antd";

type HashTagProps = {
  value?: string;
  onChange?: (result: string) => void;
  placeholder?: string,
};

const HashTag: React.FC<HashTagProps> = (props: HashTagProps) => {
  return (
    <Select
      className="ant-select-hashtag"
      dropdownClassName="ant-select-dropdown-hashtag"
      mode="tags"
      tokenSeparators={[",", " "]}
      value={props.value ? props.value.split(",") : []}
      placeholder={props.placeholder}
      onChange={(value) => {
        let result = value.join(",");
        props.onChange && props.onChange(result);
      }}
    />
  );
};

export default HashTag;
