import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import { inventoryGetHistoryAction } from "domain/actions/inventory/inventory.action";
import useChangeHeaderToAction from "hook/filter/useChangeHeaderToAction";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { HistoryInventoryQuery, HistoryInventoryResponse } from "model/inventory";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { TYPE_EXPORT } from "screens/products/constants";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showWarning } from "utils/ToastUtils";
import { getQueryParams } from "utils/useQuery";
import InventoryHisExport from "../component/InventoryHisExport";
import HistoryInventoryFilter from "../filter/history.filter";
import * as XLSX from 'xlsx';
import moment from "moment";
import { callApiNative } from "utils/ApiUtils";
import { inventoryGetHistoryApi } from "service/inventory";

enum DocumentType {
  PURCHASE_ORDER = "purchase_order",
  ORDER = "order",
  RETURN_ORDER = "return_order",
  RETURN_PO = "return_po",
  INVENTORY_TRANSFER = "inventory_transfer",
  INVENTORY_ADJUSTMENT = "inventory_adjustment",
}
let firstLoad = true;

const HistoryTab: React.FC<any> = (props) => {
  const { stores,vExportProduct,setVExportProduct } = props;
  const history = useHistory();
  const query = new URLSearchParams(history.location.hash.substring(2));
  const dispatch = useDispatch();
  const [totalItems,setTotalItems] = useState<number>(0)

  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [data, setData] = useState<PageResponse<HistoryInventoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  let initQuery: HistoryInventoryQuery = {};
  let dataQuery: HistoryInventoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<HistoryInventoryQuery>(dataQuery);

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(
        `${InventoryTabUrl.HISTORIES}?${queryParam}`
      );
    },
    [history, params]
  );
  const onResult = useCallback(
    (result: PageResponse<HistoryInventoryResponse> | false) => {
      if (result) {
        setLoading(false);
        setData(result);
        if (firstLoad) {
          setTotalItems(result.metadata.total);
        }
        firstLoad = false;
      }
    },
    []
  );
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });

      history.replace(
        `${InventoryTabUrl.HISTORIES}?${queryParam}`
      );
    },
    [history, params]
  );

  const getUrlByDocumentType = (type: string) => {
    switch (type) {
      case DocumentType.ORDER:
        return UrlConfig.ORDER;
      case DocumentType.RETURN_ORDER:
        return UrlConfig.ORDERS_RETURN;
      case DocumentType.PURCHASE_ORDER:
      case DocumentType.RETURN_PO:
        return UrlConfig.PURCHASE_ORDERS;
      case DocumentType.INVENTORY_TRANSFER:
        return UrlConfig.INVENTORY_TRANSFERS;
      case DocumentType.INVENTORY_ADJUSTMENT:
        return UrlConfig.INVENTORY_ADJUSTMENTS;
        default:
          return type;
    }
  };
  const [selected, setSelected] = useState<Array<HistoryInventoryResponse>>([]);
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<HistoryInventoryResponse>>
  >([]);
  const ActionComponent = useChangeHeaderToAction(
    "Sản phẩm",
    selected.length > 0,
    () => {},
    []
  );
  const defaultColumns: Array<ICustomTableColumType<HistoryInventoryResponse>> = [
    {
      width: 300,
      title: <ActionComponent />,
      visible: true,
      dataIndex: "sku",
      fixed: "left",
      render: (value, record, index) => (
        <div>
          <Link
            to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
          >
            {value}
          </Link>
          <div>{record.name}</div>
        </div>
      ),
    },
    {
      title: "Mã chứng từ",
      visible: true,
      dataIndex: "code",
      render: (value, record: HistoryInventoryResponse) => {
        let id = record.parent_document_id;
        if (record.document_type === DocumentType.RETURN_ORDER) {
          id = record.document_id;
        }

        return (
          <div>
            <Link to={`${getUrlByDocumentType(record.document_type)}/${id}`}>
              {value}
            </Link>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      visible: true,
      dataIndex: "action",
    },
    {
      align: "center",
      title: "Thời gian",
      visible: true,
      dataIndex: "transaction_date",
      render: (value) => ConvertUtcToLocalDate(value),
    },
    {
      align: "right",
      title: "SL thay đổi",
      visible: true,
      dataIndex: "quantity",
      render: (value) => {
        let newValue = parseInt(value),
              text: string = formatCurrency(newValue,".");

        if (newValue && parseInt(value) > 0) {
          text = `+${text}`;
        }
        return text;
      }
    },
    {
      align: "right",
      title: "Tồn trong kho",
      visible: true,
      dataIndex: "on_hand",
      render: (value) => formatCurrency(value,".")
    },
    {
      title: "Kho hàng",
      visible: true,
      dataIndex: "store",
    },
    {
      title: "Người sửa",
      visible: true,
      render: (item: HistoryInventoryResponse)=>{
        return (
          <>
           {item.account_code ?
            <div>
                <Link to={`${UrlConfig.ACCOUNTS}/${item.account_code}`}>
                  {item.account}
                </Link>
            </div> : ""}
          </>
        );
      }
    },
  ];
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onSelect = useCallback((selectedRow: Array<HistoryInventoryResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  useLayoutEffect(() => {
    setColumn(defaultColumns);
    const search = new URLSearchParams(history.location.search);
    if (search) {
      let condition =  search.get('condition');
      condition = condition && condition.trim();
      const store_ids =  search.get('store_ids');
      if ((condition && condition !== null)) {
        setPrams({...params, condition: condition ?? ""});
      }
      if ((store_ids && store_ids !== null)) {
        setPrams({...params,condition: condition ?? "", store_ids:  store_ids.split(',').map(Number)});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, history.location.search]);

  const debouncedSearch = React.useMemo(() =>
  _.debounce((keyword: string) => {
    setLoading(true);
    const temps = {...params,condition: keyword?.trim() };
    dispatch(inventoryGetHistoryAction(temps, onResult));
  }, 300),
  [dispatch, params, onResult]
)

  const onChangeKeySearch = useCallback(
    (keyword: string) => {
      debouncedSearch(keyword)
    },
    [debouncedSearch]
  );

  const convertItemExport = (item: HistoryInventoryResponse) => {
    return {
      [`Sản phẩm`]: item.name,
      [`Mã sản phẩm`]: item.sku,
      [`Mã chứng từ`]: item.code,
      [`Thao tác`]: item.action,
      [`Thời gian`]: ConvertUtcToLocalDate(item.transaction_date),
      [`SL thay đổi`]: item.quantity.toString(),
      [`Tồn trong kho`]: item.on_hand.toString(),
      [`Kho hàng`]: item.store,
      [`Người sửa`]: item.account,
    };
  }

  const getItemsByCondition = useCallback(async (type: string) => {
    let res: any; 
    let items: Array<HistoryInventoryResponse> = [];
    const limit = 50;
    let times = 0;
    switch (type) {
      case TYPE_EXPORT.page:
        res = await callApiNative({ isShowLoading: true }, dispatch, inventoryGetHistoryApi, params);
        items = res.items;
        break;
      case TYPE_EXPORT.selected:
        items = selected;
        break;
      case TYPE_EXPORT.all:
       const roundAll = Math.round(data.metadata.total / limit);
       times = roundAll < (data.metadata.total / limit) ? roundAll + 1 : roundAll;

        for (let index = 1; index <= times; index++) {
          const output = document.getElementById("processExport"); 
          if (output) output.innerHTML=items.length.toString();
          
          const res1 = await callApiNative({ isShowLoading: true }, dispatch, inventoryGetHistoryApi, {...params,page: index,limit:limit});
          items= items.concat(res1.items);
        }
        break;
      case TYPE_EXPORT.allin:
        if (!totalItems || totalItems===0) {
          break;
        }
        const roundAllin = Math.round(totalItems / limit);
        times = roundAllin < (totalItems / limit) ? roundAllin + 1 : roundAllin;
        for (let index = 1; index <= times; index++) {
          const output = document.getElementById("processExport"); 
          if (output) output.innerHTML=items.length.toString();
          
          const res1 = await callApiNative({ isShowLoading: true }, dispatch, inventoryGetHistoryApi, {...params,page: index,limit:limit});
          items= items.concat(res1.items);
        }
        break;
      default:
        break;
    }
    return items;
  },[dispatch,selected,params,data,totalItems])  

  const actionExport = {
    Ok: async (typeExport: string) => {
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        showWarning("Bạn chưa chọn sản phẩm nào để xuất file");
        setVExportProduct(false);
        return;
      }

      const res = await getItemsByCondition(typeExport);
      if (res && res.length === 0) {
        showWarning("Không có sản phẩm nào đủ điều kiện");
        return;
      }
      for (let i = 0; i < res.length; i++) {
        const e = res[i];
        const item = convertItemExport(e);
        dataExport.push(item);
      }

      let worksheet = XLSX.utils.json_to_sheet(dataExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "data");
      const today = moment(new Date(), 'YYYY/MM/DD');

      const month = today.format('M');
      const day   = today.format('D');
      const year  = today.format('YYYY');
      XLSX.writeFile(workbook, `inventory_history_${day}_${month}_${year}.xlsx`);
      setVExportProduct(false);
    },
    Cancel: () => {
      setVExportProduct(false);
    },
  }

  useEffect(() => {
    setLoading(true);
    dispatch(inventoryGetHistoryAction(params, onResult));
  }, [dispatch, onResult, params])

  return (
    <div>
      <HistoryInventoryFilter
        openColumn={() => setShowSettingColumn(true)}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => { }}
        listStore={stores}
        onChangeKeySearch={(value: string)=>{
          onChangeKeySearch(value);
        }}
      />
      <CustomTable
        className="small-padding"
        isLoading={loading}
        isRowSelection
        dataSource={data.items}
        columns={columnFinal}
        scroll={{ x: 1800 }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        rowKey={(data) => data.id}
        onSelectedChange={onSelect}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
        }}
        data={columns}
      />
     <InventoryHisExport
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        visible={vExportProduct}
      />
    </div>
  )
}

export default HistoryTab;
