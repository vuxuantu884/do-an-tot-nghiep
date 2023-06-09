// import { BugOutlined } from "@ant-design/icons";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Divider, Input, Row, Select } from "antd";
// import Cash from "component/icon/Cash";
// import CreditCardOutlined from "component/icon/CreditCardOutlined";
// import QrcodeOutlined from "component/icon/QrcodeOutlined";
// import YdCoin from "component/icon/YdCoin";
import { OrderPaymentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useCallback, useEffect, useMemo } from "react";
import { formatCurrency, getAmountPayment, replaceFormatString } from "utils/AppUtils";
import { PaymentMethodCode } from "utils/Constants";
import { StyledComponent } from "./styles";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  changeSelectedStoreBankAccountAction,
  setIsExportBillAction,
} from "domain/actions/order/order.action";
import NumberInput from "component/custom/number-input.custom";
import { yellowColor } from "utils/global-styles/variables";

type PropType = {
  payments: OrderPaymentRequest[];
  totalAmountOrder: number;
  levelOrder?: number;
  loyaltyRate?: LoyaltyRateResponse | null;
  listPaymentMethod: PaymentMethodResponse[];
  setPayments: (value: Array<OrderPaymentRequest>) => void;
};

/**
 * payments: payment mặc định (vd trường hợp clone đơn hàng)
 *
 * listPaymentMethod: danh sách payment method
 *
 * setPayments: xử lý khi điền payment
 *
 * loyaltyRate:  loyalty
 *
 * totalAmountOrder: tiền đơn hàng
 *
 * levelOrder: phân quyền
 */
