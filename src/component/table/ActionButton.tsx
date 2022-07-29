import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, DropDownProps, Menu } from "antd";
import { ButtonType } from "antd/lib/button/button.d";
import { CSSProperties } from "react";

type ActionProps = Pick<DropDownProps, "placement" | "getPopupContainer"> & {
  menu?: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  disabled?: boolean;
  type?: ButtonType;
  buttonStyle?: CSSProperties | undefined;
  buttonText?: string;
};

export interface MenuAction {
  id: number;
  name: string;
  icon?: any;
  color?: any;
  disabled?: boolean;
  hidden?: boolean;
}

const ActionButton: React.FC<ActionProps> = (props: ActionProps) => {
  return (
    <Dropdown
      disabled={props.disabled}
      overlayStyle={{ minWidth: "10rem" }}
      placement={props.placement}
      getPopupContainer={props.getPopupContainer}
      overlay={
        <Menu>
          {props.menu &&
            props.menu.map((item) => (
              <Menu.Item
                hidden={item.hidden}
                disabled={item.disabled}
                key={item.id}
                onClick={() => props.onMenuClick && props.onMenuClick(item.id)}
                icon={item.icon}
                style={!item.disabled ? { color: item.color } : undefined}
              >
                {item.name}
              </Menu.Item>
            ))}
        </Menu>
      }
      trigger={["click"]}
    >
      <Button
        type={props.type ? props.type : "link"}
        className="action-button"
        style={props.buttonStyle}
      >
        <div style={{ marginRight: 10 }}>{props.buttonText ?? "Thao tác"}</div>
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default ActionButton;
