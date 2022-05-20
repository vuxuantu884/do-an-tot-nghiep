import { Card } from "antd";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { RETURN_MONEY_TYPE } from "utils/Order.constants";
import ReturnMoneySelect from "../../ReturnMoneySelect";

type PropTypes = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  totalAmountCustomerNeedToPay?: number;
  returnMoneyType?: string;
  setReturnMoneyType?: (value: string) => void;
  returnPaymentMethodCode: string;
  setReturnPaymentMethodCode: (value: string) => void;
};

/**
 * input: listPaymentMethod, returnMoneyType
 * output: setReturnMoneyType
 * 
 * ghi chú: hiện tại ko cho hoàn tiền sau
 */
function CardReturnMoneyPageCreateReturn(props: PropTypes) {
  const {
    listPaymentMethods,
    totalAmountCustomerNeedToPay,
    returnMoneyType,
    setReturnPaymentMethodCode,
    returnPaymentMethodCode,
  } = props;

  console.log('totalAmountCustomerNeedToPay', totalAmountCustomerNeedToPay)

  return (
    <Card className="margin-top-20" title={<span className="title-card">Hoàn tiền</span>}>
      <div className="create-order-payment">
       {/* không cho hoàn tiền sau */}
        {/* <Radio.Group
          value={returnMoneyType}
          onChange={(e) => {
            if (setReturnMoneyType) {
              setReturnMoneyType(e.target.value);
            }
          }}
          style={{ margin: "0 0 18px 0" }}
        >
          <Space size={20}>
            <Radio value={RETURN_MONEY_TYPE.return_now}>Hoàn tiền </Radio>
            <Radio value={RETURN_MONEY_TYPE.return_later}>Hoàn tiền sau</Radio>
          </Space>
        </Radio.Group> */}
        {returnMoneyType === RETURN_MONEY_TYPE.return_now && (
          <ReturnMoneySelect
            listPaymentMethods={listPaymentMethods}
            totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay || 0}
            handleReturnMoney={() => {}}
            isShowButtonReturnMoney={false}
            setReturnPaymentMethodCode={setReturnPaymentMethodCode}
            returnPaymentMethodCode={returnPaymentMethodCode}
          />
        )}
      </div>
    </Card>
  );
}

export default CardReturnMoneyPageCreateReturn;
