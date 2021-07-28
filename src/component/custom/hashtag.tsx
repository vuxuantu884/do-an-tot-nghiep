import { Select } from "antd";

type HashTagProps = {
  value?: string
  onChange?: (result: string) => void
}

const HashTag: React.FC<HashTagProps> = (props: HashTagProps) => {
  
  return (
    <Select
      className="ant-select-hashtag"
      dropdownClassName="ant-select-dropdown-hashtag"
      mode="tags"
      value={props.value ? props.value.split(',') : []}
      placeholder="Nhập từ khóa"
      onChange={(value) => {
        let result = value.join(',');
        props.onChange && props.onChange(result);
      }}
    />
  );
};

export default HashTag;
