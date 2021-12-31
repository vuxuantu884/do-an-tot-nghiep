import React, { useRef, useState, useEffect } from 'react';
import CustomTable from 'component/table/CustomTable';
import { useDispatch } from 'react-redux';
import moment from "moment";
import { PurchaseOrder } from 'model/purchase-order/purchase-order.model';
import { getLogPOHistory } from 'domain/actions/po/po.action';
import { StringMappingType } from 'typescript';
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import { Link } from 'react-router-dom';
import UrlConfig from 'config/url.config';

type POHistoryProps = {
  poData?: PurchaseOrder;
  procumentCode?: string;
}

type POLogHistory = {
  action: string;
  code: string;
  data: string;
  device: string;
  id: number;
  root_id: number;
  status_after: string;
  status_before: string;
  updated_by: string;
  updated_date: string;
  updated_name: string;
  ip_address: string;
  procurement_code: string;
}

const PurchaseOrderHistory: React.FC<POHistoryProps> = (props: POHistoryProps) => {
  const { procumentCode } = props;
  const [logData, setLogData] = useState<POLogHistory | any>();
  const formatDate = "DD/MM/YYYY HH:mm";
  const dispatch = useDispatch();
  const updateNameRef = useRef('');

  const defaultColumns = [
    {
      title: "Người sửa",
      dataIndex: "updated_name",
      key: "updated_name",
      render: (status: StringMappingType, record: POLogHistory) => {
        const { updated_name, updated_by } = record;
        const name = logData.find((log: any) => log.updated_name === updateNameRef.current);
        updateNameRef.current = updated_name;
        return (
          !name && (<div>
            <div style={{ color: "#2A2A86" }}>
              <Link
                target="_blank"
                to={`${UrlConfig.ACCOUNTS}/${updated_by}`}
                className="primary"
              >
                {updated_by}
              </Link>
					  </div>
            <div>{updated_name}</div>
          </div>)
        )
      }
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
          const { status_after, status_before} = record;
          return (
            <div style={{display: "flex", alignItems: "center"}}>
              <span>{status_before}&nbsp;&nbsp;</span>
              {
                status_after && status_before && <HiOutlineArrowNarrowRight />
              }
              <span>&nbsp;&nbsp;{status_after}</span>
            </div>
          );
        }
        return '';
      }
    }
  ]

  useEffect(() => {
    if (procumentCode !== undefined) {
      dispatch(getLogPOHistory(procumentCode, setLogData));
    }
  }, [dispatch, procumentCode]);

  return (
    <div>
      <CustomTable
        bordered
        pagination={false}
        dataSource={logData}
        columns={defaultColumns}
        rowKey={(item: any) => item?.code}
      />
    </div>
  )
}

export default PurchaseOrderHistory
