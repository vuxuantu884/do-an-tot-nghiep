import xCloseBtn from "assets/icon/X_close.svg";
import { useState } from "react";

type PropType = {
  tags?: string;
  onChangeTag: (value: any) => void;
};

const INPUT_TAGS_ID = "input-tags-id";

function CustomInputTags(props: PropType) {
  const { tags, onChangeTag } = props;
  const [inputValue, setInputValue] = useState<string>("");
  const [border, setBorder] = useState<boolean>(false);
  let tagsArr = tags ? tags.split(",") : [];

  const handleChange = (e: any) => {
    if (e.target.value === ",") return;
    setInputValue(e.target.value);
  };

  const handleOnBlur = () => {
    let _tags = tagsArr ? [...tagsArr] : [];
    if (inputValue !== "") {
      _tags.push(inputValue);
      setInputValue("");
    }
    onChangeTag(_tags);
  };

  const handleKeyDown = (e: any) => {
    let _tags = tagsArr ? [...tagsArr] : [];
    if ((e.which === 13 && inputValue !== "") || (e.which === 188 && inputValue !== "")) {
      _tags.push(inputValue);
      setInputValue("");
    }
    if (e.which === 8 && inputValue === "") {
      _tags.pop();
    }
    onChangeTag(_tags);
  };

  const handleDelete = (index: number) => {
    let _tags = tagsArr ? [...tagsArr] : [];
    _tags.splice(index, 1);
    onChangeTag(_tags);
  };

  return (
    <div
      onFocus={() => setBorder(true)}
      onBlur={() => setBorder(false)}
      className="orders-screen-custom-tags"
      style={border ? { border: "1px solid #2a2a86" } : { border: "1px solid #d9d9d9" }}
      onClick={() => document.getElementById(INPUT_TAGS_ID)?.focus()}
    >
      {tagsArr &&
        tagsArr?.length > 0 &&
        tagsArr.map((tag, index) => (
          <div key={index}>
            <span>{tag}</span>
            <img alt="" onClick={() => handleDelete(index)} src={xCloseBtn}></img>
          </div>
        ))}

      <input
        id={INPUT_TAGS_ID}
        maxLength={250}
        value={inputValue}
        type="text"
        placeholder={tagsArr && tagsArr.length > 0 ? "" : "Thêm nhãn"}
        onChange={(e) => handleChange(e)}
        onKeyDown={(e) => handleKeyDown(e)}
        onBlur={handleOnBlur}
      />
    </div>
  );
}

export default CustomInputTags;
