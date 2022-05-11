import { InfoCircleOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import CustomInputTags from "component/custom/custom-input-tags";
import React, { useMemo } from "react";
import { StyledComponent } from "./CreateOrderSidebarOrderExtraInformation.styles";

type PropTypes = {
  onChangeTag: (value: []) => void;
  tags: string;
  isExchange?: boolean;
  isReturn?: boolean;
};

function CreateOrderSidebarOrderExtraInformation(
  props: PropTypes,
): JSX.Element {
  const { onChangeTag, tags, isExchange, isReturn } = props;

  const moreTextIfIsReturn = useMemo(() => {
    if(isReturn) {
      if(isExchange) {
        return "đơn đổi"
      } else {
        return "đơn trả"
      }
    } else {
      return null
    }
  }, [isExchange, isReturn])
  return (
    <StyledComponent>
      <Form.Item
        name="customer_note"
        label={`Ghi chú của khách ${moreTextIfIsReturn}`}
      >
        <Input.TextArea
          placeholder="Điền ghi chú"
          maxLength={500}
          style={{ minHeight: "80px" }}
        />
      </Form.Item>
      <Form.Item
        name="note"
        label={`Ghi chú nội bộ ${moreTextIfIsReturn}`}
        tooltip={{
          title: "Thêm thông tin ghi chú chăm sóc khách hàng",
          icon: <InfoCircleOutlined />,
        }}
      >
        <Input.TextArea
          placeholder="Điền ghi chú"
          maxLength={500}
          style={{ minHeight: "80px" }}
        />
      </Form.Item>
      <Form.Item
        label={`Nhãn ${moreTextIfIsReturn}`}
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
}

export default CreateOrderSidebarOrderExtraInformation;
