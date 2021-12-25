import React from 'react'
import CustomTable from 'component/table/CustomTable'
import { PurchaseOrder } from 'model/purchase-order/purchase-order.model'

type POHistoryProps = {
  poData?: PurchaseOrder;
}

const PurchaseOrderHistory: React.FC<POHistoryProps> = (props: POHistoryProps) => {
    const { poData } = props;

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
      dataIndex: "update_name"

    },
    {
      title: "Trạng thái phiếu nhập kho",
      dataIndex: "update_name"
    }
  ]

  return (
    <div>
      <CustomTable
        bordered
        pagination={false}
        dataSource={poData?.procurements}
        columns={defaultColumns}
        rowKey={(item: any) => item.id}
        scroll={{ x: 1114 }}
      />
    </div>
  )
}

export default PurchaseOrderHistory
