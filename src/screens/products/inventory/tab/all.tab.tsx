import CustomPagination from "component/table/CustomPagination";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import {AppConfig} from "config/app.config";
import { HttpStatus } from "config/http-status.config";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import {createConfigInventoryAction, inventoryByVariantAction, updateConfigInventoryAction} from "domain/actions/inventory/inventory.action";
import { hideLoading } from "domain/actions/loading.action";
import {searchVariantsInventoriesRequestAction} from "domain/actions/product/products.action";
import { HeaderSummary } from "hook/filter/HeaderSummary";
import _ from "lodash";
import {PageResponse} from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
  InventoryResponse,
  InventoryVariantListQuery,
} from "model/inventory";
import { InventoryColumnField, InventoryExportField } from "model/inventory/field";
import { FilterConfig, FilterConfigRequest } from "model/other";
import {VariantResponse, VariantSearchQuery} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {HiChevronDoubleRight, HiOutlineChevronDoubleDown} from "react-icons/hi";
import {useDispatch, useSelector} from "react-redux";
import {Link, useHistory} from "react-router-dom";
import { getInventoryConfigService } from "service/inventory";
import {formatCurrency, generateQuery, Products, splitEllipsis} from "utils/AppUtils";
import {COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE} from "utils/Constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import AllInventoryFilter from "../filter/all.filter";
import "./index.scss"
import InventoryExport from "../component/InventoryExport";
import { TYPE_EXPORT } from "screens/products/constants";
import * as XLSX from 'xlsx';
import moment from "moment";
import { callApiNative } from "utils/ApiUtils";
import { searchVariantsInventoriesApi } from "service/product/product.service";
import FileSaver from "file-saver";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import InventoryExportModal from "../component/InventoryExportV2";

export const STATUS_IMPORT_EXPORT = {
  DEFAULT: 1,
  CREATE_JOB_SUCCESS: 2,
  JOB_FINISH: 3,
  ERROR: 4,
};

type ConfigColumnInventory = {
  Columns: Array<ICustomTableColumType<InventoryResponse>>,
  ColumnDrill: Array<ICustomTableColumType<InventoryResponse>>
}

let firstLoad = true;
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

