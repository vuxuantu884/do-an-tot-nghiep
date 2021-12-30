import { useMemo, useState } from "react";
import { StyledHashTag } from "component/custom/StyledCustomComponent";
import { Input, Tag, Tooltip } from "antd";

type HashTagProps = {
  value?: string;
  onChange?: (result: string) => void;
  placeholder?: string;
};

const HashTag: React.FC<HashTagProps> = (props: HashTagProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [border, setBorder] = useState<boolean>(false);

  const handleChange = (e: any) => {
    if (e.target.value === ",") return;
    setInputValue(e.target.value);
  };

  const listTag = useMemo(() => {
    if (props.value) {
      return props.value.split(",");
    }
    return [];
  }, [props.value]);
  const handleKeyDown = (e: any) => {
    let _tags = [...listTag];
    if (
      (e.which === 13 && inputValue !== "") ||
      (e.which === 188 && inputValue !== "")
    ) {
      _tags.push(inputValue);
      setInputValue("");
    }
    if (e.which === 8 && inputValue === "") {
      _tags.pop();
    }
    props.onChange && props.onChange(_tags.join(","));
  };

  const handleDelete = (index: number) => {
    let _tags = [...listTag];
    _tags.splice(index, 1);
    props.onChange && props.onChange(_tags.join(","));
  };


  return (
    <StyledHashTag>
      <div
        className="custom-tags"
        onFocus={() => setBorder(true)}
        onBlur={() => setBorder(false)}
        style={
          border
            ? { border: "1px solid #2a2a86" }
            : { border: "1px solid #d9d9d9" }
        }
      >
        <div className={listTag?.length ? "tags-list" : ""}>
          {listTag.map((tag, index) => {
            const isLongTag = tag.length > 20;
            const tagElem = (
              <Tag
                key={tag}
                closable
                onClose={() => handleDelete(index)}
              >
                <span>
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </span>
              </Tag>
            );

            return isLongTag ? (
              <Tooltip title={tag} key={tag}>
                {tagElem}
              </Tooltip>
            ) : (
              tagElem
            );
          })}
        </div>
        
        <Input
          maxLength={250}
          value={inputValue}
          type="text"
          placeholder="Thêm tags"
          onChange={(e) => handleChange(e)}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </div>
    </StyledHashTag>
  );
};

export default HashTag;
