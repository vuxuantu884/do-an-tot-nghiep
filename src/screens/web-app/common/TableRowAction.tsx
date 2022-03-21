import { Button, Dropdown, Menu } from "antd";
import threeDot from "assets/icon/three-dot.svg";
import  "./TableRowAction.scss"

const TableRowAction = (menuItems: any) => {
  const RenderActionColumn = (rowData: any, itemData: any, index: number) => {
    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {menuItems.map((item: any, idx: number) => (
          <Menu.Item key={idx}>
            <Button type="text" onClick={() => item.onClick(itemData)}>
              {item.actionName}
            </Button>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <Button
          type="text"
          className="p-0 ant-btn-custom"
          style={{width:"30px" , height:"30px"}}
          icon={<img src={threeDot} alt=""></img>}
        />
      </Dropdown>
    );
  };

  const _actionColumn = {
    title: "",
    visible: true,
    width: "40px",
    className: "threedot-button",
    render: (rowData: any, item: any, index: number) =>
      RenderActionColumn(rowData, item, index),
  };

  return _actionColumn;
};

export default TableRowAction;
