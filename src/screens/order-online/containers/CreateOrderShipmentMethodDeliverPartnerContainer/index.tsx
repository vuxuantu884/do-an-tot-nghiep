import { OrderCreateContext } from "contexts/order-online/order-create-context";
import { useContext } from "react";

type PropType = {};

function CreateOrderShipmentMethodDeliverPartnerContainer(props: PropType) {
  const createOrderContext = useContext(OrderCreateContext);
  console.log("createOrderContext", createOrderContext);
  return "11111";
}

export default CreateOrderShipmentMethodDeliverPartnerContainer;