const AllTab: React.FC<any> = (props) => {
  const { stores,showExportModal,setShowExportModal,setVExportInventory,vExportInventory} = props;
  const history = useHistory();
  const pageSizeOptions: Array<string> =["50","100"];
  const [objSummaryTable, setObjSummaryTable] = useState<SummaryInventory>();
  const [totalItems, setTotalItems] = useState<number>(0);

  const query = useQuery();

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

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const {account} = userReducer;
  const [lstConfig, setLstConfig] = useState<Array<FilterConfig>>([]);
  const [selected, setSelected] = useState<Array<InventoryResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.DEFAULT);
  const [exportProgressDetail, setExportProgressDetail] = useState<number>(0);
  const [statusExportDetail, setStatusExportDetail] = useState<number>(0);

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

  const onSortASC = useCallback((sortColumn: string)=>{
      const newPrams = {...params, sort_type: "asc",sort_column: sortColumn};
      onFilter(newPrams);
  },[onFilter, params]);

  const onSortDESC = useCallback((sortColumn: string)=>{
    const newPrams = {...params, sort_type: "desc",sort_column: sortColumn};
    onFilter(newPrams);
  },[params, onFilter]);

  const ellipName = (str: string|undefined)=>{
    if (!str) {
      return "";
    }
    let strName = (str.trim());
        strName = window.screen.width >= 1920 ? splitEllipsis(strName, 100, 30)
          : window.screen.width >= 1600 ? strName = splitEllipsis(strName, 60, 30)
            : window.screen.width >= 1366 ? strName = splitEllipsis(strName, 47, 30) : strName;
    return strName
  }

  const defaultColumns: Array<ICustomTableColumType<InventoryResponse>> = useMemo(()=>{
    return [
       {
         title: "Sản phẩm",
         visible: true,
         dataIndex: "sku",
         align: "left",
         fixed: "left",
         className: "column-product",
         render: (value, record, index) => {
          let strName = ellipName(record.name);
           return (
             <div>
                 <div>
                 <Link to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}>
                     {record.sku}
                   </Link>
                 </div>
                 <div>
                   <TextEllipsis value={strName} line={1} />
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
         width: 110,
         fixed: true,
         render: (value) => {
           let price = Products.findPrice(value, AppConfig.currency);
           return formatCurrency(price ? price.retail_price : 0);
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
         title: HeaderSummary(objSummaryTable?.Sum_Total,"Tổng tồn",
                              InventoryColumnField.total_stock,
                              (sortColumn:string)=>{onSortASC(sortColumn)},
                              (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Tổng tồn",
         visible: true,
         dataIndex: `total_stock`,
         align: "center",
         width: 80,
         render: (value,record) => {
           return <div> {value ? formatCurrency(record.total_stock): ""}</div>;
         },
       },
       {
        title: HeaderSummary(objSummaryTable?.Sum_On_hand,"Tồn trong kho",
                            InventoryColumnField.on_hand,
                            (sortColumn:string)=>{onSortASC(sortColumn)},
                            (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Tổng trong kho",
         visible: true,
         dataIndex: `on_hand`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },
       {
        title: HeaderSummary(objSummaryTable?.Sum_Available,"Có thể bán",
                      InventoryColumnField.available,
                      (sortColumn:string)=>{onSortASC(sortColumn)},
                      (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Có thể bán",
         visible: true,
         dataIndex: `available`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },
       {
        title: HeaderSummary(objSummaryTable?.Sum_Committed,"Đang giao dịch",
                            InventoryColumnField.committed,
                            (sortColumn:string)=>{onSortASC(sortColumn)},
                            (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Đang giao dịch",
         visible: true,
         dataIndex: `committed`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },
       {
        title: HeaderSummary(objSummaryTable?.Sum_On_hold,"Tạm giữ",
                          InventoryColumnField.on_hold,
                          (sortColumn:string)=>{onSortASC(sortColumn)},
                          (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Tạm giữ",
         visible: true,
         dataIndex: `on_hold`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
        title: HeaderSummary(objSummaryTable?.Sum_Defect,"Hàng lỗi",
                          InventoryColumnField.defect,
                          (sortColumn:string)=>{onSortASC(sortColumn)},
                          (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Hàng lỗi",
         visible: true,
         dataIndex: `defect`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
        title: HeaderSummary(objSummaryTable?.Sum_In_coming,"Chờ nhập",
                            InventoryColumnField.in_coming,
                            (sortColumn:string)=>{onSortASC(sortColumn)},
                            (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Chờ nhập",
         visible: true,
         dataIndex: `in_coming`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
        title: HeaderSummary(objSummaryTable?.Sum_Transferring,"Hàng chuyển đến",
                            InventoryColumnField.transferring,
                            (sortColumn:string)=>{onSortASC(sortColumn)},
                            (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Hàng chuyển đến",
         visible: true,
         dataIndex: `transferring`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
        title: HeaderSummary(objSummaryTable?.Sum_On_way,"Hàng chuyển đi",
                            InventoryColumnField.on_way,
                            (sortColumn:string)=>{onSortASC(sortColumn)},
                            (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Hàng chuyển đi",
         visible: true,
         dataIndex: `on_way`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
        title: HeaderSummary(objSummaryTable?.Sum_Shipping,"Đang giao",
                            InventoryColumnField.shipping,
                            (sortColumn:string)=>{onSortASC(sortColumn)},
                            (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Đang giao",
         visible: true,
         dataIndex: `shipping`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       }
     ]
   },[objSummaryTable, onSortDESC, onSortASC]);

   const defaultColumnsDrill: Array<ICustomTableColumType<InventoryResponse>> = useMemo(()=>{
     return [
      {
        title: "",
        fixed: true,
        width: 50,
        max: 50
      },
       {
         title: "Kho hàng",
         dataIndex: "store_id",
         fixed: true,
         render (value) {
           return storeRef.current.get(value);
         },
       },{
         dataIndex: "variant_prices",
         align: "center",
         width: 110,
         fixed: true,
         render: (value) => {
           return <></>;
         },
       },
       {
         title: "Tổng tồn",
         dataIndex: `total_stock`,
         align: "center",
         width: 80,
         render: (value,record) => {
           return <div> {value ? formatCurrency(record.total_stock): ""}</div>;
         },
       },
       {
         title: "Tồn trong kho",
         dataIndex: `on_hand`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },
       {
         title: "Có thể bán",
         dataIndex: `available`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },
       {
         title: "Đang giao dịch",
         dataIndex: `committed`,
         align: "center",
         width: 80, render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },
       {
         title: "Tạm giữ",
         dataIndex: `on_hold`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
         title: "Hàng lỗi",
         dataIndex: `defect`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
         title: "Chờ nhập",
         dataIndex: `in_coming`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
         title: "Hàng chuyển đến",
         dataIndex: `transferring`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
         title: "Hàng chuyển đi",
         dataIndex: `on_way`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       },{
         title: "Đang giao",
         dataIndex: `shipping`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrency(value): ""}</div>;
         },
       }
     ]
   },[]);

  let [columns, setColumns] = useState<Array<ICustomTableColumType<InventoryResponse>>>(defaultColumns);
  const [columnsDrill, setColumnsDrill] = useState<Array<ICustomTableColumType<InventoryResponse>>>(defaultColumnsDrill);

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
          if (e === undefined)
              return;

          objSum.Sum_On_hand += e.on_hand ?? 0;
          objSum.Sum_Available += e.available ?? 0;
          objSum.Sum_Committed += e.committed ?? 0;
          objSum.Sum_On_hold += e.on_hold ?? 0;
          objSum.Sum_Defect += e.defect ?? 0;
          objSum.Sum_In_coming += e.in_coming ?? 0;
          objSum.Sum_Transferring += e.transferring ?? 0;
          objSum.Sum_On_way += e.on_way ?? 0;
          objSum.Sum_Shipping += e.shipping ?? 0;
          objSum.Sum_Total += e.total_stock ?? 0;
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
      if (firstLoad) {
        setTotalItems(result.metadata.total);
      }
      firstLoad = false;
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

  const fetchInventoryByVariant = useCallback((
    variant_ids: Array<number>,
    store_ids: Array<number>
  ) => {
    
    const request: InventoryVariantListQuery = JSON.parse(
      JSON.stringify({variant_ids, store_ids, is_detail: true})
    );
    if (params && params.remain) {
      request.remain = params.remain;
    }
    
    dispatch(
      inventoryByVariantAction(request, (result) => onSaveInventory(result, variant_ids))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dispatch, params]);

  const debouncedSearch = React.useMemo(() =>
    _.debounce((keyword: string,filters: any) => {
      
      setLoading(true);
      const newValues = {...params,info: keyword?.trim(),...filters}
      const newPrams = {...params, ...newValues, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${InventoryTabUrl.ALL}?${queryParam}`);
    }, 300),
    [params,history]
  )

  const onChangeKeySearch = useCallback(
    (keyword: string, filters: any) => {
      debouncedSearch(keyword,filters)
    },
    [debouncedSearch]
  )

  useEffect(() => {
    setLoading(true);
    const temps = {...params, limit: params.limit ?? 50};
    delete temps.status;

    dispatch(searchVariantsInventoriesRequestAction(temps, onResult));
  }, [dispatch, onResult, params]);

  const storeRef = useRef<Map<number, string>>(new Map<number, string>());
  useEffect(() => {
    if (Array.isArray(stores)) {
      stores.forEach((item) => {
        storeRef.current.set(item.id, item.name);
      });
    }
  }, [stores]);

  const getConfigColumnInventory = useCallback(()=>{
    if (account && account.code) {
      getInventoryConfigService(account.code)
        .then((res) => {
          switch (res.code) {
            case HttpStatus.SUCCESS:
              if (res) {
                setLstConfig(res.data);
                if (res.data && res.data.length > 0) {
                  const userConfigColumn = res.data.filter(e=>e.type === COLUMN_CONFIG_TYPE.COLUMN_INVENTORY);
                  const userConfig=   userConfigColumn.reduce((p, c) => p.id > c.id ? p : c);

                   if (userConfig){
                       let cf = JSON.parse(userConfig.json_content) as ConfigColumnInventory;

                       cf.Columns.forEach(e => {
                         const column = defaultColumns.find(p=>p.dataIndex === e.dataIndex);
                         if (column) {
                          e.render = column.render;
                          e.title = column.title;
                          e.titleCustom = column.titleCustom;
                         }
                       });
                       cf.ColumnDrill.forEach(e => {
                         const columnDrill = defaultColumnsDrill.find(p=>p.dataIndex === e.dataIndex);
                         if (columnDrill) {
                          e.render = columnDrill.render;
                          e.title = columnDrill.title;
                          e.titleCustom = columnDrill.titleCustom;
                         }
                       });
                       setColumns(cf.Columns);
                       setColumnsDrill(cf.ColumnDrill);
                   }
                }
               }
              break;
            case HttpStatus.UNAUTHORIZED:
              dispatch(unauthorizedAction());
              break;
            default:
              res.errors.forEach((e: any) => showError(e));
              break;
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    }
  },[account, dispatch, defaultColumns, defaultColumnsDrill]);

  const onSaveConfigColumn = useCallback((data: Array<ICustomTableColumType<InventoryResponse>>, dataDrill: Array<ICustomTableColumType<InventoryResponse>>) => {
    let config = lstConfig.find(e=>e.type === COLUMN_CONFIG_TYPE.COLUMN_INVENTORY) as FilterConfigRequest;
    if (!config) config = {} as FilterConfigRequest;

    const configRequest = {
      Columns: data,
      ColumnDrill: dataDrill
    } as ConfigColumnInventory;

    const json_content = JSON.stringify(configRequest);
    config.type = COLUMN_CONFIG_TYPE.COLUMN_INVENTORY;
    config.json_content = json_content;
    config.name= `${account?.code}_config_column_inventory`;
    if (config && config.id && config.id !== null) {
      dispatch(updateConfigInventoryAction(config));
    }else{
      dispatch(createConfigInventoryAction(config));
    }

  }, [dispatch,account?.code, lstConfig]);

  const convertItemExport = (item: InventoryResponse) => {
      const objPrice = Products.findPrice(item.variant_prices, AppConfig.currency);
      const price = formatCurrency(objPrice ? objPrice.retail_price : 0);

    return {
      [InventoryExportField[InventoryColumnField.sku]]: item.sku,
      [InventoryExportField[InventoryColumnField.variant_name]]: item.name,
      [InventoryExportField[InventoryColumnField.barcode]]: item.barcode,
      [InventoryExportField[InventoryColumnField.variant_prices]]: price,
      [InventoryExportField[InventoryColumnField.total_stock]]: item.total_stock ? item.total_stock : null,
      [InventoryExportField[InventoryColumnField.on_hand]]: item.on_hand ? item.on_hand : null,
      [InventoryExportField[InventoryColumnField.available]]: item.available ? item.available : null,
      [InventoryExportField[InventoryColumnField.committed]]: item.committed ? item.committed : null,
      [InventoryExportField[InventoryColumnField.on_hold]]: item.on_hold ? item.on_hold : null,
      [InventoryExportField[InventoryColumnField.defect]]: item.defect ? item.defect : null,
      [InventoryExportField[InventoryColumnField.in_coming]]: item.in_coming ? item.in_coming : null,
      [InventoryExportField[InventoryColumnField.transferring]]: item.transferring ? item.transferring : null,
      [InventoryExportField[InventoryColumnField.on_way]]: item.on_way ? item.on_way : null,
      [InventoryExportField[InventoryColumnField.shipping]]: item.shipping ? item.shipping : null,
    };
  }

  const getItemsByCondition = useCallback(async (type: string) => {
    let res: any; 
    let items: Array<InventoryResponse> = [];
    const limit = 200;
    let times = 0;
    setStatusExportDetail(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
    switch (type) {
      case TYPE_EXPORT.page:
        res = await callApiNative({ isShowLoading: false }, dispatch, searchVariantsInventoriesApi, {...params,limit: params.limit ?? 200});
        if (res) {
          items= items.concat(res.items);
        }
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
          
          const res = await callApiNative({ isShowLoading: false }, dispatch, searchVariantsInventoriesApi, {...params,page: index,limit:limit});
          if (res) {
            items= items.concat(res.items);
          }
          const percent = Math.round(Number.parseFloat((index/times).toFixed(2))*100);
          setExportProgressDetail(percent);
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
          
           const res = await callApiNative({ isShowLoading: false }, dispatch, searchVariantsInventoriesApi, {...params,page: index,limit:limit});
           if (res) {
            items= items.concat(res.items);
          }
          const percent = Math.round(Number.parseFloat((index/times).toFixed(2))*100);
          setExportProgressDetail(percent);
        }
        break;
      default:
        break;
    }
    setExportProgressDetail(100);
    return items;
  },[dispatch,selected,params,data,totalItems])

  const actionExport = {
    Ok: async (typeExport: string) => {
      setStatusExportDetail(STATUS_IMPORT_EXPORT.DEFAULT);
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
        showWarning("Bạn chưa chọn sản phẩm nào để xuất file");
        setVExportInventory(false);
        return;
      }

      const res = await getItemsByCondition(typeExport);
      if (res && res.length === 0) {
        setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
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
      setStatusExportDetail(STATUS_IMPORT_EXPORT.JOB_FINISH);
      const today = moment(new Date(), 'YYYY/MM/DD');

      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const month = today.format('M');
      const day   = today.format('D');
      const year  = today.format('YYYY');
      //XLSX.writeFile(workbook, `inventory_${day}_${month}_${year}.xlsx`);
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, `inventory_${day}_${month}_${year}.xlsx`);
      setVExportInventory(false);
      setExportProgressDetail(0);
      setStatusExportDetail(0);
    },
    Cancel: () => {
      setVExportInventory(false);
      setExportProgressDetail(0);
      setStatusExportDetail(0);
    },
    OnExport: useCallback(()=>{
      let remain = "total_stock";
      if (params.remain) {
        remain= params.remain;
      }
      
      let objConditions = {
        store_ids: params.store_ids?.toString(),
        remain: remain
      };
      let conditions = "remain=total_stock";
      if (params.store_ids) {
        conditions = `store_ids=${objConditions.store_ids}&remain=${objConditions.remain}`;
      }
      
      exportFileV2({
        conditions: conditions,
        type: "TYPE_EXPORT_INVENTORY",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch(() => {
          setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },[listExportFile, params.remain, params.store_ids])
  }

  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.total || response.data.total !== 0) {
            const percent = Math.round(Number.parseFloat((response.data.num_of_record/response.data.total).toFixed(2))*100);
            setExportProgress(percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();
            setListExportFile(newListExportFile);
            setExportProgress(100);
          }
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  useEffect(()=>{
    getConfigColumnInventory();
  },[getConfigColumnInventory]);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [params,defaultColumns, selected, objSummaryTable]);

  return (
    <div>
      <AllInventoryFilter
        openColumn={openColumn}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={stores}
        onChangeKeySearch={(value: string,filters: any)=>{
          onChangeKeySearch(value,filters);
        }}
      />
      <CustomTable
        className="small-padding"
        bordered
        isRowSelection
        isLoading={loading}
        dataSource={data.items}
        scroll={{x: 1200}}
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
            width: "auto",
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

          onSaveConfigColumn(data, columnsInRow);
        }}
        data={columns}
      />
       <InventoryExport
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        visible={vExportInventory}
        exportProgressDetail={exportProgressDetail}
        statusExportDetail={statusExportDetail}
      />
       {showExportModal && (
         <InventoryExportModal
           visible={showExportModal}
           onCancel={() => {
             setShowExportModal(false);
             setExportProgress(0);
             setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
           }}
           onOk={actionExport.OnExport}
           exportProgress={exportProgress}
           statusExport={statusExport}
         />
       )}
    </div>
  );
};

export default AllTab;
