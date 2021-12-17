import CustomPagination from "component/table/CustomPagination";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import {AppConfig} from "config/app.config";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import {inventoryByVariantAction} from "domain/actions/inventory/inventory.action";
import {searchVariantsRequestAction} from "domain/actions/product/products.action";
import { HeaderSummary } from "hook/filter/HeaderSummary";
import _ from "lodash";
import {PageResponse} from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
  InventoryResponse,
  InventoryVariantListQuery,
} from "model/inventory";
import {VariantResponse, VariantSearchQuery} from "model/product/product.model";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {HiChevronDoubleRight, HiOutlineChevronDoubleDown} from "react-icons/hi";
import {useDispatch} from "react-redux";
import {Link, useHistory} from "react-router-dom";
import {formatCurrency, generateQuery, Products} from "utils/AppUtils";
import {OFFSET_HEADER_TABLE} from "utils/Constants";
import {getQueryParams} from "utils/useQuery";
import AllInventoryFilter from "../filter/all.filter";
import {TabProps} from "./tab.props";
export interface SummaryInventory {
  Sum_Total: number | 0;
  Sum_On_hand: number | 0;
  Sum_Available: number | 0; 
  Sum_Committed: number | 0; 
  Sum_On_hold: number | 0; 
  Sum_Defect: number | 0; 
  Sum_In_coming: number | 0; 
  Sum_Transferring: number | 0; 
  Sum_On_way: number | 0; 
  Sum_Shipping: number | 0; 
} 

