import { Button, Dropdown, Menu } from "antd";
import editIcon from "assets/icon/edit.svg";
import threeDot from "assets/icon/three-dot.svg";
import { Link } from "react-router-dom";
import { StyledDropDown, StyledMenu } from "./styles";

const ActionColumnIssue = () => {
  const _actionColumn = {
    title: "",
    visible: true,
    width: "5%",
    className: "saleorder-product-card-action ",
    dataIndex: "id",
    render: (id: any) => {
      const menu = (
        <StyledMenu>
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          <Menu.Item key="0">
            <Link to={`/promotion/codes/${id}`}>
            <Button
              icon={<img style={{ marginRight: 12 }} alt="" src={editIcon} />}
              type="text"
            >
              Chỉnh sửa
            </Button>
            </Link>
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
                icon={<img src={threeDot} alt="" style={{verticalAlign: 'super'}}/>}
              ></Button>
            </Dropdown>
          </div>
        </StyledDropDown>
      );
    },
  };
  return _actionColumn;
};

export default ActionColumnIssue;
