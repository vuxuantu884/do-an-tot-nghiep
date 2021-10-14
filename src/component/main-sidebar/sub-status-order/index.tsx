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
  subStatusId?: number | null;
  status?: string | null;
  orderId?: number;
  fulfillments?: FulFillmentResponse[] | null;
  handleUpdateSubStatus: () => void;
};

function SubStatusOrder(props: PropType): React.ReactElement {
  const { status, orderId, fulfillments, subStatusId, handleUpdateSubStatus } =
    props;
  const dispatch = useDispatch();
  const [listOrderSubStatus, setListOrderSubStatus] = useState<
    OrderSubStatusResponse[]
  >([]);
  const [valueSubStatusId, setValueSubStatusId] = useState<number | undefined>(
    undefined
  );

  const handleChange = (statusId: number) => {
    if (orderId) {
      setValueSubStatusId(statusId);
      dispatch(setSubStatusAction(orderId, statusId, handleUpdateSubStatus));
    }
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

  useEffect(() => {
    if (subStatusId) {
      setValueSubStatusId(subStatusId);
    }
  }, [subStatusId]);

  return (
    <Card title="Xử lý đơn hàng">
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
        value={valueSubStatusId}
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
    </Card>
  );
}

export default SubStatusOrder;
