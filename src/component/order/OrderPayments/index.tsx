import { ArrowLeftOutlined, BugOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Input, Row, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import Cash from "component/icon/Cash";
import CreditCardOutlined from "component/icon/CreditCardOutlined";
import MomoOutlined from "component/icon/MomoOutlined";
import QrcodeOutlined from "component/icon/QrcodeOutlined";
import VnPayOutline from "component/icon/VnpayOutlined";
import YdCoin from "component/icon/YdCoin";
import {
  changeIfPaymentAlreadyChangedAction,
  changeSelectedStoreBankAccountAction,
  setIsExportBillAction,
} from "domain/actions/order/order.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderPaymentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatCurrency, getAmountPaymentRequest, replaceFormatString } from "utils/AppUtils";
import { PaymentMethodCode } from "utils/Constants";
import { dangerColor, yellowColor } from "utils/global-styles/variables";
import { ORDER_PAYMENT_STATUS } from "utils/Order.constants";
import {
  checkIfBankPayment,
  checkIfMomoPayment,
  checkIfOrderHasNotFinishedPaymentMomo,
  checkIfPointPayment,
} from "utils/OrderUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  payments: OrderPaymentRequest[];
  totalAmountOrder: number;
  levelOrder?: number;
  loyaltyRate?: LoyaltyRateResponse | null;
  listPaymentMethod: PaymentMethodResponse[];
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  orderDetail: OrderResponse | null | undefined;
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
function OrderPayments(props: PropTypes): JSX.Element {
  const {
    totalAmountOrder,
    levelOrder = 0,
    payments,
    loyaltyRate,
    listPaymentMethod,
    setPayments,
    orderDetail,
  } = props;

  console.log("totalAmountOrder", totalAmountOrder);

  const dispatch = useDispatch();

  const storeBankAccountNumbers = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.storeBankAccountNumbers
  );

  const selectedStoreBankAccount = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.selectedStoreBankAccount
  );

  const isExportBill = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.isExportBill
  );

  const paymentMethods = useMemo(() => {
    // return listPaymentMethod.filter((item) => item.code !== PaymentMethodCode.CARD);
    return listPaymentMethod.filter((item) => item.code);
  }, [listPaymentMethod]);

  const usageRate = useMemo(() => {
    let usageRate = loyaltyRate?.usage_rate ? loyaltyRate.usage_rate : 0;
    return usageRate;
  }, [loyaltyRate]);

  const isPaymentAlreadyChanged = useSelector(
    (state: RootReducerType) => state.orderReducer.orderPayment.isAlreadyChanged
  );

  const handlePayment = useCallback(
    (payments: OrderPaymentRequest[]) => {
      let paymentsResult = [...payments].map((payment) => ({
        ...payment,
        amount: Math.round(payment.amount),
        paid_amount: Math.round(payment.paid_amount),
        return_amount: Math.round(payment.return_amount),
        status: checkIfMomoPayment(payment)
          ? ORDER_PAYMENT_STATUS.unpaid
          : ORDER_PAYMENT_STATUS.paid,
      }));
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
      if (!isPaymentAlreadyChanged) {
        dispatch(changeIfPaymentAlreadyChangedAction(true));
      }
    },
    [dispatch, isPaymentAlreadyChanged, setPayments]
  );

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPaymentRequest(payments);

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
    let paymentMaster = paymentMethods.find((p) => payment_method_id === p.id);

    if (!paymentMaster) return;
    let indexPayment = payments.findIndex((p) => p.payment_method_id === payment_method_id);
    if (indexPayment === -1) {
      payments.push({
        payment_method_id: paymentMaster.id,
        amount: 0,
        paid_amount: 0,
        return_amount: 0,
        status: ORDER_PAYMENT_STATUS.paid,
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
    const main = {
      handleDefault(payment: OrderPaymentRequest, amount: number) {
        payment.amount = amount;
        payment.paid_amount = amount;
      },
      handleInputMoneyPoint(payment: OrderPaymentRequest, point: number) {
        if (checkIfPointPayment(payment)) {
          payment.point = point;
          payment.amount = point * usageRate;
          payment.paid_amount = point * usageRate;
        }
      },
      handleInputMoneyBank(payment: OrderPaymentRequest, amount: number) {
        if (checkIfBankPayment(payment)) {
          const selected = storeBankAccountNumbers.find(
            (single) => single.account_number === selectedStoreBankAccount
          );
          payment.bank_account_holder = selected?.account_holder || undefined;
          payment.bank_account_id = selected?.id || undefined;
          payment.bank_account_number = selected?.account_number;
          payment.amount = amount;
          payment.paid_amount = amount;
        }
      },
      handleInputMoneyMomo(payment: OrderPaymentRequest, amount: number) {
        if (checkIfMomoPayment(payment)) {
          payment.amount = amount;
          payment.paid_amount = amount;
        }
      },
    };
    main.handleDefault(payments[index], amount);
    main.handleInputMoneyPoint(payments[index], amount);
    main.handleInputMoneyBank(payments[index], amount);
    main.handleInputMoneyMomo(payments[index], amount);

    handlePayment([...payments]);
  };

  const handleTransferReference = (index: number, value: string) => {
    const _paymentData = [...payments];
    _paymentData[index].reference = value;
    handlePayment(_paymentData);
  };

  const handleFillInputMoney = (code?: string) => {
    if (code && code.length === 0) return;
    let paymentCopy: OrderPaymentRequest[] = payments;
    let indexPayment = paymentCopy.findIndex((x) => x.payment_method_code === code);

    if (indexPayment !== -1) {
      if (paymentCopy[indexPayment].payment_method_code === PaymentMethodCode.POINT) {
        let addPoint = Math.round(totalAmountCustomerNeedToPay / usageRate);
        let point = paymentCopy[indexPayment].point
          ? paymentCopy[indexPayment].point
          : 0 + addPoint;

        paymentCopy[indexPayment].point = point;

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

  const onChangeStoreBankAccountNumber = (value: string) => {
    if (value) {
      dispatch(changeSelectedStoreBankAccountAction(value));
    } else {
      dispatch(changeSelectedStoreBankAccountAction(undefined));
    }
    let paymentCopy: OrderPaymentRequest[] = payments;
    let paymentBankIndex = paymentCopy.findIndex(
      (single) => single.payment_method_code === PaymentMethodCode.BANK_TRANSFER
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
      (single) => single.account_number === selectedStoreBankAccount
    );
  }, [selectedStoreBankAccount, storeBankAccountNumbers]);

  const renderDefaultReference = (index: number) => {
    return (
      <Col className="defaultReference" lg={15} xxl={15}>
        <div>
          <Input
            placeholder="Tham chiếu"
            onChange={(e: any) => handleTransferReference(index, e.target.value)}
            disabled={levelOrder > 2}
          />
        </div>
      </Col>
    );
  };

  const renderBankTransferReference = (index: number) => {
    return (
      <Col className="bankReference" lg={15} xxl={15}>
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
          className="bankReference__section"
          title={`${selectedStoreBankNumber?.account_number} - ${selectedStoreBankNumber?.bank_name}`}>
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
            disabled={!isExportBill && false}>
            {storeBankAccountNumbers.map((value, index) => (
              <Select.Option
                key={value.account_number}
                value={value.account_number}
                title={`${value.account_number} - ${value.bank_name}`}>
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

  const renderExportBillCheckbox = (method: OrderPaymentRequest) => {
    if (method.payment_method_code === PaymentMethodCode.BANK_TRANSFER) {
      return (
        <div className="exportBill">
          <Checkbox
            checked={isExportBill}
            onChange={(e) => {
              handleSwitchCheckHoaDon(e.target.checked);
            }}
            className="iconCheckbox">
            Xuất hóa đơn
          </Checkbox>
        </div>
      );
    }
  };

  const getPaymentIcon = (method: PaymentMethodResponse) => {
    let icon = null;
    switch (method.code) {
      case PaymentMethodCode.CASH:
        icon = <Cash paymentData={payments} method={method} />;
        break;
      case PaymentMethodCode.CARD:
      case PaymentMethodCode.BANK_TRANSFER:
        icon = <CreditCardOutlined paymentData={payments} method={method} />;
        break;
      case PaymentMethodCode.QR_CODE:
        icon = <QrcodeOutlined paymentData={payments} method={method} />;
        break;
      case PaymentMethodCode.POINT:
        icon = <YdCoin paymentData={payments} method={method} />;
        break;
      case PaymentMethodCode.MOMO:
        icon = <MomoOutlined paymentData={payments} method={method} />;
        break;
      case PaymentMethodCode.VN_PAY:
        icon = <VnPayOutline paymentData={payments} method={method} />;
        break;
      default:
        icon = <BugOutlined style={{ fontSize: 15 }} />;
        break;
    }
    return icon;
  };

  const renderRowPrice = () => {
    return (
      <Row gutter={30} className="rowPrice">
        <Col lg={15} xxl={8} className="row-large-title rowPrice__title">
          <b>Khách cần trả:</b>
        </Col>
        <Col className="lbl-money rowPrice__amount" lg={6} xxl={6}>
          <div className="rowPriceAmountWrapper">
            <span className="t-result-blue">{formatCurrency(totalAmountOrder)}</span>
          </div>
        </Col>
      </Row>
    );
  };

  const renderPointSpending = (method: OrderPaymentRequest, index: number) => {
    if (method.payment_method_code === PaymentMethodCode.POINT) {
      return (
        <Col className="point-spending">
          <span> (1 điểm = {formatCurrency(usageRate)}₫)</span>
          <NumberInput
            value={method.point}
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            className="hide-number-handle pointSpendingInput"
            onFocus={(e) => e.target.select()}
            min={0}
            max={totalAmountOrder / usageRate}
            onChange={(value) => {
              handleInputPoint(index, value);
            }}
            disabled={levelOrder > 2}
          />
        </Col>
      );
    }
  };

  const renderPaymentReference = (method: OrderPaymentRequest, index: number) => {
    if (method.payment_method_code === PaymentMethodCode.BANK_TRANSFER) {
      return renderBankTransferReference(index);
    }
    const paymentMethodReferenceArr = [
      PaymentMethodCode.QR_CODE,
      PaymentMethodCode.MOMO,
      PaymentMethodCode.VN_PAY,
    ];
    if (
      method.payment_method_code &&
      paymentMethodReferenceArr.includes(method.payment_method_code)
    ) {
      return renderDefaultReference(index);
    }
  };

  const renderPaymentDetailLeft = (method: OrderPaymentRequest, index: number) => {
    return (
      <Col lg={15} xxl={8} className="rowPayment__left">
        <Row align="middle" className="rowPaymentLeft__wrapper">
          <b className="paymentTitle">{method.payment_method}:</b>
          {renderPointSpending(method, index)}
          {renderPaymentReference(method, index)}
        </Row>
      </Col>
    );
  };

  const renderPaymentDetailRight = (method: OrderPaymentRequest, index: number) => {
    if (method.payment_method_code !== PaymentMethodCode.POINT) {
      return (
        <Col className="lbl-money paymentDetailRight" lg={6} xxl={6}>
          <Input.Group compact className="inputMoneyGroup">
            <NumberInput
              min={0}
              value={method.paid_amount}
              disabled={
                method.payment_method_code === PaymentMethodCode.POINT ||
                levelOrder > 2 ||
                (method.payment_method_code === PaymentMethodCode.BANK_TRANSFER &&
                  storeBankAccountNumbers.length === 0 &&
                  false) ||
                (method.payment_method_code === PaymentMethodCode.MOMO && !totalAmountOrder)
              }
              className="yody-payment-input hide-number-handle"
              //placeholder="Nhập tiền mặt"
              format={(a: string) => formatCurrency(a)}
              replace={(a: string) => replaceFormatString(a)}
              onChange={(value) => {
                handleInputMoney(index, value);
              }}
              onFocus={(e) => e.target.select()}
            />
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                handleFillInputMoney(method.payment_method_code);
              }}
              disabled={
                method.payment_method_code === PaymentMethodCode.POINT ||
                levelOrder > 2 ||
                (method.payment_method_code === PaymentMethodCode.BANK_TRANSFER &&
                  storeBankAccountNumbers.length === 0 &&
                  false)
              }
              className="fillMoneyButton"
            />
          </Input.Group>
          {renderExportBillCheckbox(method)}
        </Col>
      );
    }
    return (
      <Col className="lbl-money rowPrice__amount" lg={6} xxl={6}>
        <div className="rowPriceAmountWrapper">
          <span>{formatCurrency(method.paid_amount)}</span>
        </div>
      </Col>
    );
  };

  const renderPayments = () => {
    return payments.map((method, index) => {
      return (
        <Row
          gutter={30}
          className={`row-price rowPayment ${
            method.payment_method_code === PaymentMethodCode.BANK_TRANSFER
              ? "paymentBank"
              : undefined
          } `}
          key={method.payment_method_code}>
          {renderPaymentDetailLeft(method, index)}
          {renderPaymentDetailRight(method, index)}
        </Row>
      );
    });
  };

  const renderPaymentMethodPicker = () => {
    return (
      <Col xs={24} lg={24}>
        <Row className="btn-list-method" gutter={5} align="middle">
          {paymentMethods.map((method, index) => {
            let icon = getPaymentIcon(method);
            return (
              <Col key={method.code} className="btn-payment-method">
                <Button
                  type={
                    payments.some(
                      (p) =>
                        p.code === method.code ||
                        p.payment_method.toLowerCase() === method.code.toLowerCase() ||
                        p.payment_method_id === method.id
                    )
                      ? "primary"
                      : "default"
                  }
                  value={method.id}
                  icon={icon}
                  onClick={() => {
                    handlePickPaymentMethod(method.id);
                  }}
                  className="paymentButton 34"
                  disabled={
                    levelOrder > 2 ||
                    (method.code === PaymentMethodCode.MOMO &&
                      checkIfOrderHasNotFinishedPaymentMomo(orderDetail)) ||
                    method.code === PaymentMethodCode.VN_PAY
                  }>
                  {method.name}
                </Button>
              </Col>
            );
          })}
        </Row>
      </Col>
    );
  };

  const renderPaymentMethodDetail = () => {
    return (
      <Col span={22} xs={22}>
        {renderRowPrice()}
        {renderPayments()}
        <Row gutter={30} className="row-price rowPayment rowLeftAmount 32">
          <Col lg={15} xxl={8} className="rowLeftAmount__title">
            <b>{totalAmountCustomerNeedToPay >= 0 ? "Còn phải trả:" : "Tiền thừa:"}</b>
          </Col>
          <Col className="lbl-money rowLeftAmount__amount" lg={6} xxl={6}>
            <span style={{ color: totalAmountCustomerNeedToPay < 0 ? yellowColor : dangerColor }}>
              {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
            </span>
          </Col>
        </Row>
      </Col>
    );
  };

  useEffect(() => {
    const removeCodFromPayments = () => {
      if (payments.some((payment) => payment.payment_method_code === PaymentMethodCode.COD)) {
        let _payments = payments.filter(
          (single) => single.payment_method_code !== PaymentMethodCode.COD
        );
        handlePayment(_payments);
      }
    };
    removeCodFromPayments();
  }, [payments, handlePayment]);

  // console.log(paymentMethods)
  return (
    <StyledComponent>
      {renderPaymentMethodPicker()}
      {renderPaymentMethodDetail()}
    </StyledComponent>
  );
}

export default OrderPayments;
