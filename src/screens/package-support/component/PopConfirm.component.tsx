import { CloseOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { PopConfirmStyleComponent } from "../style";

type Props = {
  onConfirm: (e?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;
};

const PopConfirmComponent: React.FC<Props> = (props) => {
  return (
    <Popconfirm
      style={{ height: "20px" }}
      onConfirm={props.onConfirm}
      title={"Bạn chắc chắn muốn xóa"}
      okText="Đồng ý"
      cancelText="Bỏ"
      placement="leftTop"
    >
      <PopConfirmStyleComponent>
        <Button className="btn-danger-remove-order" danger icon={<CloseOutlined />} />
      </PopConfirmStyleComponent>
    </Popconfirm>
  );
};

export default PopConfirmComponent;
