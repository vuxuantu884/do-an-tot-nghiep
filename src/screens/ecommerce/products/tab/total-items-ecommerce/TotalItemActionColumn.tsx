import { Button, Dropdown, Menu } from "antd";
import threeDot from "assets/icon/three-dot.svg";

//thai need todo
const TotalItemActionColumn = (handleSyncStock: any, handleDeleteItem: any, handleDisconnectItem: any) => {
  const _actionColumn = {
    title: "",
    visible: true,
    width: "5%",
    className: "saleorder-product-card-action ",
    render: (l: any, item: any, index: number) => {      
      const menu = (
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          {item.connect_status === "connected" &&
            <>
              <Menu.Item key="1">
                <Button
                  type="text"
                  onClick={() => handleSyncStock(item)}
                >
                  Đồng bộ tồn kho lên sàn
                </Button>
              </Menu.Item>
              
              <Menu.Item key="2">
                <Button
                  type="text"
                  onClick={() => handleDeleteItem(item)}
                >
                  Xóa sản phẩm lấy về
                </Button>
              </Menu.Item>
              
              <Menu.Item key="3">
                <Button
                  type="text"
                  onClick={() => handleDisconnectItem(item)}
                >
                  Hủy liên kết
                </Button>
              </Menu.Item>
            </>
          }

          {item.connect_status === "waiting" &&
            <>
              <Menu.Item key="4">
                <Button
                  type="text"
                  onClick={() => handleDeleteItem(item)}
                >
                  Xóa sản phẩm lấy về
                </Button>
              </Menu.Item>
            </>
          }
        </Menu>
      );
      return (
        <div
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
        </div>
      );
    },
  };
  return _actionColumn;
};

export default TotalItemActionColumn;
