import { Button, Dropdown, Menu } from "antd";
import threeDot from "assets/icon/three-dot.svg";
import editIcon from "assets/icon/edit.svg";
import lockIcon from "assets/icon/lock.svg";
import { StyledMenu } from "./styles";
import { EcommerceConfigPermissions } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";


const updateShopPermission = [EcommerceConfigPermissions.UPDATE_SHOP];
const deleteShopPermission = [EcommerceConfigPermissions.DELETE_SHOP];


const actionColumn = (handleUpdate: any, handleDelete: any) => {
  const RenderActionColumn = (l: any, item: any, index: number) => {
    const [allowUpdateShop] = useAuthorization({
      acceptPermissions: updateShopPermission,
      not: false,
    });

    const [allowDeleteShop] = useAuthorization({
      acceptPermissions: deleteShopPermission,
      not: false,
    });
    
    const isShowAction = allowUpdateShop || allowDeleteShop;
    
    const menu = (
      <StyledMenu>
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          {allowUpdateShop &&
            <Menu.Item key="1">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={editIcon} />}
                type="text"
                onClick={() => handleUpdate(item)}
              >
                Chỉnh sửa
              </Button>
            </Menu.Item>
          }
          
          {allowDeleteShop &&
            <Menu.Item key="2">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={lockIcon} />}
                type="text"
                onClick={() => handleDelete(item)}
              >
                Xóa gian hàng
              </Button>
            </Menu.Item>
          }
        </Menu>
      </StyledMenu>
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

export default actionColumn;
