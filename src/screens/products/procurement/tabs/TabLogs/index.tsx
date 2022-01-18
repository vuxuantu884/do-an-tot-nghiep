import CustomTable, { ICustomTableColumType } from "component/table/CustomTable"; 
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import {  useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from './styles';
import querystring from "querystring";
import { Link } from "react-router-dom";
import { PurchaseOrderActionLogResponse } from "model/response/po/action-log.response";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import CustomPagination from "component/table/CustomPagination";
import TabLogFilter from "../../filter/TabLog.filter"; 
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { callApiNative } from "utils/ApiUtils";
import { getProcumentLogsService } from "service/purchase-order/purchase-order.service";

const TabLogs: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<PurchaseOrderActionLogResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  
  const [showSettingColumn, setShowSettingColumn] = useState(false);
 
  const qurery = useQuery();
  const paramsrUrl: any = Object.fromEntries(qurery.entries());

  const onPageChange = (page: number, size?: number) => {
    paramsrUrl.page = page;
    paramsrUrl.limit = size;
    history.replace(
      `${UrlConfig.PROCUREMENT}/logs?${querystring.stringify(paramsrUrl)}`
    );
  };

  const [columns, setColumn] = useState<Array<ICustomTableColumType<PurchaseOrderActionLogResponse>>>([
    {
      title: "STT",
      fixed: "left",
      align: "center",
      width: "5%",
      visible: true,
      render: (value: any, row: any, index: any) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Phiếu nhập kho",
      dataIndex: "code",
      fixed: "left",
      width: 140,
      visible: true,
      render: (value: string, record: PurchaseOrderActionLogResponse) => {
        let data ={} as PurchaseOrder;
        if (record.data) {
          data = JSON.parse(record.data);
        }
        return (
          <Link to={`${UrlConfig.PURCHASE_ORDERS}/${data?.id}`}>{record.procurement_code}</Link>
        )
      },
    },  
    {
      title: "Đơn mua hàng",
      fixed: "left",
      width: 120,
      visible: true,
      render: (record: PurchaseOrderActionLogResponse) => {
        let data ={} as PurchaseOrder;
        if (record.data) {
          data = JSON.parse(record.data);
        }
        return (
          <Link to={`${UrlConfig.PURCHASE_ORDERS}/${data?.id}`}>{data.code}</Link>
        )
      },
    },
    {
      title: "Người sửa",
      visible: true, 
      width: 120,
      render: (record: PurchaseOrderActionLogResponse)=>{
        return (
          <>
           {record.updated_by ?  
            <div>
                <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.updated_by}`}> 
                  {record.updated_by} 
                </Link>  
            </div> : ""}
            <div>
              {record.updated_name ?? ""}
            </div>
          </>
        );
      }
    },
    {
      title: "Thời gian",
      visible: true,
      dataIndex: "updated_date",
      width: 140,
      render: (value: Date)=>{
        return (
          <> 
            {ConvertUtcToLocalDate(value,DATE_FORMAT.DDMMYY_HHmm)}
          </>
        );
      }
    },    
    {
      title: "Thao tác",
      visible: true, 
      width: 200,
      dataIndex: "action",
    }, 
    {
      title: "Trạng thái phiếu",
      visible: true,
      render: (record: PurchaseOrderActionLogResponse)=>{
        return (
          <> 
            {`${record.status_before} - ${record.status_after}`}
          </>
        );
      }
    },
    {
      title: "Log ID",
      visible: true,
      dataIndex: 'id',
      width: 100,
    }]); 

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const getProcumentLogs = useCallback(async()=>{
    const res: PageResponse<PurchaseOrderActionLogResponse> = await callApiNative({isShowLoading: false},dispatch,getProcumentLogsService,{condition: ""});
    if (res) {
      setData(res);
    }
    setLoading(false);
  },[dispatch]);
  
  useEffect(()=>{
    getProcumentLogs()
    
  },[getProcumentLogs, history]);

  return (
    <StyledComponent>
      <TabLogFilter 
       onClickOpen={() => setShowSettingColumn(true)}
      />
      <CustomTable
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        columns={columnFinal}
        rowKey={(item) => item.id} 
        pagination={false}
      /> 
      <CustomPagination
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      >
      </CustomPagination> 
      <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data);
          }}
          data={columns}
        />
    </StyledComponent>
  );
};

export default TabLogs;
