import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import { Link } from "react-router-dom";


type ActionProps = {
  menu?: Array<MenuAction>,
  onMenuClick?: (index: number) => void;
}

export interface MenuAction {
  id: number,
  name: string,
}

const ActionButton: React.FC<ActionProps> = (props: ActionProps) => {
  return (
    <Dropdown overlayStyle={{minWidth: '10rem'}} overlay={
      <Menu>
        {
          props.menu && props.menu.map((item, index) => (
            <Menu.Item onClick={() => props.onMenuClick && props.onMenuClick(index)} key={index} >{item.name}</Menu.Item>
          ))
        }
      </Menu>
    }
    trigger={["click"]}
    >
      <Link className="action-button" to="#"> 
        <div style={{marginRight: 10}}>Thao tác </div>
        <DownOutlined />
      </Link>
    </Dropdown>
  )
} 

export default ActionButton;
