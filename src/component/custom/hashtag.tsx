import { useMemo, useState } from "react";
import xCloseBtn from "assets/icon/X_close.svg";


type HashTagProps = {
  value?: string;
  onChange?: (result: string) => void;
  placeholder?: string,
};

const HashTag: React.FC<HashTagProps> = (props: HashTagProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [border, setBorder] = useState<boolean>(false);

  const handleChange = (e: any) => {
    if (e.target.value === ",") return;
    setInputValue(e.target.value);
  };
  
  const listTag = useMemo(() => {
    if(props.value) {
      return props.value.split(',')
    }
    return []
  }, [props.value])
  const handleKeyDown = (e: any) => {
    let _tags = [...listTag];
    if ((e.which === 13 && inputValue !== "") || (e.which === 188 && inputValue !== "")) {
      _tags.push(inputValue);
      setInputValue("");
    }
    if (e.which === 8 && inputValue === "") {
      _tags.pop();
    }
    props.onChange && props.onChange(_tags.join(','));
  };

  const handleDelete = (index: number) => {
    let _tags = [...listTag];
    _tags.splice(index, 1);
    props.onChange && props.onChange(_tags.join(','));
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
      {listTag.map((tag, index) => (
        <div key={index}>
          <span>{tag}</span>
          <img alt="" onClick={() => handleDelete(index)} src={xCloseBtn}></img>
        </div>
      ))}

      <input
        maxLength={250}
        value={inputValue}
        type="text"
        placeholder={listTag.length > 0 ? "" : "Thêm tags"}
        onChange={(e) => handleChange(e)}
        onKeyDown={(e) => handleKeyDown(e)}
      ></input>
    </div>
  );
};

export default HashTag;
