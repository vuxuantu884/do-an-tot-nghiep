import CustomPagination from "component/table/CustomPagination";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import {AppConfig} from "config/app.config";
import { HttpStatus } from "config/http-status.config";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import {inventoryByVariantAction, updateConfigInventoryAction} from "domain/actions/inventory/inventory.action";
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
import { InventoryColumnField } from "model/inventory/field";
import { FilterConfig, FilterConfigRequest } from "model/other";
import {VariantResponse, VariantSearchQuery} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {HiChevronDoubleRight, HiOutlineChevronDoubleDown} from "react-icons/hi";
import {useDispatch, useSelector} from "react-redux";
import {Link, useHistory} from "react-router-dom";
import { getInventoryConfigService } from "service/inventory";
import {formatCurrencyForProduct, generateQuery, Products, splitEllipsis} from "utils/AppUtils";
import {COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE} from "utils/Constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import AllInventoryFilter from "../filter/all.filter";
import "./index.scss"
import InventoryExport from "../component/InventoryExport";
import { TYPE_EXPORT } from "screens/products/constants";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import InventoryExportModal from "../component/InventoryExportV2";
import ImageProduct from "screens/products/product/component/image-product.component";
import { Image } from "antd";

let varaintName = "";

export const STATUS_IMPORT_EXPORT = {
  DEFAULT: 1,
  CREATE_JOB_SUCCESS: 2,
  JOB_FINISH: 3,
  ERROR: 4,
};

enum EInventoryStatus {
  COMMITTED = "committed",
  ON_HOLD = "on_hold",
  IN_COMING = "in_coming",
  TRANSFERRING = "transferring",
  ON_WAY = "on_way",
}