const AllTab: React.FC<TabProps> = (props: TabProps) => {
  const {stores} = props;
  const history = useHistory();
  const pageSizeOptions: Array<string> =["50","100"];
  const [objSummaryTable, setObjSummaryTable] = useState<SummaryInventory>();
  
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

  const [columnsDrill, setColumnsDrill] = useState<Array<ICustomTableColumType<InventoryResponse>>>([
    {
      title: "Kho hàng",
      dataIndex: "store_id",
      fixed: true,
      width: 262,
      render (value) {
        return storeRef.current.get(value);
      },
    },{
      dataIndex: "variant_prices",
      align: "center",
      width: 150,
      fixed: true,
      render: (value) => {
        return <></>;
      },
    },
    {
      title: "Tổng tồn",
      dataIndex: `on_hand`,
      align: "center",
      width: 150,
      render: (value,record) => {
        return <div>{formatCurrency(record.on_hand+(record.on_way ?? 0)+record.transferring, ".")}</div> ;
      },
    },
    {
      title: "Tồn trong kho",
      dataIndex: `on_hand`,
      align: "center",
      width: 150,
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    },
    {
      title: "Có thể bán",
      dataIndex: `available`,
      align: "center",
      width: 150,
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    },
    {
      title: "Đang giao địch",
      dataIndex: `committed`,
      align: "center",
      width: 150, render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    }, 
    {
      title: "Hàng tạm giữ",
      dataIndex: `on_hold`,
      align: "center",
      width: 150,
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    },{
      title: "Hàng lỗi",
      dataIndex: `defect`,
      align: "center",
      width: 150,
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    },{
      title: "Chờ nhập",
      dataIndex: `in_coming`,
      align: "center",
      width: 150,
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    },{
      title: "Hàng đang chuyển đến",
      dataIndex: `transferring`,
      align: "center",
      width: 200,
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    },{
      title: "Hàng đang chuyển đi",
      dataIndex: `on_way`,
      align: "center",
      width: 200,
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    },{
      title: "Hàng đang giao",
      dataIndex: `shipping`,
      align: "center",
      render: (value) => {
        return <div> {formatCurrency(value,".")}</div> ;
      },
    }
  ]);
  const [selected, setSelected] = useState<Array<InventoryResponse>>([]);

  const openColumn = useCallback(() => {
    setShowSettingColumn(true);
  }, []);

  const onSelect = useCallback((selectedRow: Array<InventoryResponse>) => {
    let objSum: SummaryInventory = {
      Sum_Total:  0,
      Sum_On_hand: 0,
      Sum_Available: 0, 
      Sum_Committed: 0,
      Sum_On_hold: 0,
      Sum_Defect: 0, 
      Sum_In_coming: 0,
      Sum_Transferring:0,
      Sum_On_way: 0,
      Sum_Shipping: 0, 
    };
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
      if (selectedRow && selectedRow.length > 0) {
        selectedRow.forEach((e)=>{ 
          objSum.Sum_On_hand += e.on_hand;
          objSum.Sum_Available += e.available ?? 0;
          objSum.Sum_Committed += e.committed ?? 0;
          objSum.Sum_On_hold += e.on_hold ?? 0;
          objSum.Sum_Defect += e.defect ?? 0;
          objSum.Sum_In_coming += e.in_coming ?? 0;
          objSum.Sum_Transferring += e.transferring;
          objSum.Sum_On_way += e.on_way ?? 0;
          objSum.Sum_Shipping += e.shipping ?? 0;
          const total = e.on_hand+ (e.on_way ?? 0) + e.transferring;
          objSum.Sum_Total += total;
        });

        setObjSummaryTable({...objSum});
      }else{
        setObjSummaryTable({...{}as SummaryInventory });
      }

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

  const debouncedSearch = React.useMemo(() =>
    _.debounce((keyword: string) => {
      setLoading(true);
      const temps = {...params,info: keyword?.trim() };
      delete temps.status; 
      dispatch(searchVariantsRequestAction(temps, onResult));
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
    setColumns([
      {
        title: "Sản phẩm",
        visible: true,
        dataIndex: "sku",
        align: "left",
        fixed: "left",
        width: 200,
        render: (value, record, index) => {
          return (
            <div>
                <div>
                <Link to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}>
                    {record.sku}
                  </Link>
                </div>
                <div>
                  <TextEllipsis value={record.name} line={1} />
                </div>
                <div>
                {record.barcode}
                </div>
            </div>
            )
        }
      }, 
      {
        title: "Giá bán",
        titleCustom: "Giá bán",
        visible: true,
        dataIndex: "variant_prices",
        align: "center",
        width: 150,
        fixed: true,
        render: (value) => {
          let price = Products.findPrice(value, AppConfig.currency);
          return formatCurrency(price ? price.retail_price : 0,'.');
        },
      },
      {
        title: "Danh mục",
        titleCustom: "Danh mục",
        visible: false,
        dataIndex: "category",
        align: "left",
        fixed: true,
        width: 100,
        render: (value, row) => {
          return <div>{row.product?.category}</div>
        },
      },
      {
        title: HeaderSummary(objSummaryTable?.Sum_Total,"Tổng tồn"), 
        titleCustom: "Tổng tồn",
        visible: true,
        dataIndex: `total`,
        align: "center",
        width: 150,
        render: (value,record) => {
          return <div> {formatCurrency(record.on_hand+(record.on_way ?? 0)+record.transferring,".")}</div> ;
        },
      },
      {
        title: HeaderSummary(objSummaryTable?.Sum_On_hand,"Tồn trong kho"),
        titleCustom: "Tổng tồn",
        visible: true,
        dataIndex: `on_hand`,
        align: "center",
        width: 150,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      },
      {
        title: HeaderSummary(objSummaryTable?.Sum_Available,"Có thể bán"),
        titleCustom: "Có thể bán",
        visible: true,
        dataIndex: `available`,
        align: "center",
        width: 150,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      },
      {
        title: HeaderSummary(objSummaryTable?.Sum_Committed,"Đang giao địch"),
        titleCustom: "Đang giao địch",
        visible: true,
        dataIndex: `committed`,
        align: "center",
        width: 150,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      }, 
      {
        title: HeaderSummary(objSummaryTable?.Sum_On_hold,"Hàng tạm giữ"),
        titleCustom: "Hàng tạm giữ",
        visible: true,
        dataIndex: `on_hold`,
        align: "center",
        width: 150,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      },{
        title: HeaderSummary(objSummaryTable?.Sum_Defect,"Hàng lỗi"), 
        titleCustom: "Hàng lỗi",
        visible: true,
        dataIndex: `defect`,
        align: "center",
        width: 150,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      },{
        title: HeaderSummary(objSummaryTable?.Sum_In_coming,"Chờ nhập"),
        titleCustom: "Chờ nhập",
        visible: true,
        dataIndex: `in_coming`,
        align: "center",
        width: 150,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      },{
        title: HeaderSummary(objSummaryTable?.Sum_Transferring,"Hàng đang chuyển đến"),
        titleCustom: "Hàng đang chuyển đến",
        visible: true,
        dataIndex: `transferring`,
        align: "center",
        width: 200,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      },{
        title: HeaderSummary(objSummaryTable?.Sum_On_way,"Hàng đang chuyển đi"),
        titleCustom: "Hàng đang chuyển đi",
        visible: true,
        dataIndex: `on_way`,
        align: "center",
        width: 200,
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      },{
        title: HeaderSummary(objSummaryTable?.Sum_Shipping,"Hàng đang giao"),
        titleCustom: "Hàng đang giao",
        visible: true,
        dataIndex: `shipping`,
        align: "center",
        render: (value) => {
          return <div> {formatCurrency(value,".")}</div> ;
        },
      }
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, selected, objSummaryTable, HeaderSummary]); 

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
        onChangeKeySearch={(value: string)=>{
          onChangeKeySearch(value);
        }}
      />
      <CustomTable
        bordered
        isRowSelection
        isLoading={loading}
        dataSource={data.items}
        scroll={{x: 2200}}
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
                bordered 
                dataSource={inventiryVariant.get(record.id) || []}
                scroll={{x: 2100}}
                pagination={false}
                columns={columnsDrill}
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
          let columnsInRow = data.filter(e=>e.visible === true && e.dataIndex !== "sku").map(
            (item: ICustomTableColumType<InventoryResponse>)=>{
              return {
                title: item.title,
                dataIndex: item.dataIndex,
                align: item.align,
                width: item.width,
                fixed: item.fixed ?? false, 
                render: item.render
              }
            }
          )
          columnsInRow.unshift({
            title: "Kho hàng",
            dataIndex: "store_id",
            align: 'left',
            fixed: true,
            width: 270,
            render (value) {
              return storeRef.current.get(value);
            }
          });
          columnsInRow.forEach((e)=>{
            if (e.dataIndex === "variant_prices" || e.dataIndex === "category") {
              e.render = undefined;
              e.title = "";
            } 
          });
          setColumnsDrill(columnsInRow);
        }}
        data={columns}
      />
    </div>
  );
};

export default AllTab;
