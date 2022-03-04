import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useState, lazy } from "react";
import { useDispatch } from "react-redux";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { getQueryParams, useQuery } from "utils/useQuery";
import { StyledComponent } from './styles';
import { Link } from "react-router-dom";
import { PurchaseOrderActionLogResponse } from "model/response/po/action-log.response";
import { ConvertUtcToLocalDate, DATE_FORMAT, getEndOfDay, getStartOfDay } from "utils/DateUtils";
import CustomPagination from "component/table/CustomPagination";
import TabLogFilter from "../../filter/TabLog.filter";
import { ProcumentLogQuery, PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { callApiNative } from "utils/ApiUtils";
import { getProcumentLogsService } from "service/purchase-order/purchase-order.service";

const ModalSettingColumn = lazy(() => import("component/table/ModalSettingColumn"))
const ActionPurchaseORderHistoryModal = lazy(() => import("screens/purchase-order/Sidebar/ActionHistory/Modal"))

const LogsStatus = [
  {key: "draft", value: "Nháp"},
  {key: "not_received", value: "Chưa nhận hàng"},
  {key: "partial_received", value: "Nhận hàng một phần"},
  {key: "received", value: "Đã nhận hàng"},
  {key: "finished", value: "Đã kết thúc"},
  {key: "cancelled", value: "Đã hủy"},
]

const TabLogs: React.FC = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<PageResponse<PurchaseOrderActionLogResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [showLogPo, setShowLogPo] = useState(false);

  const query = useQuery();
  let dataQuery: ProcumentLogQuery = {...getQueryParams(query), sort_column:"updatedDate",sort_type:"desc"};
  const [params, setPrams] = useState<ProcumentLogQuery>(dataQuery);
  const [actionId, setActionId] = useState<number>();

  const onPageChange = (page: number, size?: number) => {
    let newPrams = {...params,page:page,limit: size};
    setPrams(newPrams);
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
      dataIndex: "created_date",
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
      render: (record: PurchaseOrderActionLogResponse)=>{
        return (
          <>
           {record.action && <div className="procurement-code"
               onClick={()=>{
                  setActionId(record.id);
                  setShowLogPo(true)}}>
               {LogsStatus.find(e=>e.key === record.action)?.value}
            </div>}
          </>
        );
      }
    },
    {
      title: "Trạng thái phiếu",
      visible: true,
      render: (record: PurchaseOrderActionLogResponse)=>{
        return (
          <>
            {record.status_before ? `${record.status_before} - ${record.status_after}` : record.status_after }
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

  const getProcumentLogs = useCallback(async(params: ProcumentLogQuery)=>{
    const res: PageResponse<PurchaseOrderActionLogResponse> = await callApiNative({isShowLoading: true},dispatch,getProcumentLogsService,{...params, condition: params.condition?.trim()});
    if (res) {
      setData(res);
    }
  },[dispatch]);

  const onFilter = useCallback(
    (values) => {
      if (values.created_date_from) {
        values.created_date_from = getStartOfDay(values.created_date_from);
      }
      if (values.created_date_to) {
        values.created_date_to = getEndOfDay(values.created_date_to);
      }
      let newPrams = {...params, ...values};
      setPrams(newPrams);
    },
    [params]
  );

  useEffect(()=>{
    getProcumentLogs(params);
  },[getProcumentLogs,params]);

  return (
    <StyledComponent>
      <TabLogFilter
        onFilter={onFilter}
        onClickOpen={() => setShowSettingColumn(true)}
      />
      <CustomTable
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
      {
        showSettingColumn &&
          <ModalSettingColumn
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumn(data);
            }}
            data={columns}
          />
      }
      {
        showLogPo &&
          <ActionPurchaseORderHistoryModal
            isModalVisible={showLogPo}
            onCancel={()=>{setShowLogPo(false)}}
            actionId={actionId}
          />
      }
    </StyledComponent>
  );
};

export default TabLogs;
