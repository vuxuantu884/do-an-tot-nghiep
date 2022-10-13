import { Link } from "react-router-dom";
import { Button } from "antd";
import { ReactNode } from "react";
import { PlusOutlined } from "@ant-design/icons";
import "./button-create.scss"
type ButtonCreateProps = {
  path: string;
  disabled?: boolean;
  child?: any;
  children?: ReactNode;
  size?: any;
  hidden?: boolean;
};

const ButtonCreate: React.FC<ButtonCreateProps> = (props: ButtonCreateProps) => {
  const { children, hidden } = props;
  return (
    <Link to={props.path}>
      <Button
        type="primary"
        className="ant-btn-primary"
        size={props.size || "large"}
        icon={<PlusOutlined className="ant-btn-primary-icon"/>}
        disabled={props.disabled}
        hidden={hidden}
      >
        {props.child || children || "Thêm mới"}
      </Button>
    </Link>
  );
};

export default ButtonCreate;
