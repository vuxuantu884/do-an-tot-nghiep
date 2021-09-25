import { Card, Form, Select } from "antd";
import { OrderReturnReasonModel } from "model/response/order/order.response";
import React from "react";

type PropType = {
  listOrderReturnReason: OrderReturnReasonModel[];
};

/**
 * input: list reason;
 * output: none
 */
function OrderReturnReason(props: PropType): React.ReactElement {
  const { listOrderReturnReason } = props;

  return (
    <Card
      className="margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">Lý do đổi/trả hàng</span>
        </div>
      }
    >
      <div className="padding-24">
        <Form.Item
          name="reason_id"
          rules={[
            { required: true, message: "Vui lòng chọn lý do đổi trả hàng!" },
          ]}
        >
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Chọn lý do đổi trả hàng"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent="Không tìm thấy lý do đổi trả hàng"
          >
            {listOrderReturnReason &&
              listOrderReturnReason.map((single) => {
                return (
                  <Select.Option value={single.id} key={single.id}>
                    {single.name}
                  </Select.Option>
                );
              })}
          </Select>
        </Form.Item>
      </div>
    </Card>
  );
}

export default OrderReturnReason;
