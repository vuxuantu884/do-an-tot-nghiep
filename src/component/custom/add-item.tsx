import { Button } from "antd";
import { AiOutlinePlusCircle } from "react-icons/ai";
import React from "react";

type AddItemProps = {
  onClick?: () => void;
  title: string;
  isNotFound: boolean;
};

const AddItem: React.FC<AddItemProps> = (props: AddItemProps) => {
  const { isNotFound, title, onClick } = props;
  return (
    <div>
      <Button
        icon={<AiOutlinePlusCircle size={24} />}
        className="dropdown-add-new"
        type="link"
        onClick={onClick}
      >
        {/* <PlusCircleOutlined /> */}
        {title}
      </Button>
      {isNotFound && "Không tìm thấy kêt quả"}
    </div>
  );
};

export default AddItem;
