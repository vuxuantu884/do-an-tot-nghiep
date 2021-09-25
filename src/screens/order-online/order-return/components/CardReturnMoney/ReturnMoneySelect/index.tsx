import { Button, Col, Form, Input, Row, Select } from "antd";
import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { formatCurrency } from "utils/AppUtils";
import { PaymentMethodCode } from "utils/Constants";

type PropType = {
  totalAmountNeedToPay: number;
  isShowButtonReturnMoney: boolean;
  handleReturnMoney: () => void;
  setReturnMoneyMethod: (value: PaymentMethodResponse) => void;
  setReturnMoneyNote: (value: string) => void;
};

/**
 * input: totalAmountNeedToPay
 * output: setReturnMoneyType, setReturnMoneyMethod
 */
function ReturnMoneySelect(props: PropType) {
  const {
    totalAmountNeedToPay,
    isShowButtonReturnMoney,
    setReturnMoneyNote,
    setReturnMoneyMethod,
    handleReturnMoney,
  } = props;

  const dispatch = useDispatch();

  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);

  useEffect(() => {
    /**
     * payment method bỏ tiêu điểm và qr pay và card
     */
    const exceptMethods = [
      PaymentMethodCode.QR_CODE,
      PaymentMethodCode.POINT,
      PaymentMethodCode.CARD,
    ];
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter((single) => {
          return !exceptMethods.includes(single.code);
        });
        setListPaymentMethods(result);
      })
    );
  }, [dispatch]);

  return (
    <div>
      <Row gutter={30}>
        <Col span={12}>
          <Form.Item label="Phương thức thanh toán" name="to_birthday">
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn hình thức thanh toán"
              notFoundContent="Không tìm thấy hình thức thanh toán"
              onChange={(value: number) => {
                if (setReturnMoneyMethod && value) {
                  let selectedPaymentMethod = listPaymentMethods.find(
                    (single) => {
                      return single.id === value;
                    }
                  );
                  if (selectedPaymentMethod) {
                    setReturnMoneyMethod(selectedPaymentMethod);
                  }
                }
              }}
            >
              {listPaymentMethods &&
                listPaymentMethods.map((single) => {
                  return (
                    <Select.Option value={single.id} key={single.id}>
                      {single.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          Số tiền
          <Input value={formatCurrency(totalAmountNeedToPay)} disabled />
        </Col>
        <Col span={12}>
          <Input
            placeholder="Nội dung"
            onChange={(e) => {
              if (setReturnMoneyNote) {
                setReturnMoneyNote(e.target.value);
              }
            }}
          />
        </Col>
        {isShowButtonReturnMoney && (
          <Col span={12}>
            <Button
              onClick={() => {
                handleReturnMoney();
              }}
            >
              Xác nhận hoàn tiền
            </Button>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default ReturnMoneySelect;
