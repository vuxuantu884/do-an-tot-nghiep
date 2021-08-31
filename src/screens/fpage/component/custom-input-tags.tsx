import React, { useState } from "react";
import xCloseBtn from "assets/icon/X_close.svg";

type CustomInputTagsProps = {
  onChangeTag: (value: any) => void;
};

const CustomeInputTags: React.FC<CustomInputTagsProps> = (
  props: CustomInputTagsProps
) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [border, setBorder] = useState<boolean>(false);

  const handleChange = (e: any) => {
    if (e.target.value === ",") return;
    setInputValue(e.target.value);
  };
  const handleKeyDown = (e: any) => {
    let _tags = [...tags];
    if ((e.which === 13 && inputValue !== "") || (e.which === 188 && inputValue !== "")) {
      _tags.push(inputValue);
      setInputValue("");
    }
    if (e.which === 8 && inputValue === "") {
      _tags.pop();
    }
    setTags(_tags);
    props.onChangeTag(_tags);
  };

  const handleDelete = (index: number) => {
    let _tags = [...tags];
    _tags.splice(index, 1);
    setTags(_tags);
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
      {tags.map((tag, index) => (
        <div key={index}>
          <span>{tag}</span>
          <img onClick={() => handleDelete(index)} alt="" src={xCloseBtn}></img>
        </div>
      ))}

      <input
        maxLength={250}
        value={inputValue}
        type="text"
        placeholder={tags.length > 0 ? "" : "Thêm tags"}
        onChange={(e) => handleChange(e)}
        onKeyDown={(e) => handleKeyDown(e)}
      ></input>
    </div>
  );
};

export default CustomeInputTags;
