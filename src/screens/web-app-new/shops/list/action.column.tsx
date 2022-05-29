import { Button, Dropdown, Menu } from "antd";
import { EcommerceConfigPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";

import threeDot from "assets/icon/three-dot.svg";
import editIcon from "assets/icon/edit.svg";
import lockIcon from "assets/icon/lock.svg";
import { StyledMenu } from "screens/web-app/config/actions/styles";


const shopsUpdatePermission = [EcommerceConfigPermission.shops_update];
const shopsDeletePermission = [EcommerceConfigPermission.shops_delete];


const actionColumn = (handleUpdate: any, handleDelete: any) => {
  const RenderActionColumn = (l: any, item: any) => {
    const [allowShopsUpdate] = useAuthorization({
      acceptPermissions: shopsUpdatePermission,
      not: false,
    });

    const [allowShopsDelete] = useAuthorization({
      acceptPermissions: shopsDeletePermission,
      not: false,
    });
    
    const isShowAction = allowShopsUpdate || allowShopsDelete;
    
    const menu = (
      <StyledMenu>
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          {allowShopsUpdate &&
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
          
          {allowShopsDelete &&
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
              icon={<img src={threeDot} alt=""/>}
            />
          </Dropdown>
        }
      </>
    );
  }

  const _actionColumn = {
    title: "",
    visible: true,
    width: 70,
    className: "saleorder-product-card-action ",
    render: (l: any, item: any) => RenderActionColumn(l, item)
  };
  return _actionColumn;
};

export default actionColumn;
