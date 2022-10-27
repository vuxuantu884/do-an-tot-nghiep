import { InfoCircleOutlined } from "@ant-design/icons";
import { Checkbox, Form, Input, Tooltip } from "antd";
import CustomInputTags from "component/custom/custom-input-tags";
import { useMemo } from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  onChangeTag: (value: []) => void;
  tags: string;
  isExchange?: boolean;
  isReturn?: boolean;
  promotionTitle: string;
  setPromotionTitle: (value: string) => void;
};

function CreateOrderSidebarOrderExtraInformation(props: PropTypes): JSX.Element {
  const { onChangeTag, tags, isExchange, isReturn, promotionTitle, setPromotionTitle } = props;

  const moreTextIfIsReturn = useMemo(() => {
    if (isReturn) {
      if (isExchange) {
        return "(đơn đổi)";
      } else {
        return "(đơn trả)";
      }
    } else {
      return null;
    }
  }, [isExchange, isReturn]);

  return (
    <StyledComponent>
      <Form.Item
        name="uniform"
        valuePropName="checked"
        label={`Đơn đồng phục`}
        initialValue={false}
        tooltip={{
          title: "Đánh dấu đây là đơn đồng phục",
          icon: <InfoCircleOutlined />,
        }}
      >
        <Checkbox>Đơn đồng phục</Checkbox>
      </Form.Item>

      <Form.Item name="customer_note" label={`Ghi chú của khách ${moreTextIfIsReturn || ""}`}>
        <Input.TextArea
          placeholder="Điền ghi chú"
          //maxLength={500}
        />
      </Form.Item>
      <Form.Item
        name="note"
        label={`Ghi chú nội bộ ${moreTextIfIsReturn || ""}`}
        tooltip={{
          title: "Thêm thông tin ghi chú chăm sóc khách hàng",
          icon: <InfoCircleOutlined />,
        }}
      >
        <Input.TextArea
          placeholder="Điền ghi chú"
          //maxLength={500}
        />
      </Form.Item>
      <div className="promotionTitle ant-form-item">
        <div className="ant-form-item-label">
          <label>
            <Tooltip title="Chú ý: Khi có load lại chương trình khuyến mại, sẽ cập nhật lại hết tên chương trình">
              CTKM áp dụng
              <span className="noteTooltip">
                <InfoCircleOutlined />
              </span>
            </Tooltip>
          </label>
        </div>
        <Input value={promotionTitle} onChange={(e) => setPromotionTitle(e.target.value)} />
      </div>
      <Form.Item
        label={`Nhãn ${moreTextIfIsReturn || ""}`}
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
