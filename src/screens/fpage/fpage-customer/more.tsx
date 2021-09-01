import React from "react";
import { Popover, Button } from "antd";
import { MoreOutlined, HistoryOutlined, GroupOutlined, UserOutlined, ApartmentOutlined } from "@ant-design/icons";
import './customer.scss'

const MorePopover = () => {
  const [visible, setVisible] = React.useState(false);

  const renderList = (
    <ul className="popover">
      <li>
        <GroupOutlined />
        Phân loại nhóm khách hàng
      </li>
      <li>
        <UserOutlined />
        Phân loại khách hàng
      </li>
      <li>
        <ApartmentOutlined />
        Phân loại cấp độ khách hàng
      </li>
      <li>
        <HistoryOutlined />
        Lịch sử mua hàng
      </li>
    </ul>
  );

  return (
    <Popover
      content={renderList}
      trigger="click"
      visible={visible}
      onVisibleChange={setVisible}
    >
      <Button
        style={{ border: "none", outline: "none", background: "none" }}
        icon={<MoreOutlined />}
      ></Button>
    </Popover>
  );
};

export default MorePopover;
