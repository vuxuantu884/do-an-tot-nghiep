import { Button, Dropdown, Menu } from "antd";
import threeDot from "assets/icon/three-dot.svg";
import deleteIcon from "assets/icon/delete.svg"
import lockIcon from "assets/icon/lock.svg";
import { StyledMenu, StyledDropDown } from "./styles";

//thai need todo
const actionColumn = (handleDeleteItem: any, handleDisconnectItem: any) => {
  const _actionColumn = {
    title: "",
    visible: true,
    width: "5%",
    className: "saleorder-product-card-action ",
    render: (l: any, item: any, index: number) => {
      const menu = (
        <StyledMenu>
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          <Menu.Item key="1">
            <Button
              icon={<img src={deleteIcon} style={{ marginRight: 12 }} alt="" />}
              type="text"
              onClick={() => handleDeleteItem(item)}
            >
              Xóa sản phẩm đã tải về
            </Button>
          </Menu.Item>

          <Menu.Item key="2">
            <Button
              icon={<img style={{ marginRight: 12 }} alt="" src={lockIcon} />}
              type="text"
              className=""
              onClick={handleDisconnectItem}
            >
              Ngắt kết nối
            </Button>
          </Menu.Item>
        </Menu>
        </StyledMenu>
      );
      return (
        <StyledDropDown
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 4px",
          }}
        >
          <div
            className="site-input-group-wrapper saleorder-input-group-wrapper"
            style={{
              borderRadius: 5,
            }}
          >
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="p-0 ant-btn-custom"
                icon={<img src={threeDot} alt=""></img>}
              ></Button>
            </Dropdown>
          </div>
        </StyledDropDown>
      );
    },
  };
  return _actionColumn;
};

export default actionColumn;
