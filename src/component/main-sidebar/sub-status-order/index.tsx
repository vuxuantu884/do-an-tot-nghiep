import { Card, Select } from "antd";
import {
  getListSubStatusAction,
  setSubStatusAction,
} from "domain/actions/order/order.action";
import { OrderSubStatusResponse } from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type PropType = {
  status?: string | null;
  orderId: number;
};

function SubStatusOrder(props: PropType): React.ReactElement {
  const { status, orderId } = props;
  const dispatch = useDispatch();
  const [listOrderSubStatus, setListOrderSubStatus] = useState<
    OrderSubStatusResponse[]
  >([]);

  const handleChange = (statusId: number) => {
    dispatch(setSubStatusAction(orderId, statusId));
  };

  useEffect(() => {
    if (status) {
      dispatch(
        getListSubStatusAction(status, (data: OrderSubStatusResponse[]) => {
          setListOrderSubStatus(data);
        })
      );
    }
  }, [dispatch, status]);
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
