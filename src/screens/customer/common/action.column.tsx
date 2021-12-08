import { Button, Dropdown, Menu} from "antd";
import threeDot from "assets/icon/three-dot.svg";
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import { CustomerListPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";


const updateCustomerPermission = [CustomerListPermission.customers_update];

const actionColumn = (handleEdit: any, handleDelete: any, customerDetailState: any) => {
  const RenderActionColumn = (value: any, item: any, index: number) => {
    const [allowUpdateCustomer] = useAuthorization({
      acceptPermissions: updateCustomerPermission,
      not: false,
    })
    
    const isShowAction = allowUpdateCustomer;
    
    const menu = (
      <Menu>
        <Menu.Item key="1">
          <Button
            icon={<img style={{ marginRight: 12 }} alt="" src={editIcon} />}
            type="text"
            className=""
            style={{
              paddingLeft: 24,
              background: "transparent",
              border: "none",
            }}
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
        </Menu.Item>
        {customerDetailState !== "contacts" && (
          <Menu.Item key="2">
            <Button
              icon={
                <img style={{ marginRight: 12 }} alt="" src={deleteIcon} />
              }
              type="text"
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
                color: "red",
              }}
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </Menu.Item>
        )}
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
            <Button type="text" icon={<img src={threeDot} alt=""></img>} />
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
      render: (value: any, item: any, index: number) => RenderActionColumn(value, item, index)
    };
    return _actionColumn;
  };

  export default actionColumn