import {
	Card, Select
} from "antd";
import React from "react";

function SubStatusOrder(): React.ReactElement {
  return (
    <Card
      className="margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">Xử lý đơn hàng</span>
        </div>
      }
    >
      <div className="padding-24">
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Select a person"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Select.Option value="jack">Jack</Select.Option>
          <Select.Option value="lucy">Lucy</Select.Option>
          <Select.Option value="tom">Tom</Select.Option>
        </Select>
      </div>
    </Card>
  );
}

export default SubStatusOrder;
