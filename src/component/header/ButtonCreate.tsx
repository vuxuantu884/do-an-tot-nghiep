import { Link } from "react-router-dom";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

type ButtonCreateProps = {
  path: string;
};

const ButtonCreate: React.FC<ButtonCreateProps> = (
  props: ButtonCreateProps
) => {
  return (
    <Link to={props.path}>
      <Button
        type="primary"
        className="ant-btn-secondary"
        size="large"
        icon={<PlusOutlined />}
      >
        Thêm mới
      </Button>
    </Link>
  );
};

export default ButtonCreate;
