import React, { useState } from "react";
import xCloseBtn from "assets/icon/X_close.svg";

type CustomInputTagsProps = {
  onChangeTag: (value: any) => void;
  tags?: string;
  isCloneOrder?: boolean;
};

const CustomeInputTags: React.FC<CustomInputTagsProps> = (
  props: CustomInputTagsProps
) => {
  const { tags, isCloneOrder } = props;
  const [inputValue, setInputValue] = useState<string>("");
  const [border, setBorder] = useState<boolean>(false);
  let tagsArr = tags?.split(",");
  const handleChange = (e: any) => {
    if (e.target.value === ",") return;
    setInputValue(e.target.value);
  };
  const handleKeyDown = (e: any) => {
    let _tags = isCloneOrder && tagsArr ? [...tagsArr] : [];
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
    props.onChangeTag(_tags);
  };

  const handleDelete = (index: number) => {
    let _tags = isCloneOrder && tagsArr ? [...tagsArr] : [];
    _tags.splice(index, 1);
    props.onChangeTag(_tags);
  };

  return (
    <div
      onFocus={() => setBorder(true)}
      onBlur={() => setBorder(false)}
      className="orders-screen-custom-tags"
      style={
        border
          ? { border: "1px solid #2a2a86" }
          : { border: "1px solid #d9d9d9" }
      }
    >
      {tags &&
        tagsArr &&
        tagsArr?.length > 0 &&
        tagsArr.map((tag, index) => (
          <div key={index}>
            <span>{tag}</span>
            <img
              alt=""
              onClick={() => handleDelete(index)}
              src={xCloseBtn}
            ></img>
          </div>
        ))}

      <input
        maxLength={250}
        value={inputValue}
        type="text"
        placeholder={tagsArr && tagsArr.length > 0 ? "" : "Thêm tags"}
        onChange={(e) => handleChange(e)}
        onKeyDown={(e) => handleKeyDown(e)}
      ></input>
    </div>
  );
};

export default CustomeInputTags;
