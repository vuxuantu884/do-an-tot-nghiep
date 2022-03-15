import { CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';

export interface CustomSelectTagsProps {
    tags: any
    onChangeTag: (value: any) => void;
}

function CustomSelectTags (props: CustomSelectTagsProps) {
    const {tags, onChangeTag} = props;
    const [inputValue, setInputValue] = useState<string>("");
  
    const handleChange = (e: any) => {
      if (e.target.value === ",") return;
      setInputValue(e.target.value);
    };
  
    const handleKeyDown = (e: any) => {
      let _tags = tags ? [...tags] : [];
      if ((e.which === 13 && inputValue !== "") || (e.which === 188 && inputValue !== "")) {
        !_tags.includes(inputValue.trim()) && _tags.push(inputValue)
        setInputValue("");
      }
      if (e.which === 8 && inputValue === "") {
        _tags.pop();
      }
      onChangeTag(_tags);
    };
  
    const handleDelete = (index: number) => {
      let _tags = tags ? [...tags] : [];
      _tags.splice(index, 1);
      onChangeTag(_tags);
    };
  
    return (
      <div
        className="orders-screen-custom-tags"
      >
        {tags &&
          tags?.length > 0 &&
          tags.map((tag: any, index: any) => (
            <div key={index} className="ecommerce-tags-filter">
              <span className="ecommerce-tags-filter-content">{tag}</span>
              <span className="ecommerce-tags-filter-close" onClick={() => handleDelete(index)}><CloseOutlined /></span>
            </div>
          ))}
  
        <input
          maxLength={250}
          value={inputValue}
          type="text"
          placeholder={tags && tags.length > 0 ? "" : "Điền 1 hoặc nhiều tags"}
          onChange={(e) => handleChange(e)}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </div>
    );
}

export default CustomSelectTags
