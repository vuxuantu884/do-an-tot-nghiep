import { Link } from "react-router-dom";
import { Button } from "antd";
import {GoPlus} from "react-icons/go";
import { ReactNode } from "react";
type ButtonCreateProps = {
  path: string;
  disabled?: boolean;
  child?: any;
  children?: ReactNode;
};

const ButtonCreate: React.FC<ButtonCreateProps> = (
  props: ButtonCreateProps
) => {
  const {children} = props;
  return (
    <Link to={props.path}>
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        icon={<GoPlus style={{marginRight: "0.2em"}}/>}
        disabled={props.disabled}
      >
        { props.child || children || 'Thêm mới' }
      </Button>
    </Link>
  );
};

export default ButtonCreate;
