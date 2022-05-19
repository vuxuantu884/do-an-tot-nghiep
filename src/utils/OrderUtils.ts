import { OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { PaymentMethodCode } from "./Constants";

export const isOrderDetailHasPointPayment = (OrderDetail: OrderResponse | null | undefined, paymentMethods: PaymentMethodResponse[]) => {
	const pointPaymentMethodId = paymentMethods.find(payment => payment.code === PaymentMethodCode.POINT)?.code;
	if(!pointPaymentMethodId) {
		return false;
	}
	if(!OrderDetail?.payments) {
		return false;
	}
	return OrderDetail?.payments?.some((single) => {
		return single.payment_method_code === pointPaymentMethodId;
	});
};

export const findPaymentMethodByCode = (paymentMethods: PaymentMethodResponse[], code: string) => {
	return paymentMethods.find(single => single.code === code)
};