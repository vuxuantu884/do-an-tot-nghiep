import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import CustomTable from "component/table/CustomTable";
import { getLoyaltyAdjustPointAction } from "domain/actions/loyalty/loyalty.action";

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
    dispatch(getLoyaltyAdjustPointAction(customer?.id, setAdjustPointData, () => {}));
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
      dataIndex: "source",
      width: "12%",
      render: (value: any, row: any, index: any) => {
        const adjustmentType = value === "API_ADMIN_SUBTRACT" ? "Giảm" : "Tăng";
        return <span>{adjustmentType}</span>;
      },
    },
    {
      title: "Giá trị",
      dataIndex: "change_point",
      width: "7%",
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
    }
  ]);

  return (
    <CustomTable
      bordered
      pagination={false}
      dataSource={adjustPoint?.data}
      columns={columns}
      rowKey={(item: any) => item.id}
      scroll={{ x: 1114 }}
    />
  );
}

export default CustomerCareHistory;
