import { useEffect, useState } from "react";
import { StyledHashTag } from "component/custom/StyledCustomComponent";
import { Input, Tooltip } from "antd";
import xCloseBtn from "assets/icon/X_close.svg";

type HashTagProps = {
  value?: string;
  onChange?: (result: string) => void;
  placeholder?: string;
};

const HashTag: React.FC<HashTagProps> = (props: HashTagProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [border, setBorder] = useState<boolean>(false);
  const [tagList, setTagList] = useState<Array<any>>([]);

  useEffect(() => {
    let newTags: Array<any> = [];
    if (props.value) {
      newTags = props.value.split(",");
    }
    setTagList(newTags);
  }, [props.value]);

  const handleChange = (e: any) => {
    if (e.target.value === ",") return;
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: any) => {
    let _tags = [...tagList];
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
    let _tags = [...tagList];
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
        <div className={tagList?.length ? "tags-list" : ""}>
          {tagList.map((tag, index) => {
            const isLongTag = tag.length > 20;
            const tagElem = (
              <span key={index} className="tag">
                <span>{isLongTag ? `${tag.slice(0, 20)}...` : tag}</span>
                <img alt="" onClick={() => handleDelete(index)} src={xCloseBtn} />
              </span>
            );

            return isLongTag ? (
              <Tooltip title={tag} key={index}>
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
