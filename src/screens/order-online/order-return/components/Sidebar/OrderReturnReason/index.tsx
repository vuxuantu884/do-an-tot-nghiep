import {Card, Form, FormInstance, Input, Select} from "antd";
import CustomSelect from "component/custom/select.custom";
import {OrderReturnReasonModel} from "model/response/order/order.response";
import React, {useCallback, useState} from "react";
import {StyledComponent} from "./styles";

type PropType = {
  listOrderReturnReason: OrderReturnReasonModel[];
  form: FormInstance<any>;
};

/**
 * input: list reason;
 * output: none
 */
function OrderReturnReason(props: PropType): React.ReactElement {
  const OTHER_REASON_ID = 1;
  const {listOrderReturnReason, form} = props;
  const [reasonSubID, setReasonSubID] = useState<number | undefined>(undefined);
  const [reasonID, setReasonID] = useState<number | undefined>(undefined);
  const [reasonSubs, setReasonSubs] = useState<any[]>([]);

  const onChangeReasonID = useCallback(
    (value) => {
      if (!value) {
        return;
      }
			if(+value!==OTHER_REASON_ID) {
				form.setFieldsValue({reason: null});
			}
      form.setFieldsValue({sub_reason_id: null});
      setReasonID(+value);
      const reasonDetails = listOrderReturnReason.find(
        (reason: any) => reason.id === value
      );
      if (reasonDetails && reasonDetails.sub_reasons.length) {
        setReasonSubID(reasonDetails.sub_reasons[0].id);
        setReasonSubs(reasonDetails.sub_reasons);
      } else {
        setReasonSubID(undefined);
        setReasonSubs([]);
      }
    },
    [form, listOrderReturnReason]
  );

  const renderSubReason = () => {
    if (!reasonID) {
      // return <div>Vui lòng chọn lý do hủy đơn!</div>;
    } else if (reasonSubs.length > 0) {
      return (
        <Form.Item
          label="Chọn lý do chi tiết"
          name="sub_reason_id"
          rules={[{required: true, message: "Vui lòng chọn lý do chi tiết!"}]}
        >
          <CustomSelect
            showSearch
            placeholder="Chọn lý do chi tiết"
            notFoundContent="Không tìm thấy kết quả"
            style={{width: "100%"}}
            optionFilterProp="children"
            showArrow
            getPopupContainer={(trigger) => trigger.parentNode}
            onSelect={(value) => {
              setReasonSubID(value);
            }}
            value={reasonSubID}
            allowClear
          >
            {reasonSubs.map((reasonSub: any) => (
              <CustomSelect.Option key={reasonSub.id} value={reasonSub.id.toString()}>
                {reasonSub.name}
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </Form.Item>
      );
    } else {
      if (reasonID === OTHER_REASON_ID) {
        return (
          <Form.Item label="Lý do khác" name="reason">
            <Input.TextArea
              onChange={(e) => form.setFieldsValue({reason: e.target.value})}
              style={{width: "100%", height: "80px"}}
              placeholder="Nhập lý do huỷ đơn hàng"
            />
          </Form.Item>
        );
      }
    }
  };

  return (
    <StyledComponent>
      <Card
        title={
          <React.Fragment>
            Lý do đổi/trả hàng
            <span> </span>
            <span className="text-error">*</span>
          </React.Fragment>
        }
      >
        <Form.Item
          name="reason_id"
          rules={[{required: true, message: "Vui lòng chọn lý do đổi trả hàng!"}]}
        >
          <Select
            showSearch
            style={{width: "100%"}}
            placeholder="Chọn lý do đổi trả hàng"
            allowClear
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent="Không tìm thấy lý do đổi trả hàng"
            onChange={(value) => onChangeReasonID(value)}
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
        {renderSubReason()}
      </Card>
    </StyledComponent>
  );
}

export default OrderReturnReason;
