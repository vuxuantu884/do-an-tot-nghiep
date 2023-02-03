import UrlConfig from "config/url.config";
import { HandoverResponse } from "model/handover/handover.response";
import { OrderModel } from "model/order/order.model";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { HandoverReturn, HandoverTransfer } from "screens/handover/handover.config";

type Props = {
  handOvers: HandoverResponse[];
};

const OrderMapHandOver: React.FC<Props> = (props: Props) => {
  const { handOvers } = props;

  return (
    <React.Fragment>
      {handOvers && handOvers.length !== 0 ? (
        handOvers.map((p) => {
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
