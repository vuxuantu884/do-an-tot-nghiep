import React, { useState, useEffect } from 'react'
import CustomTable from 'component/table/CustomTable'
import { useDispatch } from 'react-redux'
import { PurchaseOrder } from 'model/purchase-order/purchase-order.model'
import { getLogPOHistory } from 'domain/actions/po/po.action'

type POHistoryProps = {
  poData?: PurchaseOrder;
}

type POLogHistory = {
  action: string;
  updateName: string;
  updateDate: string;
  statusBefore: string;
  statusAfter: string;
}

const PurchaseOrderHistory: React.FC<POHistoryProps> = (props: POHistoryProps) => {
    const { poData } = props;

    console.log("poData", poData);

    const [logData, setLogData] = useState<POLogHistory | any>();
    const dispatch = useDispatch();

  const defaultColumns = [
    {
      title: "Người sửa",
      dataIndex: "update_by"
    },
    {
      title: "Thời gian sửa",
      dataIndex: "update_date"
    },
    {
      title: "Thao tác",
      dataIndex: "action"

    },
    {
      title: "Trạng thái phiếu nhập kho",
      dataIndex: "status_after"
    }
  ]

  useEffect(() => {
    if (poData?.id !== undefined) {
      dispatch(getLogPOHistory(poData?.id, setLogData));
    }
  }, [])

  return (
    <div>
      <CustomTable
        bordered
        pagination={false}
        dataSource={logData}
        columns={defaultColumns}
        rowKey={(item: any) => item.id}
        scroll={{ x: 1114 }}
      />
    </div>
  )
}

export default PurchaseOrderHistory
