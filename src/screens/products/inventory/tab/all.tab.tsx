import CustomPagination from "component/table/CustomPagination";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {AppConfig} from "config/app.config";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import {inventoryByVariantAction} from "domain/actions/inventory/inventory.action";
import {searchVariantsRequestAction} from "domain/actions/product/products.action";
import useChangeHeaderToAction from "hook/filter/useChangeHeaderToAction";
import {PageResponse} from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
  InventoryResponse,
  InventoryVariantListQuery,
} from "model/inventory";
import {VariantResponse, VariantSearchQuery} from "model/product/product.model";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {HiChevronDoubleRight, HiOutlineChevronDoubleDown} from "react-icons/hi";
import {useDispatch} from "react-redux";
import {Link, useHistory} from "react-router-dom";
import ImageProduct from "screens/products/product/component/image-product.component";
import {formatCurrency, generateQuery, Products} from "utils/AppUtils";
import {OFFSET_HEADER_TABLE} from "utils/Constants";
import {getQueryParams} from "utils/useQuery";
import AllInventoryFilter from "../filter/all.filter";
import {TabProps} from "./tab.props";
const AllTab: React.FC<TabProps> = (props: TabProps) => {
  const {stores} = props;
  const history = useHistory();
  const pageSizeOptions: Array<string> =["50","100"];
  
  const query = new URLSearchParams(history.location.hash.substring(2));

  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let dataQuery: VariantSearchQuery = {
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<VariantSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 50,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [expandRow, setExpandRow] = useState<Array<string> | undefined>();
  const [inventiryVariant, setInventiryVariant] = useState<
    Map<number, AllInventoryResponse[]>
  >(new Map());
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({...params});
      history.push(`${UrlConfig.INVENTORY}${history.location.hash}?${queryParam}`);
    },
    [history, params]
  );

  const onFilter = useCallback(
    (values) => {
      const newValues = {...values,info: values.info?.trim()}
      const newPrams = {...params, ...newValues, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${InventoryTabUrl.ALL}?${queryParam}`);
    },
    [history, params]
  );

  let [columns, setColumns] = useState<Array<ICustomTableColumType<InventoryResponse>>>(
    []
  );
  const [selected, setSelected] = useState<Array<InventoryResponse>>([]);

  const openColumn = useCallback(() => {
    setShowSettingColumn(true);
  }, []);

  const onSelect = useCallback((selectedRow: Array<InventoryResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  const onResult = useCallback((result: PageResponse<VariantResponse> | false) => {
    setLoading(false);
    if (result) {
      setInventiryVariant(new Map());
      setData(result);
      setExpandRow([]);
    }
  }, []);
  const columnsFinal = useMemo(() => columns.filter((item) => item.visible), [columns]);

  const ActionComponent = useChangeHeaderToAction(
    "Ảnh",
    selected.length > 0,
    () => {},
    []
  );

  const onSaveInventory = (
    result: Array<AllInventoryResponse>,
    variant_ids: Array<number>
  ) => {
    console.log(result);

    if (Array.isArray(result) && variant_ids[0]) {
      const tempMap = new Map(inventiryVariant);
      tempMap.set(variant_ids[0], result);
      setInventiryVariant(tempMap);
    }
  };

  const fetchInventoryByVariant = (
    variant_ids: Array<number>,
    store_ids: Array<number>
  ) => {
    const params: InventoryVariantListQuery = JSON.parse(
      JSON.stringify({variant_ids, store_ids, is_detail: true})
    );

    dispatch(
      inventoryByVariantAction(params, (result) => onSaveInventory(result, variant_ids))
    );
  };

  useEffect(() => {
    setColumns([
      {
        width: 100,
        title: <ActionComponent />,
        visible: true,
        dataIndex: "url",
        render: (value) => <ImageProduct path={value} isUpload={false} />,
      },
      {
        title: `${selected.length > 0 ? "" : "Barcode"}`,
        visible: true,
        dataIndex: "barcode",
      },
      {
        title: "Mã sản phẩm",
        visible: true,
        dataIndex: "sku",
        align: "center",
        render: (value, record, index) => (
          <div>
            <Link to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}>
              {value}
            </Link>
          </div>
        ),
      },
      {
        width: 300,
        title: "Tên sản phẩm",
        visible: true,
        dataIndex: "name",
        align: "center",
      },
      {
        title: "Giá",
        visible: true,
        dataIndex: "variant_prices",
        align: "right",
        render: (value) => {
          let price = Products.findPrice(value, AppConfig.currency);
          return formatCurrency(price ? price.retail_price : 0);
        },
      },
      {
        title: "Tồn theo trạng thái",
        visible: true,
        dataIndex: `${params.status || "on_hand"}`,
        align: "right",
      },
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, selected]);

  useEffect(() => {
    setLoading(true);
    const temps = {...params, limit: params.limit ?? 50};
    delete temps.status; 
    
    dispatch(searchVariantsRequestAction(temps, onResult));
  }, [dispatch, onResult, params]);

  const storeRef = useRef<Map<number, string>>(new Map<number, string>());
  useEffect(() => {
    if (Array.isArray(stores)) {
      stores.forEach((item) => {
        storeRef.current.set(item.id, item.name);
      });
    }
  }, [stores]);
  
  return (
    <div>
      <AllInventoryFilter
        openColumn={openColumn}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={stores}
      />
      <CustomTable
        isRowSelection
        isLoading={loading}
        dataSource={data.items}
        scroll={{x: 900}}
        sticky={{offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE}}
        expandedRowKeys={expandRow} 
        onSelectedChange={onSelect} 
        pagination={false}
        expandable={{
          expandIcon: (props) => {
            let icon = <HiChevronDoubleRight size={12} />;
            if (props.expanded) {
              icon = <HiOutlineChevronDoubleDown size={12} color="#2A2A86" />;
            }
            return (
              <div
                style={{cursor: "pointer"}}
                onClick={(event) => props.onExpand(props.record, event)}
              >
                {icon}
              </div>
            );
          },
          onExpand: (expanded: boolean, record: VariantResponse) => {
            console.log("expanded", expanded);
            setExpandRow(undefined);
            if (expanded) {
              let store_ids: any[] = params.store_ids
                ? params.store_ids.toString().split(",")
                : [];

              store_ids = store_ids.map((item) => parseInt(item));
              fetchInventoryByVariant([record.id], store_ids);
            }
          },
          expandedRowRender: (record: VariantResponse, index, indent, expanded) => {
            return (
              <CustomTable
                dataSource={inventiryVariant.get(record.id) || []}
                scroll={{y: 250}}
                pagination={false}
                columns={[
                  {
                    title: "Kho hàng",
                    dataIndex: "store_id",
                    render (value) {
                      return storeRef.current.get(value);
                    },
                  },
                  {
                    align: "right",
                    title: "Tồn trong kho",
                    dataIndex: "on_hand",
                  },
                  {
                    align: "right",
                    title: "Có thể bán",
                    dataIndex: "available",
                  },
                  {
                    align: "right",
                    title: "Tạm giữ",
                    dataIndex: "on_hold",
                  },
                  {
                    align: "right",
                    title: "Hàng lỗi",
                    dataIndex: "defect",
                  },
                  {
                    align: "right",
                    title: "Chờ nhập",
                    dataIndex: "in_coming",
                  },
                  {
                    align: "right",
                    title: "Đang chuyển đến",
                    dataIndex: "transferring",
                  },
                  {
                    align: "right",
                    title: "Đang chuyển đi",
                    dataIndex: "on_way",
                  },
                ]}
              />
            );
          },
        }}
        columns={columnsFinal}
        rowKey={(data) => data.id}
      />
      <CustomPagination
        pagination={{
          showSizeChanger: true,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          total: data.metadata.total,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
          pageSizeOptions: pageSizeOptions
        }}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumns(data);
        }}
        data={columns}
      />
    </div>
  );
};

export default AllTab;
