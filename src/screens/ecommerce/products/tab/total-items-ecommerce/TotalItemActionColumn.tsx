import { Button, Dropdown, Menu } from "antd";
import { EcommerceProductPermissions } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import threeDot from "assets/icon/three-dot.svg";


const deleteProductPermission = [EcommerceProductPermissions.DELETE_PRODUCT];
const syncStockPermission = [EcommerceProductPermissions.UPDATE_STOCK_PRODUCT];
const disconnectProductPermission = [EcommerceProductPermissions.DISCONNECT_PRODUCT];


const TotalItemActionColumn = (handleSyncStock: any, handleDeleteItem: any, handleDisconnectItem: any) => {
  const RenderActionColumn = (l: any, item: any, index: number) => {
    const [allowDeleteProduct] = useAuthorization({
      acceptPermissions: deleteProductPermission,
      not: false,
    });

    const [allowSyncStock] = useAuthorization({
      acceptPermissions: syncStockPermission,
      not: false,
    });

    const [allowDisconnectProduct] = useAuthorization({
      acceptPermissions: disconnectProductPermission,
      not: false,
    });
    
    const isShowAction = (item.connect_status === "connected" && (allowDeleteProduct || allowSyncStock || allowDisconnectProduct)) ||
      (item.connect_status === "waiting" && allowDeleteProduct);
    
    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {item.connect_status === "connected" &&
          <>
            {allowSyncStock &&
              <Menu.Item key="1">
                <Button type="text" onClick={() => handleSyncStock(item)}>
                  Đồng bộ tồn kho lên sàn
                </Button>
              </Menu.Item>
            }
            
            {allowDeleteProduct &&
              <Menu.Item key="2">
                <Button type="text" onClick={() => handleDeleteItem(item)}>
                  Xóa sản phẩm lấy về
                </Button>
              </Menu.Item>
            }
          
            {allowDisconnectProduct &&
              <Menu.Item key="3">
                <Button type="text" onClick={() => handleDisconnectItem(item)}>
                  Hủy liên kết
                </Button>
              </Menu.Item>
            }
          </>
        }

        {item.connect_status === "waiting" && allowDeleteProduct &&
          <Menu.Item key="4">
            <Button type="text" onClick={() => handleDeleteItem(item)}>
              Xóa sản phẩm lấy về
            </Button>
          </Menu.Item>
        }
      </Menu>
    );

    return (
      <>
        {isShowAction &&
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
        }
      </>
    );
  }

  const _actionColumn = {
    title: "",
    visible: true,
    width: "5%",
    className: "saleorder-product-card-action ",
    render: (l: any, item: any, index: number) => RenderActionColumn(l, item, index)
  };

  return _actionColumn;
};

export default TotalItemActionColumn;
