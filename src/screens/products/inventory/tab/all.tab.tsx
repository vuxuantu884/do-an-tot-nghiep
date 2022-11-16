import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { AppConfig } from "config/app.config";
import { HttpStatus } from "config/http-status.config";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import {
  inventoryByVariantAction,
  updateConfigInventoryAction,
} from "domain/actions/inventory/inventory.action";
import { hideLoading } from "domain/actions/loading.action";
import { HeaderSummary, SortType } from "hook/filter/HeaderSummary";
import { debounce } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
  InventoryResponse,
  InventoryVariantListQuery,
} from "model/inventory";
import { InventoryColumnField } from "model/inventory/field";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiChevronDoubleRight, HiOutlineChevronDoubleDown } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { getInventoryConfigService } from "service/inventory";
import { formatCurrencyForProduct, generateQuery, Products, splitEllipsis } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE } from "utils/Constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import AllInventoryFilter from "../filter/all.filter";
import "./index.scss";
import InventoryExport from "../component/InventoryExport";
import { TYPE_EXPORT } from "screens/products/constants";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import InventoryExportModal from "../component/InventoryExportV2";
import ImageProduct from "screens/products/product/component/image-product.component";
import { Image } from "antd";
import { callApiNative } from "utils/ApiUtils";
import { searchVariantsInventoriesApi } from "service/product/product.service";
import { StoreResponse } from "model/core/store.model";
import { enumStoreStatus } from "model/warranty/warranty.model";
import TextEllipsis from "component/table/TextEllipsis";

let varaintName = "";
let variantSKU = "";

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
  DEFECT = "defect",
  SHIPPING = "shipping",
}

