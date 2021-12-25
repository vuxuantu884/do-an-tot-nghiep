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
  subStatusCode?: string | undefined;
  status?: string | null;
  orderId?: number;
  fulfillments?: FulFillmentResponse[] | null;
  handleUpdateSubStatus: () => void;
	setReload: (value: boolean) => void;
};

function SubStatusOrder(props: PropType): React.ReactElement {
  const { status, orderId, fulfillments, subStatusCode, handleUpdateSubStatus, setReload } = props;
  const dispatch = useDispatch();
  const [listOrderSubStatus, setListOrderSubStatus] = useState<OrderSubStatusResponse[]>(
    []
  );
  const [valueSubStatusCode, setValueSubStatusCode] = useState<string | undefined>(undefined);

  const handleChange = (sub_status_code: string) => {
    
    if (orderId) {
      setValueSubStatusCode(sub_status_code);
      dispatch(setSubStatusAction(orderId, sub_status_code, ()=>{
				handleUpdateSubStatus();
				setReload(true)
			}));
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
      if (status === OrderStatus.FINALIZED && fulfillments && fulfillments.length > 0) {
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
        getListSubStatusAction(resultStatus, (data: OrderSubStatusResponse[]) => {
          // const moreSubStatus: OrderSubStatusResponse[] = [
          //   {
          //     id: 1,
          //     status: "Chờ xác nhận",
          //     company_id: DEFAULT_COMPANY.company_id,
          //     company: DEFAULT_COMPANY.company,
          //     sub_status: "Chờ xác nhận",
          //     note: "",
          //     is_active: true,
          //     is_delete: false,
          //   },
          // ];
          // let result = data.concat(moreSubStatus);
          // setListOrderSubStatus(result);
          setListOrderSubStatus(data);
        })
      );
    }
  }, [dispatch, fulfillments, status]);

  useEffect(() => {
    if (subStatusCode) {
      setValueSubStatusCode(subStatusCode);
    }
  }, [subStatusCode]);

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
        value={valueSubStatusCode}
        key={Math.random()}
      >
        {listOrderSubStatus &&
          listOrderSubStatus.map((single) => {
            return (
              <Select.Option value={single.code} key={single.code}>
                {single.sub_status}
              </Select.Option>
            );
          })}
      </Select>
    </Card>
  );
}

export default SubStatusOrder;
