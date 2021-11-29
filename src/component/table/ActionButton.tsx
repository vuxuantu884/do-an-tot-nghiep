import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";
import { ButtonType } from "antd/lib/button/button.d";

type ActionProps = {
  menu?: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  disabled?: boolean;
  type?: ButtonType;
};

export interface MenuAction {
  id: number;
  name: string;
  icon?:any;
  color?:any;
  disabled?: boolean
}

const ActionButton: React.FC<ActionProps> = (props: ActionProps) => {
  return (
    <Dropdown
      disabled={props.disabled}
      overlayStyle={{ minWidth: "10rem" }}
      overlay={
        <Menu>
          {props.menu &&
            props.menu.map((item) => (
              <Menu.Item
                disabled={item.disabled}
                key={item.id}
                onClick={() => props.onMenuClick && props.onMenuClick(item.id)}
                icon={item.icon}
                style={{color:item.color}}
              >
                {item.name}
              </Menu.Item>
            ))}
        </Menu>
      }
      trigger={["click"]}
    >
      <Button type={props.type ? props.type : "link"} className="action-button">
        <div style={{ marginRight: 10 }}>Thao tác </div>
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default ActionButton;
