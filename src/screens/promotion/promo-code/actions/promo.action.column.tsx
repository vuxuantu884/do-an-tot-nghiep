import { Button, Dropdown, Menu } from "antd";
import threeDot from "assets/icon/three-dot.svg";
import editIcon from "assets/icon/edit.svg";
import closeIcon from "assets/icon/close.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import { StyledMenu, StyledDropDown } from "./styles";

const actionColumn = (handleUpdate: any, handleDelete: any, handleStatus?: any, handleGift?: any) => {
  const _actionColumn = {
    title: "",
    visible: true,
    width: "5%",
    className: "saleorder-product-card-action ",
    render: (l: any, item: any, index: number) => {
      const menu = (
        <StyledMenu>
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {/*{ handleGift &&*/}
        {/*    <Menu.Item key="1">*/}
        {/*      <Button*/}
        {/*        icon={<img style={{ marginRight: 12 }} alt="" src={checkIcon} />}*/}
        {/*        type="text"*/}
        {/*        className=""*/}
        {/*        onClick={() => handleGift(item)}*/}
        {/*      >*/}
        {/*        Đã tặng*/}
        {/*      </Button>*/}
        {/*    </Menu.Item>*/}
        {/*  }*/}

          { handleStatus &&
            <Menu.Item key="2">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={closeIcon} />}
                type="text"
                className=""
                onClick={() => handleStatus(item)}
              >
                Ngừng áp dụng
              </Button>
            </Menu.Item>
          }

          <Menu.Item key="3">
            <Button
              icon={<img style={{ marginRight: 12 }} alt="" src={editIcon} />}
              type="text"
              className=""
              onClick={() => handleUpdate(item)}
            >
              Chỉnh sửa
            </Button>
          </Menu.Item>

          <Menu.Item key="4">
            <Button
              icon={<img style={{ marginRight: 12 }} alt="" src={deleteIcon} />}
              type="text"
              className=""
              style={{
                background: "transparent",
                border: "none",
                color: "red",
              }}
              onClick={() => handleDelete(item)}
            >
              Huỷ
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
