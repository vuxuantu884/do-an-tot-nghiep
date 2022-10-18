import React from "react";
import { Button, Dropdown, Menu } from "antd";
import threeDot from "assets/icon/three-dot.svg";
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";


const CustomerFamilyActionColumn = (handleEdit: any, handleDelete: any) => {
  const RenderActionColumn = (value: any, item: any, index: number) => {
    const menu = (
      <Menu>
        <Menu.Item key="edit">
          <Button
            icon={<img style={{ marginRight: 12 }} alt="" src={editIcon} />}
            type="text"
            style={{
              background: "transparent",
              border: "none",
            }}
            onClick={() => handleEdit(value, item, index)}
          >
            Chỉnh sửa
          </Button>
        </Menu.Item>
        <Menu.Item key="delete">
          <Button
            icon={<img style={{ marginRight: 12 }} alt="" src={deleteIcon} />}
            type="text"
            style={{
              background: "transparent",
              border: "none",
              color: "red",
            }}
            onClick={() => handleDelete(value, item, index)}
          >
            Xóa
          </Button>
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <Button type="text" icon={<img src={threeDot} alt=""></img>} />
      </Dropdown>
    );
  };
  return {
    title: "",
    width: "70px",
    render: (value: any, item: any, index: number) => RenderActionColumn(value, item, index),
  };
};

export default CustomerFamilyActionColumn;