type ConfigColumnInventory = {
  Columns: Array<ICustomTableColumType<InventoryResponse>>;
  ColumnDrill: Array<ICustomTableColumType<InventoryResponse>>;
};

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
  const {
    stores,
    showExportModal,
    setShowExportModal,
    setVExportInventory,
    vExportInventory,
    setConditionFilter,
    setStoreIds,
  } = props;
  const history = useHistory();
  const pageSizeOptions: Array<string> = ["50", "100"];
  const [objSummaryTable, setObjSummaryTable] = useState<SummaryInventory>();

  const query = useQuery();

  const dispatch = useDispatch();
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

  const [expandRow, setExpandRow] = useState<Array<number> | undefined>();
  const [inventoryVariant, setInventoryVariant] = useState<Map<number, AllInventoryResponse[]>>(
    new Map(),
  );

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const { account } = userReducer;
  const [lstConfig, setLstConfig] = useState<Array<FilterConfig>>([]);
  const [selected, setSelected] = useState<Array<InventoryResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [listExportFileDetail, setListExportFileDetail] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(0);
  const [exportProgressDetail, setExportProgressDetail] = useState<number>(0);
  const [statusExportDetail, setStatusExportDetail] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const goDocument = useCallback(
    (
      inventoryStatus: string,
      sku: string,
      variantName: string,
      store_id?: number,
      shipBackToStore?: boolean,
    ) => {
      let linkDocument = "";
      let newSku = sku || params.info;
      let store_ids: any = undefined;
      if (store_id) {
        store_ids = store_id;
      }
      if (!store_id && params && params.store_ids) {
        store_ids = params.store_ids;
      }

      switch (inventoryStatus) {
        case EInventoryStatus.COMMITTED:
          linkDocument = `${
            UrlConfig.ORDER
          }?page=1&limit=30&is_online=true&order_status=finalized&sub_status_code=out_of_stock%2Cawaiting_coordinator_confirmation%2Cfirst_call_attempt%2Csecond_call_attempt%2Cthird_call_attempt%2Ccoordinator_confirming%2Cawaiting_saler_confirmation%2Ccoordinator_confirmed%2Crequire_warehouse_change%2Cmerchandise_picking%2Cmerchandise_packed%2Cawaiting_shipper&channel_codes=FB%2CWEBSITE%2CMOBILE_APP%2CLANDING_PAGE%2CADMIN%2CWEB%2CZALO%2CINSTAGRAM%2CTIKTOK%20%20%20%20%20%20%20%20%2CShopee%2CAPP%2CLANDINGPAGE%2Cpos%2Cweb%2Clazada%2Csendo%2Ctiki%2Czalo%2Cinstagram%2Ctiktok%2Capi%2Cadayroi%2Cvatgia%2C1Landingvn%20%20%20%20%20%20%20%20%2CSHOPEE%2CPOS%2CTIKI%2CSENDO%2CLAZADA%2CTIKTOK&searched_product=${variantName}${
            store_ids ? `&store_ids=${store_ids}` : ""
          }`;
          break;
        case EInventoryStatus.IN_COMING:
          linkDocument = `${UrlConfig.PROCUREMENT}/products?page=1&limit=30
        ${store_ids ? `&stores=${store_ids}` : ""}&content=${newSku}`;
          break;
        case EInventoryStatus.ON_HOLD:
          linkDocument = `${
            UrlConfig.INVENTORY_TRANSFERS
          }/export-import-list?page=1&limit=30&simple=true
        ${
          store_ids ? `&from_store_id=${store_ids}` : ""
        }&condition=${newSku}&status=confirmed,pending&pending=excess`;
          break;
        case EInventoryStatus.ON_WAY:
          linkDocument = `${
            UrlConfig.INVENTORY_TRANSFERS
          }/export-import-list?page=1&limit=30&simple=true
        ${
          store_ids ? `&from_store_id=${store_ids}` : ""
        }&condition=${newSku}&status=transferring,pending&pending=missing`;
          break;
        case EInventoryStatus.TRANSFERRING:
          linkDocument = `${
            UrlConfig.INVENTORY_TRANSFERS
          }/export-import-list?page=1&limit=30&simple=true
        ${store_ids ? `&to_store_id=${store_ids}` : ""}&condition=${newSku}&status=transferring`;
          break;
        case EInventoryStatus.DEFECT:
          linkDocument = `${UrlConfig.INVENTORY_DEFECTS}?condition=${newSku}${
            store_ids ? `&store_ids=${store_ids}` : ""
          }`;
          break;
        case EInventoryStatus.SHIPPING:
          linkDocument = `${UrlConfig.ORDER}${
            !!shipBackToStore ? UrlConfig.ORDERS_RETURN + "?is_received=false&" : "?" // in case product is being shipped back to store
          }page=1&limit=30&is_online=true${
            store_ids ? `&store_ids=${store_ids}` : ""
          }&fulfillment_status=shipping&channel_codes=FB%2CPOS%2CSHOPEE%2CWEBSITE%2CAPP%2CLANDING_PAGE%2CADMIN%2CWEB%2CLAZADA%2CSENDO%2CTIKI%2CZALO%2CINSTAGRAM%2CTIKTOK&searched_product=${newSku}`;
          break;
        default:
          break;
      }
      return linkDocument;
    },
    [params],
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.push(`${UrlConfig.INVENTORY}${history.location.hash}?${queryParam}`);
    },
    [history, params],
  );

  const onFilter = useCallback(
    (values) => {
      const newValues = { ...values, info: values.info?.trim() };
      const newPrams = { ...params, ...newValues, page: 1 };
      setConditionFilter(newPrams.info);
      setStoreIds(newPrams.store_ids);
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);

      history.push(`${InventoryTabUrl.ALL}?${queryParam}`);
    },
    [history, params, setConditionFilter, setStoreIds],
  );

  const onSort = useCallback(
    (sort_column: string, sort_type: SortType) => {
      const newPrams = {
        ...params,
        sort_type,
        sort_column,
      };
      onFilter(newPrams);
    },
    [params, onFilter],
  );

  const ellipName = (str: string | undefined) => {
    if (!str) {
      return "";
    }
    let strName = str.trim();
    strName =
      window.screen.width >= 1920
        ? splitEllipsis(strName, 100, 30)
        : window.screen.width >= 1600
        ? splitEllipsis(strName, 60, 30)
        : window.screen.width >= 1366
        ? splitEllipsis(strName, 47, 30)
        : strName;
    return strName;
  };

  const defaultColumns: Array<ICustomTableColumType<InventoryResponse>> = useMemo(() => {
    return [
      {
        title: "Sản phẩm",
        visible: true,
        dataIndex: "sku",
        align: "left",
        fixed: "left",
        width: 250,
        className: "column-product",
        render: (value, record) => {
          let strName = ellipName(record.name);
          let image = Products.findAvatar(record.variant_images);
          return (
            <div className="image-product">
              {image ? (
                <Image width={40} height={40} placeholder="Xem" src={image.url ?? ""} />
              ) : (
                <ImageProduct disabled={true} onClick={undefined} path={image} />
              )}
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
          );
        },
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
        visible: true,
        dataIndex: "category",
        align: "left",
        width: 100,
        render: (value, row) => {
          return <div>{row.product?.category}</div>;
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_Total,
          "Tổng tồn",
          InventoryColumnField.total_stock,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.total_stock,
          "Tồn trong kho + Chuyển đi + Đang giao",
        ),
        titleCustom: "Tổng tồn",
        visible: true,
        dataIndex: `total_stock`,
        align: "center",
        width: 110,
        render: (value, record) => {
          return <div> {value ? formatCurrencyForProduct(record.total_stock) : ""}</div>;
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_On_hand,
          "Tồn trong kho",
          InventoryColumnField.on_hand,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.on_hand,
          "Số hàng vật lý, hàng trong kho thực tế của cửa hàng",
        ),
        titleCustom: "Tồn trong kho",
        visible: true,
        dataIndex: `on_hand`,
        align: "center",
        width: 110,
        render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value) : ""}</div>;
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_Available,
          "Có thể bán",
          InventoryColumnField.available,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.available,
          "Tồn kho - Đang giao dịch - Tạm giữ - Hàng lỗi",
        ),
        titleCustom: "Có thể bán",
        visible: true,
        dataIndex: `available`,
        align: "center",
        width: 110,
        render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value) : ""}</div>;
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_Committed,
          "Đang giao dịch",
          InventoryColumnField.committed,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.committed,
          "Số lượng sản phẩm trong đơn hàng online đã được xác nhận nhưng chưa giao cho khách",
        ),
        titleCustom: "Đang giao dịch",
        visible: true,
        dataIndex: `committed`,
        align: "center",
        width: 110,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(EInventoryStatus.COMMITTED, record.sku, record.name)}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_On_hold,
          "Tạm giữ",
          InventoryColumnField.on_hold,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.on_hold,
          "Số lượng sản phẩm trong phiếu chuyển kho đã được xác nhận nhưng chưa chuyển đi và hàng đang chờ xử lý khi có sai lệch số lượng chuyển - nhận",
        ),
        titleCustom: "Tạm giữ",
        visible: true,
        dataIndex: `on_hold`,
        align: "center",
        width: 100,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(EInventoryStatus.ON_HOLD, record.sku, record.name)}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_Defect,
          "Hàng lỗi",
          InventoryColumnField.defect,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.defect,
          "Số lượng sản phẩm bị lỗi về chất lượng, không bán được, chờ sửa hoặc hủy",
        ),
        titleCustom: "Hàng lỗi",
        visible: true,
        dataIndex: `defect`,
        align: "center",
        width: 80,
        render: (value, record) => {
          return (
            <Link
              target="_blank"
              to={goDocument(EInventoryStatus.DEFECT, record.sku, record.name, record.store_id)}
            >
              {value ? formatCurrencyForProduct(value) : ""}
            </Link>
          );
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_In_coming,
          "Chờ nhập",
          InventoryColumnField.in_coming,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.in_coming,
          "Số lượng sản phẩm chờ nhập từ nhà cung cấp",
        ),
        titleCustom: "Chờ nhập",
        visible: true,
        dataIndex: `in_coming`,
        align: "center",
        width: 80,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(EInventoryStatus.IN_COMING, record.sku, record.name)}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_Transferring,
          "Chuyển đến",
          InventoryColumnField.transferring,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.transferring,
          "Số lượng sản phẩm đang trên đường chuyển đến kho của mình",
        ),
        titleCustom: "Chuyển đến",
        visible: true,
        dataIndex: `transferring`,
        align: "center",
        width: 80,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(EInventoryStatus.TRANSFERRING, record.sku, record.name)}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_On_way,
          "Chuyển đi",
          InventoryColumnField.on_way,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.on_way,
          "Số lượng sản phẩm đang trên đường chuyển đến kho khác",
        ),
        titleCustom: "Chuyển đi",
        visible: true,
        dataIndex: `on_way`,
        align: "center",
        width: 80,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(EInventoryStatus.ON_WAY, record.sku, record.name)}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: HeaderSummary(
          objSummaryTable?.Sum_Shipping,
          "Đang giao",
          InventoryColumnField.shipping,
          onSort,
          params.sort_type,
          params.sort_column === InventoryColumnField.shipping,
          "Số lượng sản phẩm đang trên đường giao cho khách, thuộc quản lý của kho, cửa hàng",
        ),
        titleCustom: "Đang giao",
        visible: true,
        dataIndex: `shipping`,
        align: "center",
        width: 80,
        render: (value, record) => {
          return value ? (
            <Link
              target="_blank"
              to={goDocument(EInventoryStatus.SHIPPING, variantSKU, record.name, record.store_id)}
            >
              {value}
            </Link>
          ) : null;
        },
      },
    ];
  }, [objSummaryTable, onSort, params.sort_column, params.sort_type, goDocument]);

  const defaultColumnsDrill: Array<ICustomTableColumType<InventoryResponse>> = useMemo(() => {
    return [
      {
        title: "Kho hàng",
        dataIndex: "store_id",
        fixed: true,
        width: 250,
        render(value) {
          return <div>{storeRef.current.get(value)}</div>;
        },
      },
      {
        dataIndex: "variant_prices",
        align: "center",
        width: 110,
        fixed: true,
      },
      {
        dataIndex: "category",
        align: "left",
        width: 100,
        render: () => {
          return <></>;
        },
      },
      {
        title: "Tổng tồn",
        dataIndex: `total_stock`,
        align: "center",
        width: 110,
        render: (value, record) => {
          return <div> {value ? formatCurrencyForProduct(record.total_stock) : ""}</div>;
        },
      },
      {
        title: "Tồn trong kho",
        dataIndex: `on_hand`,
        align: "center",
        width: 110,
        render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value) : ""}</div>;
        },
      },
      {
        title: "Có thể bán",
        dataIndex: `available`,
        align: "center",
        width: 110,
        render: (value) => {
          return <div> {value ? formatCurrencyForProduct(value) : ""}</div>;
        },
      },
      {
        title: "Đang giao dịch",
        dataIndex: `committed`,
        align: "center",
        width: 110,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(
                    EInventoryStatus.COMMITTED,
                    variantSKU,
                    varaintName,
                    record.store_id,
                  )}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: "Tạm giữ",
        dataIndex: `on_hold`,
        align: "center",
        width: 100,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(
                    EInventoryStatus.ON_HOLD,
                    variantSKU,
                    varaintName,
                    record.store_id,
                  )}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: "Hàng lỗi",
        dataIndex: `defect`,
        align: "center",
        width: 80,
        render: (value, record) => {
          return (
            <Link
              target="_blank"
              to={goDocument(EInventoryStatus.DEFECT, record.sku, record.name, record.store_id)}
            >
              {value ? formatCurrencyForProduct(value) : ""}
            </Link>
          );
        },
      },
      {
        title: "Chờ nhập",
        dataIndex: `in_coming`,
        align: "center",
        width: 80,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(
                    EInventoryStatus.IN_COMING,
                    variantSKU,
                    varaintName,
                    record.store_id,
                  )}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: "Chuyển đến",
        dataIndex: `transferring`,
        align: "center",
        width: 80,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(
                    EInventoryStatus.TRANSFERRING,
                    variantSKU,
                    varaintName,
                    record.store_id,
                  )}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: "Chuyển đi",
        dataIndex: `on_way`,
        align: "center",
        width: 80,
        render: (value: number, record: InventoryResponse) => {
          return (
            <div>
              {" "}
              {value ? (
                <Link
                  target="_blank"
                  to={goDocument(EInventoryStatus.ON_WAY, variantSKU, varaintName, record.store_id)}
                >
                  {formatCurrencyForProduct(value)}
                </Link>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
      {
        title: "Đang giao",
        dataIndex: `shipping`,
        align: "center",
        width: 80,
        render: (value, record) => {
          return value ? (
            <Link
              target="_blank"
              to={goDocument(EInventoryStatus.SHIPPING, variantSKU, record.name, record.store_id)}
            >
              {value}
            </Link>
          ) : (
            ""
          );
        },
      },
    ];
  }, [goDocument]);

  let [columns, setColumns] =
    useState<Array<ICustomTableColumType<InventoryResponse>>>(defaultColumns);
  const [columnsDrill, setColumnsDrill] =
    useState<Array<ICustomTableColumType<InventoryResponse>>>(defaultColumnsDrill);

  const openColumn = useCallback(() => {
    setShowSettingColumn(true);
  }, []);

  const sumTable = (items: Array<VariantResponse> | Array<InventoryResponse>) => {
    let objSum: SummaryInventory = {
      Sum_Total: 0,
      Sum_On_hand: 0,
      Sum_Available: 0,
      Sum_Committed: 0,
      Sum_On_hold: 0,
      Sum_Defect: 0,
      Sum_In_coming: 0,
      Sum_Transferring: 0,
      Sum_On_way: 0,
      Sum_Shipping: 0,
    };

    items.forEach((e) => {
      if (!e) return;

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

    return objSum;
  };

  const onSelect = useCallback((selectedRow: Array<InventoryResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );

    if (selectedRow && selectedRow.length > 0) {
      const objSum = sumTable(selectedRow);

      setObjSummaryTable({ ...objSum });
    } else {
      setObjSummaryTable({ ...({} as SummaryInventory) });
    }
  }, []);

  const onResult = useCallback((result: PageResponse<VariantResponse> | false) => {
    setLoading(false);
    if (result) {
      setInventoryVariant(new Map());
      setData(result);
      setExpandRow([]);
      if (result.items && result.items.length > 0) {
        const objSum = sumTable(result.items);

        setObjSummaryTable({ ...objSum });
      } else {
        setObjSummaryTable({ ...({} as SummaryInventory) });
      }
    }
  }, []);
  const columnsFinal = useMemo(() => columns.filter((item) => item.visible), [columns]);

  const fetchInventoryByVariant = useCallback(
    (variant_ids: Array<number>, store_ids: Array<number>, variantSKU: string, name: string) => {
      const request: InventoryVariantListQuery = { variant_ids, store_ids, is_detail: true };
      if (params && params.remain) {
        request.remain = params.remain;
      }

      dispatch(
        inventoryByVariantAction(request, (result) => {
          if (variant_ids[0]) {
            const tempMap = new Map(inventoryVariant);
            const newResult = result.map((i) => {
              return {
                ...i,
                sku: variantSKU,
                name,
              };
            });
            tempMap.set(variant_ids[0], newResult);
            setInventoryVariant(tempMap);
          }
        }),
      );
    },
    [dispatch, inventoryVariant, params],
  );

  const debouncedSearch = React.useMemo(
    () =>
      debounce((keyword: string, filters: any) => {
        const newValues = { ...params, info: keyword?.trim(), ...filters };
        const newPrams = { ...params, ...newValues, page: 1 };
        setPrams(newPrams);
        let queryParam = generateQuery(newPrams);
        history.push(`${InventoryTabUrl.ALL}?${queryParam}`);
      }, 300),
    [params, history],
  );

  const onChangeKeySearch = useCallback(
    (keyword: string, filters: any) => {
      debouncedSearch(keyword, filters);
    },
    [debouncedSearch],
  );

  useEffect(() => {
    const getInventories = async () => {
      const temps = { ...params, limit: params.limit ?? 50 };
      delete temps.status;
      setLoading(true);
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        searchVariantsInventoriesApi,
        temps,
      );
      onResult(res);
    };
    getInventories();
  }, [dispatch, onResult, params]);

  const storeRef = useRef<Map<number, string>>(new Map<number, string>());
  useEffect(() => {
    if (Array.isArray(stores)) {
      stores.forEach((item) => {
        storeRef.current.set(item.id, item.name);
      });
    }
  }, [stores]);

  const getConfigColumnInventory = useCallback(() => {
    if (account && account.code) {
      getInventoryConfigService(account.code)
        .then((res) => {
          switch (res.code) {
            case HttpStatus.SUCCESS:
              if (res) {
                setLstConfig(res.data);
                if (res.data && res.data.length > 0) {
                  const userConfigColumn = res.data.filter(
                    (e) => e.type === COLUMN_CONFIG_TYPE.COLUMN_INVENTORY,
                  );
                  if (userConfigColumn.length === 0) return;
                  const userConfig = userConfigColumn.reduce((p, c) => (p.id > c.id ? p : c));
                  if (userConfig) {
                    let cf = JSON.parse(userConfig.json_content) as ConfigColumnInventory;

                    let isValidColumns = true;
                    for (let i = 0; i < cf.Columns.length; i++) {
                      if (typeof cf.Columns[i] === "string") {
                        isValidColumns = false;
                        break;
                      }
                    }

                    let isValidColumnsDrill = true;
                    for (let i = 0; i < cf.ColumnDrill.length; i++) {
                      if (typeof cf.ColumnDrill[i] === "object") {
                        isValidColumnsDrill = false;
                        break;
                      }
                    }

                    const newColumns: any = cf.Columns.map((i) => {
                      const newObject = defaultColumns.filter((j) => i.dataIndex === j.dataIndex);
                      return {
                        ...newObject[0],
                        visible: i.visible,
                      };
                    });

                    let newColumnsDrill: any = cf.ColumnDrill.map((i) => {
                      return defaultColumnsDrill.filter((j) => i === j.dataIndex)[0];
                    });

                    setColumns(isValidColumns ? newColumns : defaultColumns);
                    setColumnsDrill(isValidColumnsDrill ? newColumnsDrill : defaultColumnsDrill);

                    // if config is fetched and set successfully, indicate to skip next time
                    if (isValidColumns && isValidColumnsDrill) {
                      setIsColumnConfigFetched(true);
                    }
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
  }, [account, dispatch, defaultColumns, defaultColumnsDrill]);

  const onSaveConfigColumn = useCallback(
    (
      data: Array<ICustomTableColumType<InventoryResponse>>,
      dataDrill: Array<ICustomTableColumType<InventoryResponse>>,
    ) => {
      let config = lstConfig.find(
        (e) => e.type === COLUMN_CONFIG_TYPE.COLUMN_INVENTORY,
      ) as FilterConfigRequest;
      if (!config) config = {} as FilterConfigRequest;

      const newData = data.map((i) => {
        return {
          dataIndex: i.dataIndex,
          visible: i.visible,
        };
      });

      const configRequest = {
        Columns: newData,
        ColumnDrill: dataDrill.map((i: any) => i.dataIndex).filter((i) => i),
      } as ConfigColumnInventory;

      const json_content = JSON.stringify(configRequest);
      config.type = COLUMN_CONFIG_TYPE.COLUMN_INVENTORY;
      config.json_content = json_content;
      config.name = `${account?.code}_config_column_inventory`;
      dispatch(updateConfigInventoryAction(config));
    },
    [dispatch, account?.code, lstConfig],
  );

  const getConditions = useCallback(
    (type: string) => {
      let conditions = {};
      switch (type) {
        case TYPE_EXPORT.selected:
          let variant_ids = selected.map((e) => e.id).toString();
          const store_ids = params.store_ids;

          conditions = { store_ids: store_ids, variant_ids: variant_ids };

          break;
        case TYPE_EXPORT.page:
          conditions = {
            ...params,
            limit: params.limit,
            page: params.page ?? 1,
          };
          break;
        case TYPE_EXPORT.all:
          conditions = { ...params, page: undefined, limit: undefined };
          break;
      }
      return conditions;
    },
    [params, selected],
  );

  const actionExport = {
    Ok: async (typeExport: string) => {
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        setStatusExportDetail(0);
        showWarning("Bạn chưa chọn sản phẩm nào để xuất file");
        setVExportInventory(false);
        return;
      }
      const conditions = getConditions(typeExport);
      const queryParam = generateQuery({ ...conditions });
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
      setExportProgress(0);
      setStatusExport(0);
    },
    OnExport: useCallback(
      (typeExport: string) => {
        let objConditions = {
          store_ids: params.store_ids?.toString(),
          remain: params.remain,
        };

        let conditions: any = getConditions(typeExport);
        conditions.store_ids = objConditions.store_ids;
        conditions.remain = objConditions.remain;

        const queryParam = generateQuery({ ...conditions });

        exportFileV2({
          conditions: queryParam,
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
      },
      [getConditions, listExportFile, params.remain, params.store_ids],
    ),
  };

  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.total || response.data.total !== 0) {
            const percent = Math.round(
              Number.parseFloat((response.data.num_of_record / response.data.total).toFixed(2)) *
                100,
            );
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
            const percent = Math.round(
              Number.parseFloat((response.data.num_of_record / response.data.total).toFixed(2)) *
                100,
            );
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

  // lock to skip column display config re-fetching
  const [isColumnConfigFetchSucceed, setIsColumnConfigFetched] = useState(false);

  useEffect(() => {
    if (!isColumnConfigFetchSucceed) {
      getConfigColumnInventory();
    }
  }, [getConfigColumnInventory, isColumnConfigFetchSucceed]);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [defaultColumns]);

  return (
    <div>
      <AllInventoryFilter
        openColumn={openColumn}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={((stores || []) as StoreResponse[]).filter(
          (store) => store.status === enumStoreStatus.ACTIVE,
        )}
        onChangeKeySearch={(value: string, filters: any) => {
          onChangeKeySearch(value, filters);
        }}
      />
      <CustomTable
        isLoading={loading}
        isShowPaginationAtHeader
        className="small-padding"
        bordered
        dataSource={data.items}
        scroll={{ x: "max-content" }}
        sticky={{ offsetHeader: OFFSET_HEADER_TABLE, offsetSummary: 10 }}
        expandedRowKeys={expandRow}
        onSelectedChange={onSelect}
        pagination={{
          showSizeChanger: true,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          total: data.metadata.total,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
          pageSizeOptions: pageSizeOptions,
        }}
        expandable={{
          expandIcon: (props) => {
            let icon = <HiChevronDoubleRight size={12} />;
            if (props.expanded) {
              icon = <HiOutlineChevronDoubleDown size={12} color="#2A2A86" />;
            }
            return (
              <div
                style={{ cursor: "pointer" }}
                onClick={(event) => {
                  props.onExpand(props.record, event);
                }}
              >
                {icon}
              </div>
            );
          },
          onExpand: (expanded: boolean, record: VariantResponse) => {
            if (!expanded) {
              setExpandRow([]);
              return;
            }

            varaintName = record.name;
            variantSKU = record.sku;
            setExpandRow([record.id]);
            const store_ids: Array<number | string> = params.store_ids
              ? params.store_ids.toString().split(",")
              : [];
            const store_ids_result: Array<number> = store_ids.reduce((acc, ele) => {
              if (ele && Number(ele)) acc.push(Number(ele));
              return acc;
            }, [] as Array<number>);
            fetchInventoryByVariant([record.id], store_ids_result, variantSKU, varaintName);
          },

          expandedRowRender: (record: VariantResponse) => {
            return (
              <CustomTable
                bordered
                scroll={{ x: "max-content" }}
                showHeader={false}
                dataSource={inventoryVariant.get(record.id) || []}
                pagination={false}
                columns={columnsDrill}
              />
            );
          },
        }}
        columns={columnsFinal}
        rowKey={(data) => data.id}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        isSetDefaultColumn
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumns(data);
          let columnsInRow: any = data
            .filter(
              (e) =>
                e.visible === true &&
                e.dataIndex !== "sku" &&
                e.dataIndex !== "code" &&
                e.dataIndex !== "variant_prices",
            )
            .map((item: ICustomTableColumType<InventoryResponse>) => {
              return {
                title: item.title,
                dataIndex: item.dataIndex,
                align: item.align,
                width: item.width,
                fixed: item.fixed ?? false,
                render: item.render,
              };
            });
          columnsInRow.unshift({
            dataIndex: "variant_prices",
            align: "center",
            width: 110,
            fixed: true,
            render: () => {
              return <></>;
            },
          });
          columnsInRow.unshift({
            title: "Kho hàng",
            dataIndex: "store_id",
            align: "left",
            fixed: true,
            width: 250,
            render(value: any) {
              return <div>{storeRef.current.get(value)}</div>;
            },
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
          onCancel={actionExport.Cancel}
          onOk={actionExport.OnExport}
          exportProgress={exportProgress}
          statusExport={statusExport}
        />
      )}
    </div>
  );
};

export default AllTab;
