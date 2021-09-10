import { Card, Select } from "antd";
import {
  getListSubStatusAction,
  setSubStatusAction,
} from "domain/actions/order/order.action";
import {
  FulFillmentResponse,
  OrderSubStatusResponse,
} from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { OrderStatus } from "utils/Constants";

type PropType = {
  subStatus?: number | null;
  status?: string | null;
  orderId: number;
  fulfillments?: FulFillmentResponse[] | null;
};

function SubStatusOrder(props: PropType): React.ReactElement {
  const { status, orderId, fulfillments, subStatus } = props;
  const dispatch = useDispatch();
  const [listOrderSubStatus, setListOrderSubStatus] = useState<
    OrderSubStatusResponse[]
  >([]);

  const handleChange = (statusId: number) => {
    dispatch(setSubStatusAction(orderId, statusId));
  };

  useEffect(() => {
    const listFulfillmentMapSubStatus = {
      packed: {
        fulfillmentStatus: "packed",
        subStatus: "packed",
      },
      finalized: {
        fulfillmentStatus: "shipping",
        subStatus: "shipping",
      },
    };
    if (status) {
      let resultStatus = status;
      if (
        status === OrderStatus.FINALIZED &&
        fulfillments &&
        fulfillments.length > 0
      ) {
        switch (fulfillments[0].status) {
          case listFulfillmentMapSubStatus.packed.fulfillmentStatus:
            resultStatus = listFulfillmentMapSubStatus.packed.subStatus;
            break;
          case listFulfillmentMapSubStatus.finalized.fulfillmentStatus:
            resultStatus = listFulfillmentMapSubStatus.finalized.subStatus;
            break;
          default:
            break;
        }
      }
      dispatch(
        getListSubStatusAction(
          resultStatus,
          (data: OrderSubStatusResponse[]) => {
            setListOrderSubStatus(data);
          }
        )
      );
    }
  }, [dispatch, fulfillments, status]);
  return (
    <Card
      className="margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">Xử lý đơn hàng</span>
        </div>
      }
    >
      <div className="padding-24">
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Chọn trạng thái phụ"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={handleChange}
          notFoundContent="Không tìm thấy trạng thái phụ"
          defaultValue={subStatus || undefined}
        >
          {listOrderSubStatus &&
            listOrderSubStatus.map((single) => {
              return (
                <Select.Option value={single.id} key={single.id}>
                  {single.sub_status}
                </Select.Option>
              );
            })}
        </Select>
      </div>
    </Card>
  );
}

export default SubStatusOrder;
