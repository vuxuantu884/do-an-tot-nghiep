import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import CustomTable from "component/table/CustomTable";
import { getLoyaltyAdjustMoneyAction } from "domain/actions/loyalty/loyalty.action";

function CustomerCareHistory(props: any) {
  const { customer } = props;

  const dispatch = useDispatch();

  const [adjustPoint, setAdjustPoint] = useState<any>();

  const setAdjustPointData = React.useCallback(
    (data: any | false) => {
      if (!data) {
        return;
      }
      setAdjustPoint(data);
    },[]
  );

  useEffect(() => {
    if (customer?.id) {
      dispatch(getLoyaltyAdjustMoneyAction(customer?.id, setAdjustPointData, () => {}));
    }
  }, [dispatch, customer, setAdjustPointData]);

  
  const [columns] = useState<any>([
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      width: "5%",
      render: (value: any, row: any, index: any) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Mã phiếu",
      dataIndex: "id",
      width: "9%",
    },
    {
      title: "Kiểu điều chỉnh",
      dataIndex: "type",
      width: "12%",
      render: (value: any, row: any, index: any) => {
        let adjustmentType;
        switch(value) {
          case "ADD_POINT":
            adjustmentType = "Tặng điểm"
            break;
          case "SUBTRACT_POINT":
            adjustmentType = "Trừ điểm"
            break;
          case "ADD_MONEY":
            adjustmentType = "Tặng tiền"
            break;
          case "SUBTRACT_MONEY":
            adjustmentType = "Trừ tiền"
            break;
      }
        return <span>{adjustmentType}</span>;
      },
    },
    {
      title: "Giá trị",
      dataIndex: "value_change",
      width: 110,
      render: (value: any, row: any, index: any) => {
        const pointValue = value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        return <span>{pointValue}</span>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "reason",
      width: "15%",
    },
    {
      title: "Người điều chỉnh",
      dataIndex: "created_by",
      width: "15%",
      render: (value: any, item: any) => (
        <div>{value ? value + " - " : ""}{item.created_name ? item.created_name : ""}</div>
      ),
    },
    {
      title: "Ngày điều chỉnh",
      dataIndex: "created_date",
      width: "15%",
      render: (value: any, row: any, index: any) => {
        return <span>{ConvertUtcToLocalDate(value)}</span>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      render: (value: any) => {
        return (
          <div>{value ? value : ""}</div>
        )
      }
    }
  ]);  

  return (
    <CustomTable
      bordered
      pagination={false}
      dataSource={adjustPoint}
      columns={columns}
      rowKey={(item: any) => item.id}
      scroll={{ x: 1114 }}
    />
  );
}

export default CustomerCareHistory;
