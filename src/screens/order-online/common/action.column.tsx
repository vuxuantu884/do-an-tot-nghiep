import { Button, Dropdown, Menu} from "antd";
import threeDot from "assets/icon/three-dot.svg";
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";

const actionColumn = (handleEdit: any, handleDelete: any, customerDetailState: any) => {
    const _actionColumn = {
      title: "",
      visible: true,
      width: "5%",
      className: "saleorder-product-card-action ",
      render: (l: any, item: any, index: number) => {
        const menu = (
          <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
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
          <div
            style={{
              display: "flex",
              justifyContent: "right",
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

  export default actionColumn