import UrlConfig from "config/url.config";
import { HandoverResponse } from "model/handover/handover.response";
import { OrderModel } from "model/order/order.model";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { HandoverReturn, HandoverTransfer } from "screens/order-online/handover/handover.config";

type Props = {
  orderDetail: OrderModel;
  handOvers: HandoverResponse[];
};

const OrderMapHandOver: React.FC<Props> = (props: Props) => {
  const { orderDetail, handOvers } = props;
  // console.log("handOvers", handOvers);

  const result = useMemo(() => {
    const fulfillmentsCode = orderDetail.fulfillments?.map((p) => p.code);

    if (fulfillmentsCode) {
      const handOverData = [...handOvers].filter((p) =>
        p.orders?.some((p) => fulfillmentsCode.indexOf(p.fulfillment_code) !== -1),
      );
      // console.log(fulfillmentsCode, handOverData);

      return handOverData;
    }
    return [];
  }, [handOvers, orderDetail.fulfillments]);

  console.log(result);
  return (
    <React.Fragment>
      {result && result.length !== 0 ? (
        result.map((p) => {
          if (p.type === HandoverTransfer) {
            return (
              <div>
                Chuyển đi:{` `}
                <Link to={`${UrlConfig.HANDOVER}/${p.id}`} target="_blank">
                  {p.code}
                </Link>
              </div>
            );
          }
          if (p.type === HandoverReturn) {
            return (
              <div>
                Hoàn về:{` `}
                <Link to={`${UrlConfig.HANDOVER}/${p.id}`} target="_blank">
                  {p.code}
                </Link>
              </div>
            );
          }
          return <span>-</span>;
        })
      ) : (
        <span>-</span>
      )}
    </React.Fragment>
  );
};

export default OrderMapHandOver;
