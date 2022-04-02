import { InfoCircleOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import CustomInputTags from "component/custom/custom-input-tags";
import React from "react";
import { StyledComponent } from "./CreateOrderSidebarOrderExtraInformation.styles";

type PropTypes = {
  onChangeTag: (value: []) => void;
  tags: string;
};

function CreateOrderSidebarOrderExtraInformation(props: PropTypes): JSX.Element {
  const {onChangeTag, tags} =
    props;
  return (
    <StyledComponent>
      <Form.Item name="customer_note" label="Ghi chú của khách">
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "80px"}}
          />
        </Form.Item>
        <Form.Item
          name="note"
          label="Ghi chú nội bộ"
          tooltip={{
            title: "Thêm thông tin ghi chú chăm sóc khách hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "80px"}}
          />
        </Form.Item>
        <Form.Item
          label="Nhãn"
          tooltip={{
            title: "Thêm từ khóa để tiện lọc đơn hàng",
            icon: <InfoCircleOutlined />,
          }}
          // name="tags"
        >
          <CustomInputTags onChangeTag={onChangeTag} tags={tags} />
        </Form.Item>
    </StyledComponent>
  );
};

export default CreateOrderSidebarOrderExtraInformation;