type ConfigColumnInventory = {
  Columns: Array<ICustomTableColumType<InventoryResponse>>,
  ColumnDrill: Array<ICustomTableColumType<InventoryResponse>>
}

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
  const { stores,showExportModal,setShowExportModal,setVExportInventory,vExportInventory,setConditionFilter,setStoreIds} = props;
  const history = useHistory();
  const pageSizeOptions: Array<string> =["50","100"];
  const [objSummaryTable, setObjSummaryTable] = useState<SummaryInventory>();

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
  const [listExportFileDetail, setListExportFileDetail] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.DEFAULT);
  const [exportProgressDetail, setExportProgressDetail] = useState<number>(0);
  const [statusExportDetail, setStatusExportDetail] = useState<number>(0);

  const goDocument = useCallback((inventoryStatus: string,variantName: string,store_id?:number)=>{
    let linkDocument ="";
    let store_ids = undefined;
    if (store_id) {
      store_ids = store_id;
    }
    if (!store_id && params && params.store_ids) {
      store_ids = params.store_ids;
    }
    
    switch (inventoryStatus) {
      case EInventoryStatus.COMMITTED:
        linkDocument =`${UrlConfig.ORDER}?page=1&limit=30&is_online=true&sub_status_code=awaiting_shipper%2Cmerchandise_packed%2Cmerchandise_picking%2Ccoordinator_confirmed%2Ccoordinator_confirming%2Cawaiting_saler_confirmation%2Cawaiting_coordinator_confirmation%2Cfirst_call_attempt%2Csecond_call_attempt%2Cthird_call_attempt%2Crequire_warehouse_change&channel_codes=FB%2CWEBSITE%2CMOBILE_APP%2CLANDING_PAGE%2CADMIN%2CWEB%2CZALO%2CINSTAGRAM%2CTIKTOK
        ${store_ids ? `&store_ids=${store_ids}`: ''}&searched_product=${variantName}`;
        break;
      case EInventoryStatus.IN_COMING:
        linkDocument =`${UrlConfig.PROCUREMENT}/products?page=1&limit=30
        ${store_ids ? `&stores=${store_ids}`: ''}&content=${variantName}`;
        break;
      case EInventoryStatus.ON_HOLD:
        linkDocument =`${UrlConfig.INVENTORY_TRANSFERS}?page=1&limit=30&simple=true
        ${store_ids ? `&from_store_id=${store_ids}`: ''}&condition=${variantName}&status=confirmed`;
          break;
      case EInventoryStatus.ON_WAY:
        linkDocument =`${UrlConfig.INVENTORY_TRANSFERS}?page=1&limit=30&simple=true
        ${store_ids ? `&from_store_id=${store_ids}`: ''}&condition=${variantName}&status=transferring`;
          break;
      case EInventoryStatus.TRANSFERRING:
        linkDocument =`${UrlConfig.INVENTORY_TRANSFERS}/transferring-receive?page=1&limit=30&simple=true
        ${store_ids ? `&to_store_id=${store_ids}`: ''}&condition=${variantName}&status=transferring`;
          break;
      default:
        break;
    }
    return linkDocument;
  },[params])

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
      setConditionFilter(newPrams.info);
      setStoreIds(newPrams.store_ids);
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${InventoryTabUrl.ALL}?${queryParam}`);
    },
    [history, params, setConditionFilter, setStoreIds]
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
          let image = Products.findAvatar(record.variant_images);
           return (
             <div className="image-product">
              {image ? <Image width={40} height={40} placeholder="Xem" src={image.url ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={image} />}
              <div className="product-name">
                 <div>
                 <Link to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}>
                     {record.sku}
                   </Link>
                 </div>
                 <div>
                   <TextEllipsis value={strName} line={1} />
                 </div>
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
           return formatCurrencyForProduct(price ? price.retail_price : 0);
         },
       },
       {
         title: "Danh mục",
         titleCustom: "Danh mục",
         visible: false,
         dataIndex: "category",
         align: "left",
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
           return <div> {value ? formatCurrencyForProduct(record.total_stock): ""}</div>;
         },
       },
       {
        title: HeaderSummary(objSummaryTable?.Sum_On_hand,"Tồn trong kho",
                            InventoryColumnField.on_hand,
                            (sortColumn:string)=>{onSortASC(sortColumn)},
                            (sortColumn:string)=>{onSortDESC(sortColumn)}),
         titleCustom: "Tồn trong kho",
         visible: true,
         dataIndex: `on_hand`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
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
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
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
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.COMMITTED,record.name)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
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
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.ON_HOLD,record.name)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
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
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
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
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.IN_COMING,record.name)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
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
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.TRANSFERRING,record.name)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
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
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.ON_WAY,record.name)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
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
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
         },
       }
     ]
   },[objSummaryTable, onSortDESC, onSortASC,goDocument]);   

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
           return <div> {value ? formatCurrencyForProduct(record.total_stock): ""}</div>;
         },
       },
       {
         title: "Tồn trong kho",
         dataIndex: `on_hand`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
         },
       },
       {
         title: "Có thể bán",
         dataIndex: `available`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
         },
       },
       {
         title: "Đang giao dịch",
         dataIndex: `committed`,
         align: "center",
         width: 80, 
         render: (value: number,record: InventoryResponse) => {
           console.log('record',record);
           
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.COMMITTED,varaintName,record.store_id)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
         },
       },
       {
         title: "Tạm giữ",
         dataIndex: `on_hold`,
         align: "center",
         width: 80,
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.ON_HOLD,varaintName,record.store_id)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
         },
       },{
         title: "Hàng lỗi",
         dataIndex: `defect`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
         },
       },{
         title: "Chờ nhập",
         dataIndex: `in_coming`,
         align: "center",
         width: 80,
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.IN_COMING,varaintName,record.store_id)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
         },
       },{
         title: "Hàng chuyển đến",
         dataIndex: `transferring`,
         align: "center",
         width: 80,
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.TRANSFERRING,varaintName,record.store_id)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
         },
       },{
         title: "Hàng chuyển đi",
         dataIndex: `on_way`,
         align: "center",
         width: 80,
         render: (value: number,record: InventoryResponse) => {
          return <div> {value ? 
              <Link target="_blank" to={goDocument(EInventoryStatus.ON_WAY,varaintName,record.store_id)}>
                     {formatCurrencyForProduct(value)}
              </Link>
            : ""}</div>;
         },
       },{
         title: "Đang giao",
         dataIndex: `shipping`,
         align: "center",
         width: 80,
         render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value): ""}</div>;
         },
       }
     ]
   },[goDocument]);

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
    dispatch(updateConfigInventoryAction(config));

  }, [dispatch,account?.code, lstConfig]);

  const getConditions = useCallback((type: string) => {
    let conditions = {};
    switch (type) {
      case TYPE_EXPORT.selected:
        let variant_ids = selected.map(e=>e.id).toString();
        const store_ids =  params.store_ids;  

        conditions = {store_ids: store_ids,
          variant_ids:variant_ids};
          
        break;
      case TYPE_EXPORT.page:
        conditions = {...params,
          limit: params.limit,
          page: 1};
        break;
      case TYPE_EXPORT.all:
        conditions = {...params
          ,page:undefined
          ,limit:undefined};
        break;
    }
    return conditions;
  },[params,selected])

  const actionExport = {
    Ok: async (typeExport: string) => {
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        setStatusExportDetail(0);
        showWarning("Bạn chưa chọn sản phẩm nào để xuất file");
        setVExportInventory(false);
        return;
      }
      const conditions =  getConditions(typeExport);
      
      const queryParam = generateQuery({...conditions});
      exportFileV2({
        conditions: queryParam,
        type: "TYPE_EXPORT_INVENTORY_DETAIL",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFileDetail([...listExportFile, response.data.code]);
          }
        })
        .catch(() => {
          setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    Cancel: () => {
      setVExportInventory(false);
      setShowExportModal(false);
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

  const checkExportFileDetail = useCallback(() => {
    let getFilePromises = listExportFileDetail.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.total || response.data.total !== 0) {
            const percent = Math.round(Number.parseFloat((response.data.num_of_record/response.data.total).toFixed(2))*100);
            setExportProgressDetail(percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFileDetail.filter((item) => {
              return item !== fileCode;
            });
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();
            setListExportFileDetail(newListExportFile);
            setExportProgressDetail(100);
          }
        }
      });
    });
  }, [listExportFileDetail]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  useEffect(() => {
    if (listExportFileDetail.length === 0 || statusExportDetail === 3) return;
    checkExportFileDetail();

    const getFileInterval = setInterval(checkExportFileDetail, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFileDetail, checkExportFileDetail, statusExportDetail]);

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
            varaintName = record.name;
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
        isSetDefaultColumn
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
