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
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { getQueryParams } from "utils/useQuery";
import HistoryInventoryFilter from "../filter/history.filter";
import { TabProps } from "./tab.props";

enum DocumentType {
  PURCHASE_ORDER = "purchase_order",
  ORDER = "order",
  RETURN_ORDER = "return_order",
  RETURN_PO = "return_po",
  INVENTORY_TRANSFER = "inventory_transfer",
  INVENTORY_ADJUSTMENT = "inventory_adjustment",
}

const HistoryTab: React.FC<TabProps> = (props: TabProps) => {
  const { stores } = props;
  const history = useHistory();
  const query = new URLSearchParams(history.location.hash.substring(2));
  const dispatch = useDispatch();

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
                  {item.account_code} 
                </Link>  
            </div> : ""}
            <div>
              {item.account ?? ""}
            </div>
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
        setPrams({...params,condition: condition ?? "", store_ids:  parseInt(store_ids ?? "")});
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
  )

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
    </div>
  )
}

export default HistoryTab;