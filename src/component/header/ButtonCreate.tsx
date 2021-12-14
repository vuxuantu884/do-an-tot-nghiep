import { Link } from "react-router-dom";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

type ButtonCreateProps = {
  path: string;
  disabled?: boolean;
  child?: any;
};

const ButtonCreate: React.FC<ButtonCreateProps> = (
  props: ButtonCreateProps
) => {
  return (
    <Link to={props.path} target="_blank">
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        icon={<PlusOutlined />}
        disabled={props.disabled}
      >
        { props.child || 'Thêm mới' }
      </Button>
    </Link>
  );
};

export default ButtonCreate;