function OrderPayments(props: PropType): JSX.Element {
  const {
    totalAmountOrder,
    levelOrder = 0,
    payments,
    loyaltyRate,
    listPaymentMethod,
    setPayments,
  } = props;

  const dispatch = useDispatch();

  const storeBankAccountNumbers = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.storeBankAccountNumbers,
  );

  const selectedStoreBankAccount = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.selectedStoreBankAccount,
  );

  const isExportBill = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.isExportBill,
  );

  const ListPaymentMethods = useMemo(() => {
    return listPaymentMethod.filter((item) => {
      return (
        item.code !== PaymentMethodCode.CARD &&
        item.code !== PaymentMethodCode.VN_PAY &&
        item.code !== PaymentMethodCode.CASH
      );
    });
  }, [listPaymentMethod]);

  const usageRate = useMemo(() => {
    return loyaltyRate?.usage_rate ? loyaltyRate.usage_rate : 0;
  }, [loyaltyRate]);

  const handlePayment = useCallback(
    (payments: OrderPaymentRequest[]) => {
      let paymentsResult = [...payments];
      // let bankPaymentIndex = paymentsResult.findIndex((payment)=>payment.payment_method_code===PaymentMethodCode.BANK_TRANSFER);
      // if(bankPaymentIndex > -1) {
      //   if(selectedStoreBankAccount) {
      //     let abc = storeBankAccountNumbers.find(single => single.account_number === selectedStoreBankAccount);
      //     if(abc) {
      //       paymentsResult[bankPaymentIndex].bank_account_id = abc.id;
      //       paymentsResult[bankPaymentIndex].bank_account_number = abc.account_number;
      //       paymentsResult[bankPaymentIndex].bank_account_holder = abc.account_holder;

      //     }
      //   } else {
      //     paymentsResult[bankPaymentIndex].paid_amount = 0;
      //     paymentsResult[bankPaymentIndex].amount = 0;
      //     paymentsResult[bankPaymentIndex].return_amount = 0;
      //   }
      // }
      setPayments(paymentsResult);
    },
    [setPayments],
  );

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPayment(payments);

  const totalAmountCustomerNeedToPay = useMemo(() => {
    return totalAmountOrder - totalAmountPayment;
  }, [totalAmountOrder, totalAmountPayment]);

  const handleInputPoint = (index: number, point: number | null) => {
    if (!point) {
      point = 0;
    }
    payments[index].point = point;
    payments[index].amount = point * usageRate;
    payments[index].paid_amount = point * usageRate;
    payments[index].payment_method_code = PaymentMethodCode.POINT;
    handlePayment([...payments]);
  };

  const handlePickPaymentMethod = (payment_method_id?: number) => {
    let paymentMaster = ListPaymentMethods.find((p) => payment_method_id === p.id);

    if (!paymentMaster) return;
    let indexPayment = payments.findIndex((p) => p.payment_method_id === payment_method_id);
    if (indexPayment === -1) {
      payments.push({
        payment_method_id: paymentMaster.id,
        amount: 0,
        paid_amount: 0,
        return_amount: 0,
        status: "paid",
        name: paymentMaster.name,
        payment_method_code: paymentMaster.code,
        payment_method: paymentMaster.name,
        reference: "",
        source: "",
        customer_id: 1,
        note: "",
        type: "",
      });
    } else {
      payments.splice(indexPayment, 1);
    }
    handlePayment([...payments]);
  };

  const handleInputMoney = (index: number, amount: number | null) => {
    if (!amount) {
      amount = 0;
    }
    if (payments[index].payment_method_code === PaymentMethodCode.POINT) {
      payments[index].point = amount;
      payments[index].amount = amount * usageRate;
      payments[index].paid_amount = amount * usageRate;
    } else {
      payments[index].amount = amount;
      payments[index].paid_amount = amount;
      if (payments[index].payment_method_code === PaymentMethodCode.BANK_TRANSFER) {
        const selected = storeBankAccountNumbers.find(
          (single) => single.account_number === selectedStoreBankAccount,
        );
        payments[index].bank_account_holder = selected?.account_holder || undefined;
        payments[index].bank_account_id = selected?.id || undefined;
        payments[index].bank_account_number = selected?.account_number;
      }
    }
    handlePayment([...payments]);
  };

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...payments];
    _paymentData[index].reference = value;
    handlePayment(_paymentData);
  };

  const fillInputMoney = (code?: string) => {
    if (code && code.length === 0) return;
    let paymentCopy: OrderPaymentRequest[] = payments;
    let indexPayment = paymentCopy.findIndex((x) => x.payment_method_code === code);

    if (indexPayment !== -1) {
      if (paymentCopy[indexPayment].payment_method_code === PaymentMethodCode.POINT) {
        let addPoint = Math.round(totalAmountCustomerNeedToPay / usageRate);
        paymentCopy[indexPayment].point = paymentCopy[indexPayment].point
          ? paymentCopy[indexPayment].point
          : addPoint;

        let amount = paymentCopy[indexPayment].amount + addPoint * usageRate;
        let paid_amount = paymentCopy[indexPayment].paid_amount + addPoint * usageRate;

        paymentCopy[indexPayment].amount = amount;
        paymentCopy[indexPayment].paid_amount = paid_amount;
      } else {
        let amount = paymentCopy[indexPayment].amount + totalAmountCustomerNeedToPay;
        if (amount < 0) {
          amount = 0;
        }
        let paid_amount = paymentCopy[indexPayment].paid_amount + totalAmountCustomerNeedToPay;
        if (paid_amount < 0) {
          paid_amount = 0;
        }
        paymentCopy[indexPayment].amount = amount;
        paymentCopy[indexPayment].paid_amount = paid_amount;
      }
    }

    handlePayment([...paymentCopy]);
  };

  // Xử lý phương thức thanh toán bằng chuyển khoản
  const onChangeStoreBankAccountNumber = (value: string) => {
    if (value) {
      dispatch(changeSelectedStoreBankAccountAction(value));
    } else {
      dispatch(changeSelectedStoreBankAccountAction(undefined));
    }
    let paymentCopy: OrderPaymentRequest[] = payments;
    let paymentBankIndex = paymentCopy.findIndex(
      (single) => single.payment_method_code === PaymentMethodCode.BANK_TRANSFER,
    );
    const selected = storeBankAccountNumbers.find((single) => single.account_number === value);
    if (paymentBankIndex > -1) {
      paymentCopy[paymentBankIndex].bank_account_holder = selected?.account_holder || undefined;
      paymentCopy[paymentBankIndex].bank_account_id = selected?.id || undefined;
      paymentCopy[paymentBankIndex].bank_account_number = selected?.account_number;
    }
    setPayments([...paymentCopy]);
  };

  const selectedStoreBankNumber = useMemo(() => {
    return storeBankAccountNumbers.find(
      (single) => single.account_number === selectedStoreBankAccount,
    );
  }, [selectedStoreBankAccount, storeBankAccountNumbers]);

  const renderBankTransferTitle = (index: number) => {
    return (
      <Col className="point-spending" style={{ marginLeft: 12 }} lg={15} xxl={15}>
        <div>
          <Input
            placeholder="Tham chiếu"
            onChange={(e: any) => handleTransferReference(index, e.target.value)}
            disabled={
              levelOrder > 2
              // ||
              // storeBankAccountNumbers.length === 0
            }
          />
        </div>
        <div
          style={{ marginTop: 12 }}
          title={`${selectedStoreBankNumber?.account_number} - ${selectedStoreBankNumber?.bank_name}`}
        >
          <Select
            showSearch
            allowClear
            onChange={onChangeStoreBankAccountNumber}
            filterOption={(input, option: any) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
            style={{ width: "100%" }}
            placeholder="Chọn số tài khoản"
            value={selectedStoreBankAccount?.toString()}
            notFoundContent="Không tìm thấy số tài khoản của cửa hàng!"
            disabled={!isExportBill && false}
          >
            {storeBankAccountNumbers.map((value) => (
              <Select.Option
                key={value.account_number}
                value={value.account_number}
                title={`${value.account_number} - ${value.bank_name}`}
              >
                {value.account_number} - {value.bank_name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Col>
    );
  };

  const handleSwitchCheckHoaDon = (value: boolean) => {
    dispatch(setIsExportBillAction(value));
  };

  const renderExportBill = () => {
    return (
      // Ẩn xuất hóa đơn
      <div hidden style={{ marginTop: 12, padding: "6px 0" }} className="exportBill">
        <Checkbox
          checked={isExportBill}
          onChange={(e) => {
            handleSwitchCheckHoaDon(e.target.checked);
          }}
          style={{ marginRight: 8 }}
        >
          Xuất hóa đơn
        </Checkbox>
      </div>
    );
  };

  useEffect(() => {
    if (payments.some((payment) => payment.payment_method_code === PaymentMethodCode.COD)) {
      let _payments = payments.filter(
        (single) => single.payment_method_code !== PaymentMethodCode.COD,
      );
      handlePayment(_payments);
    }
  }, [payments, handlePayment]);

  const checkDisablePaymentMethodButton = useCallback(
    (method) => {
      return (
        levelOrder > 2 ||
        (method.code?.toLowerCase() === PaymentMethodCode.MOMO && totalAmountOrder <= 0)
      );
    },
    [levelOrder, totalAmountOrder],
  );

  //Xóa bỏ momo payment method nếu số tiền Khách cần phải trả nhỏ hơn hoặc bằng 0
  useEffect(() => {
    if (totalAmountOrder <= 0) {
      const momoPaymentIndex = payments.findIndex(
        (item) => item.payment_method_code?.toLowerCase() === PaymentMethodCode.MOMO,
      );
      if (momoPaymentIndex !== -1) {
        payments.splice(momoPaymentIndex, 1);
      }
      handlePayment([...payments]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmountOrder]);

  return (
    <StyledComponent>
      <Col span={24} style={{ padding: 0 }}>
        <div style={{ margin: "6px 12px" }}>
          <Divider />
        </div>
        <Row
          className="btn-list-method"
          gutter={5}
          align="middle"
          style={{ marginLeft: 0, marginRight: 0 }}
        >
          {ListPaymentMethods.map((method) => {
            // let icon = null;
            // switch (method.code) {
            //   case PaymentMethodCode.CASH:
            //     icon = <Cash paymentData={payments} method={method} />;
            //     break;
            //   case PaymentMethodCode.CARD:
            //   case PaymentMethodCode.BANK_TRANSFER:
            //     icon = <CreditCardOutlined paymentData={payments} method={method} />;
            //     break;
            //   case PaymentMethodCode.QR_CODE:
            //     icon = <QrcodeOutlined paymentData={payments} method={method} />;
            //     break;
            //   case PaymentMethodCode.POINT:
            //     icon = <YdCoin paymentData={payments} method={method} />;
            //     break;
            //   default:
            //     icon = <BugOutlined />;
            //     break;
            // }
            return (
              <Col key={method.code} className="btn-payment-method">
                <Button
                  type={
                    payments.some(
                      (p) =>
                        p.code === method.code ||
                        p.payment_method.toLowerCase() === method.code.toLowerCase() ||
                        p.payment_method_id === method.id,
                    )
                      ? "primary"
                      : "default"
                  }
                  value={method.id}
                  // icon={icon}
                  onClick={() => {
                    handlePickPaymentMethod(method.id);
                  }}
                  disabled={checkDisablePaymentMethodButton(method)}
                >
                  {method.name}
                </Button>
              </Col>
            );
          })}
        </Row>
      </Col>

      <Col span={24}>
        <Row gutter={24} style={{ margin: "8px 0", alignItems: "center" }}>
          <Col span={10} style={{ padding: "0" }}>
            <b>Khách cần trả:</b>
          </Col>
          <Col
            span={14}
            style={{
              textAlign: "right",
              fontWeight: 500,
              fontSize: "20px",
              padding: "0",
            }}
          >
            <span className="t-result-blue">{formatCurrency(totalAmountOrder)}</span>
          </Col>
        </Row>

        {payments.map((method, index) => {
          return (
            <Row
              gutter={20}
              className="row-price"
              key={index}
              style={{ justifyContent: "space-between", margin: "8px 0" }}
            >
              <Col lg={15} xxl={9} style={{ padding: "0" }}>
                <Row align="middle">
                  <b style={{ padding: "8px 0" }}>{method.payment_method}:</b>

                  {method.payment_method_code === PaymentMethodCode.POINT ? (
                    <Col className="point-spending">
                      <span
                        style={{
                          marginLeft: 5,
                        }}
                      >
                        {" "}
                        (1 điểm = {formatCurrency(usageRate)}₫)
                      </span>
                      <NumberInput
                        value={method.point}
                        style={{
                          width: 60,
                          height: 32,
                          marginLeft: 10,
                          borderRadius: 5,
                          padding: 5,
                        }}
                        format={(a: string) => formatCurrency(a)}
                        replace={(a: string) => replaceFormatString(a)}
                        className="hide-number-handle"
                        onFocus={(e) => e.target.select()}
                        min={0}
                        max={totalAmountOrder / usageRate}
                        onChange={(value) => {
                          handleInputPoint(index, value);
                        }}
                        disabled={levelOrder > 2}
                      />
                    </Col>
                  ) : null}

                  {method.payment_method_code === PaymentMethodCode.BANK_TRANSFER ? (
                    <Col className="point-spending" style={{ marginLeft: 10 }} lg={14} xxl={14}>
                      <Input
                        style={{
                          width: 110,
                          height: 32,
                          padding: 5,
                        }}
                        placeholder="Tham chiếu"
                        onChange={(e: any) => handleTransferReference(index, e.target.value)}
                        disabled={levelOrder > 2}
                      />
                    </Col>
                  ) : null}

                  {/*Ẩn chọn số tài khoản*/}
                  {false && method.payment_method_code === PaymentMethodCode.BANK_TRANSFER
                    ? renderBankTransferTitle(index)
                    : null}
                </Row>
              </Col>

              {method.payment_method_code !== PaymentMethodCode.POINT ? (
                <Col className="lbl-money" lg={6} xxl={6} style={{ padding: 0 }}>
                  <Input.Group compact>
                    <NumberInput
                      min={0}
                      value={method.paid_amount}
                      disabled={
                        method.payment_method_code === PaymentMethodCode.POINT || levelOrder > 2
                      }
                      className="yody-payment-input hide-number-handle"
                      placeholder="Nhập tiền mặt"
                      style={{
                        textAlign: "right",
                        width: 100,
                        height: 32,
                        borderRadius: 5,
                        padding: 5,
                      }}
                      format={(a: string) => formatCurrency(a)}
                      replace={(a: string) => replaceFormatString(a)}
                      onChange={(value) => {
                        handleInputMoney(index, value);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                    <Button
                      style={{
                        width: 32,
                        height: 32,
                        lineHeight: "unset",
                        margin: 0,
                      }}
                      type="default"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => {
                        fillInputMoney(method.payment_method_code);
                      }}
                      disabled={
                        method.payment_method_code === PaymentMethodCode.POINT || levelOrder > 2
                      }
                    />
                  </Input.Group>
                  {/*Ẩn xuất hóa đơn*/}
                  {method.payment_method_code === PaymentMethodCode.BANK_TRANSFER
                    ? renderExportBill()
                    : null}
                </Col>
              ) : (
                <Col
                  className="lbl-money"
                  lg={6}
                  xxl={6}
                  style={{
                    padding: "8px 0",
                    textAlign: "right",
                    marginLeft: 10,
                  }}
                >
                  <span style={{ padding: 0, lineHeight: 1 }}>
                    {formatCurrency(method.paid_amount)}
                  </span>
                </Col>
              )}
            </Row>
          );
        })}

        <Row gutter={24} style={{ margin: "8px 0", alignItems: "center" }}>
          <Col span={10} style={{ padding: "0" }}>
            <b>{totalAmountCustomerNeedToPay >= 0 ? "Còn phải trả:" : "Tiền thừa:"}</b>
          </Col>
          <Col
            span={14}
            style={{
              textAlign: "right",
              fontWeight: 500,
              fontSize: "20px",
              padding: 0,
            }}
          >
            <span
              style={{
                color: totalAmountCustomerNeedToPay < 0 ? yellowColor : "red",
              }}
            >
              {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
            </span>
          </Col>
        </Row>
      </Col>
    </StyledComponent>
  );
}

export default OrderPayments;
