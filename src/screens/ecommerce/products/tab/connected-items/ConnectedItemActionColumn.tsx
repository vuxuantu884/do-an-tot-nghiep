import { Button, Dropdown, Menu } from "antd";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import threeDot from "assets/icon/three-dot.svg";

const productsDeletePermission = [EcommerceProductPermission.products_delete];
const productsUpdateStockPermission = [EcommerceProductPermission.products_update_stock];
const productsDisconnectPermission = [EcommerceProductPermission.products_disconnect];


const ConnectedItemActionColumn = (handleSyncStock: any, handleDeleteItem: any, handleDisconnectItem: any) => {
  const RenderActionColumn = (l: any, item: any, index: number) => {
    const [allowProductsDelete] = useAuthorization({
      acceptPermissions: productsDeletePermission,
      not: false,
    });

    const [allowProductsUpdateStock] = useAuthorization({
      acceptPermissions: productsUpdateStockPermission,
      not: false,
    });

    const [allowProductsDisconnect] = useAuthorization({
      acceptPermissions: productsDisconnectPermission,
      not: false,
    });
    
    const isShowAction = (item.connect_status === "connected" && (allowProductsDelete || allowProductsUpdateStock || allowProductsDisconnect)) ||
      (item.connect_status === "waiting" && allowProductsDelete);
    
    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {item.connect_status === "connected" &&
          <>
            {allowProductsUpdateStock &&
              <Menu.Item key="1">
                <Button type="text" onClick={() => handleSyncStock(item)}>
                  Đồng bộ tồn kho lên sàn
                </Button>
              </Menu.Item>
            }
            
            {allowProductsDelete &&
              <Menu.Item key="2">
                <Button type="text" onClick={() => handleDeleteItem(item)}>
                  Xóa sản phẩm lấy về
                </Button>
              </Menu.Item>
            }
          
            {allowProductsDisconnect &&
              <Menu.Item key="3">
                <Button type="text" onClick={() => handleDisconnectItem(item)}>
                  Hủy liên kết
                </Button>
              </Menu.Item>
            }
          </>
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

export default ConnectedItemActionColumn;
