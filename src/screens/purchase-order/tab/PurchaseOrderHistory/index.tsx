import React, { useState, useEffect } from 'react';
import CustomTable from 'component/table/CustomTable';
import { useDispatch } from 'react-redux';
import moment from "moment";
import { PurchaseOrder } from 'model/purchase-order/purchase-order.model';
import { getLogPOHistory, getLogDetailPOHistory } from 'domain/actions/po/po.action';
import { StringMappingType } from 'typescript';

type POHistoryProps = {
  poData?: PurchaseOrder;
}

type POLogHistory = {
  action: string;
  code: string;
  data: string;
  device: string;
  id: number;
  ip_address: string;
  procurement_code: string;
  root_id: 321
  status_after: string;
  status_before: string;
  updated_by: string;
  updated_date: string;
  updated_name: string;
}

const PurchaseOrderHistory: React.FC<POHistoryProps> = (props: POHistoryProps) => {
  const { poData } = props;
  const [logData, setLogData] = useState<POLogHistory | any>();
  const formatDate = "DD/MM/YYYY HH:mm";
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);

  const defaultColumns = [
    {
      title: "Người sửa",
      dataIndex: "updated_name",
      key: "updated_name"
    },
    {
      title: "Thời gian sửa",
      dataIndex: "updated_date",
      key: "updated_date",
      render: (updated_date: string) => {
        return moment(updated_date).format(formatDate).toString()
      }
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",

    },
    {
      title: "Trạng thái phiếu nhập kho",
      dataIndex: "status",
      key: "status",
      render: (status: StringMappingType, record: POLogHistory) => {
        if (record) {
          const { status_after, status_before } = record;

          return status_after ? (status_before + ' - ' + status_after) : ''

        }
        return '';
      }
    }
  ]

  useEffect(() => {
    if (poData?.code !== undefined) {
      dispatch(getLogPOHistory(poData?.code, setLogData));
    }
  }, [dispatch, poData]);

  // useEffect(() => {
  //   setDataSource({
  //     ...logData, 
  //     updated_date: moment(logData?.updated_date).format(formatDate).toString(), 
  //     status: `${logData?.status_after? (logData?.status_before - logData?.status_after) : ''}`})
  // }, [logData])

  return (
    <div>
      <CustomTable
        bordered
        pagination={false}
        dataSource={logData?.data}
        columns={defaultColumns}
        rowKey={(item: any) => item?.code}
      />
    </div>
  )
}

export default PurchaseOrderHistory
