import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { AppConfig } from "config/app.config";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { inventoryByVariantAction } from "domain/actions/inventory/inventory.action";
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
import { Link, useHistory, useLocation } from "react-router-dom";
import { getInventoryConfigService, updateInventoryConfigService } from "service/inventory";
import { generateQuery } from "utils/AppUtils";
import {
  ellipseName,
  findAvatar,
  findPrice,
  FINISH_PROCESS_PERCENT,
  formatCurrencyForProduct,
  START_PROCESS_PERCENT,
} from "screens/products/helper";
import {
  COLUMN_CONFIG_TYPE,
  FulFillmentStatus,
  OFFSET_HEADER_TABLE,
  POS,
  ProcurementStatus,
  TYPE_EXPORT,
} from "utils/Constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import AllInventoryFilter from "../filter/all.filter";
import "./index.scss";
import InventoryExport from "../component/InventoryExport";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import InventoryExportModal from "../component/InventoryExportV2";
import { ImageProduct } from "screens/products/product/component";
import { Image } from "antd";
import { callApiNative } from "utils/ApiUtils";
import { searchVariantsInventoriesApi } from "service/product/product.service";
import { StoreResponse } from "model/core/store.model";
import { enumStoreStatus } from "model/warranty/warranty.model";
import TextEllipsis from "component/table/TextEllipsis";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import { STATUS_INVENTORY_TRANSFER } from "screens/inventory/constants";
import { OrderStatus, ORDER_SUB_STATUS } from "utils/Order.constants";
import useGetChannels from "hook/order/useGetChannels";
import { ChannelResponse } from "model/response/product/channel.response";
import { BaseQuery } from "model/base/base.query";
import { EnumJobStatus } from "config/enum.config";
import { AccountStoreResponse } from "model/account/account.model";
import queryString from "query-string";

let variantName = "";
let variantSKU = "";

export const STATUS_IMPORT_EXPORT = {
  NONE: 0,
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
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const { account } = userReducer;
  const query = useQuery();
  const dispatch = useDispatch();
  const location = useLocation();
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

  const [lstConfig, setLstConfig] = useState<Array<FilterConfig>>([]);
  const [selected, setSelected] = useState<Array<InventoryResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [listExportFileDetail, setListExportFileDetail] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(START_PROCESS_PERCENT);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.NONE);
  const [exportProgressDetail, setExportProgressDetail] = useState<number>(START_PROCESS_PERCENT);
  const [statusExportDetail, setStatusExportDetail] = useState<number>(STATUS_IMPORT_EXPORT.NONE);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [isLoadingExportDetail, setIsLoadingExportDetail] = useState(false);
  const [columnsConfig, setColumnsConfig] = useState<
    Array<ICustomTableColumType<InventoryResponse>>
  >([]);
  const channels = useGetChannels();

  const goDocument = useCallback(
    (inventoryStatus: string, sku: string, store_id?: number) => {
      let linkDocument = "";
      let store_ids: Array<number> | undefined;
      const newSku = sku || params.info;
      const baseQuery: BaseQuery = {
        page: 1,
        limit: 30,
      };
      if (store_id) {
        store_ids = [store_id];
      }
      if (!store_id && params && params.store_ids) {
        store_ids = Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids];
      }
      const channelCodesFilter: Array<string> = [];
      channels.forEach((channel: ChannelResponse) => {
        if (channel.code.toUpperCase() !== POS.channel_code) {
          channelCodesFilter.push(channel.code);
        }
      });
      switch (inventoryStatus) {
        case EInventoryStatus.COMMITTED:
          const committedQuery = generateQuery({
            ...baseQuery,
            is_online: true,
            order_status: OrderStatus.FINALIZED,
            searched_product: newSku,
            fulfillment_status: [FulFillmentStatus.CANCELLED, FulFillmentStatus.UNSHIPPED],
            sub_status_code: [
              ORDER_SUB_STATUS.first_call_attempt,
              ORDER_SUB_STATUS.second_call_attempt,
              ORDER_SUB_STATUS.third_call_attempt,
              ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
              ORDER_SUB_STATUS.coordinator_confirming,
              ORDER_SUB_STATUS.awaiting_saler_confirmation,
              ORDER_SUB_STATUS.coordinator_confirmed,
              ORDER_SUB_STATUS.require_warehouse_change,
              ORDER_SUB_STATUS.merchandise_picking,
              ORDER_SUB_STATUS.merchandise_packed,
              ORDER_SUB_STATUS.awaiting_shipper,
              ORDER_SUB_STATUS.out_of_stock,
              ORDER_SUB_STATUS.delivery_service_cancelled,
              ORDER_SUB_STATUS.customer_confirming,
            ],
            channel_codes: channelCodesFilter,
            store_ids: store_ids,
          });
          linkDocument = `${UrlConfig.ORDER}?${committedQuery}`;
          break;
        case EInventoryStatus.IN_COMING:
          const sevenDaysAgo = moment(new Date())
            .subtract(7, "days")
            .format(DATE_FORMAT.DD_MM_YYYY)
            .toString();
          const inComingQuery = generateQuery({
            ...baseQuery,
            stores: store_ids,
            status: [ProcurementStatus.draft, ProcurementStatus.not_received],
            expect_receipt_from: sevenDaysAgo,
            content: newSku,
          });
          linkDocument = `${UrlConfig.PROCUREMENT}?${inComingQuery}`;
          break;
        case EInventoryStatus.ON_HOLD:
          const onHoldQuery = generateQuery({
            ...baseQuery,
            simple: true,
            from_store_id: store_ids,
            status: [
              STATUS_INVENTORY_TRANSFER.CONFIRM.status,
              STATUS_INVENTORY_TRANSFER.PENDING.status,
            ],
            condition: newSku,
            pending: "excess",
          });
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}/export-import-list?${onHoldQuery}`;
          break;
        case EInventoryStatus.ON_WAY:
          const onWayQuery = generateQuery({
            ...baseQuery,
            simple: true,
            from_store_id: store_ids,
            status: [
              STATUS_INVENTORY_TRANSFER.TRANSFERRING.status,
              STATUS_INVENTORY_TRANSFER.PENDING.status,
            ],
            condition: newSku,
            pending: "missing",
          });
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}/export-import-list?${onWayQuery}`;
          break;
        case EInventoryStatus.TRANSFERRING:
          const onTransferringQuery = generateQuery({
            ...baseQuery,
            simple: true,
            condition: newSku,
            to_store_id: store_ids,
            status: [STATUS_INVENTORY_TRANSFER.TRANSFERRING.status],
            pending: "missing",
          });
          linkDocument = `${UrlConfig.INVENTORY_TRANSFERS}/export-import-list?${onTransferringQuery}`;
          break;
        case EInventoryStatus.DEFECT:
          const defectQuery = generateQuery({
            ...baseQuery,
            store_ids: store_ids,
            condition: newSku,
          });
          linkDocument = `${UrlConfig.INVENTORY_DEFECTS}?${defectQuery}`;
          break;
        case EInventoryStatus.SHIPPING:
          const shippingQuery = generateQuery({
            ...baseQuery,
            is_online: true,
            fulfillment_status: [FulFillmentStatus.SHIPPING],
            searched_product: newSku,
            channel_codes: channelCodesFilter,
            store_ids: store_ids,
          });
          linkDocument = `${UrlConfig.ORDER}?${shippingQuery}`;
          break;
        default:
          break;
      }
      return linkDocument;
    },
    [channels, params],
  );

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

  const getInventories = useCallback(
    async (paramsQuery: VariantSearchQuery) => {
      const temps = { ...paramsQuery, limit: paramsQuery.limit ?? 50 };
      delete temps.status;
      setLoading(true);
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        searchVariantsInventoriesApi,
        temps,
      );
      onResult(res);
    },
    [dispatch, onResult],
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      getInventories(params);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [getInventories, history, location.pathname, params],
  );

  const onFilter = useCallback(
    (values) => {
      const newValues = { ...values, info: values.info?.trim() };
      const newPrams = { ...params, ...newValues, page: 1 };
      setConditionFilter(newPrams.info);
      setStoreIds(newPrams.store_ids);
      setPrams(newPrams);
      getInventories(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [getInventories, history, location.pathname, params, setConditionFilter, setStoreIds],
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
          const strName = ellipseName(record.name);
          const image = findAvatar(record.variant_images);
          return (
            <div className="image-product">
              {image ? (
                <Image width={40} height={40} placeholder="Xem" src={image.url ?? ""} />
              ) : (
                <ImageProduct isDisabled={true} path={image} />
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
          const price = findPrice(value, AppConfig.currency);
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
                <Link target="_blank" to={goDocument(EInventoryStatus.COMMITTED, record.sku)}>
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
                <Link target="_blank" to={goDocument(EInventoryStatus.ON_HOLD, record.sku)}>
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
              to={goDocument(EInventoryStatus.DEFECT, record.sku, record.store_id)}
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
        render: (value: number) => {
          return <div> {value ? formatCurrencyForProduct(value) : ""}</div>;
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
                <Link target="_blank" to={goDocument(EInventoryStatus.TRANSFERRING, record.sku)}>
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
                <Link target="_blank" to={goDocument(EInventoryStatus.ON_WAY, record.sku)}>
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
              to={goDocument(EInventoryStatus.SHIPPING, variantSKU, record.store_id)}
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
                  to={goDocument(EInventoryStatus.COMMITTED, variantSKU, record.store_id)}
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
                  to={goDocument(EInventoryStatus.ON_HOLD, variantSKU, record.store_id)}
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
              to={goDocument(EInventoryStatus.DEFECT, record.sku, record.store_id)}
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
        render: (value: number) => {
          return <div> {value ? formatCurrencyForProduct(value) : ""}</div>;
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
                  to={goDocument(EInventoryStatus.TRANSFERRING, variantSKU, record.store_id)}
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
                  to={goDocument(EInventoryStatus.ON_WAY, variantSKU, record.store_id)}
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
              to={goDocument(EInventoryStatus.SHIPPING, variantSKU, record.store_id)}
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

  useEffect(() => {
    setColumnsDrill(defaultColumnsDrill);
  }, [defaultColumnsDrill]);

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
        getInventories(newPrams);
        history.push(`${location.pathname}?${queryParam}`);
      }, 300),
    [params, getInventories, history, location.pathname],
  );

  const onChangeKeySearch = useCallback(
    (keyword: string, filters: any) => {
      debouncedSearch(keyword, filters);
    },
    [debouncedSearch],
  );

  useEffect(() => {
    if (stores.length === 0) return;
    const storeParams: Array<number> = [];
    account?.account_stores.forEach((el: AccountStoreResponse) => {
      const store = stores.find((item: StoreResponse) => item.id === el.store_id);
      if (store) {
        storeParams.push(store.id);
      }
    });
    const newParams = {
      ...params,
      remain: params.remain ? params.remain : "total_stock",
    };

    if (params.store_ids && Array.isArray(params.store_ids) && params.store_ids.length > 0) {
      newParams.store_ids = params.store_ids.map((i) => Number(i));
    } else if (params.store_ids && !Array.isArray(params.store_ids)) {
      newParams.store_ids = [Number(params.store_ids)];
    } else {
      newParams.store_ids = storeParams;
    }
    setPrams(newParams);
    getInventories(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, stores, getInventories]);

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
                  const userConfig = userConfigColumn.find(
                    (e) => e.type === COLUMN_CONFIG_TYPE.COLUMN_INVENTORY,
                  );
                  if (userConfig) {
                    let cf = JSON.parse(userConfig.json_content) as ConfigColumnInventory;
                    setColumnsConfig(cf.Columns);
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

  const onSaveConfigColumn = async (
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
    const res = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      updateInventoryConfigService,
      config,
    );
    if (res) {
      getConfigColumnInventory();
    }
  };

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
      setIsLoadingExportDetail(true);
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
          setIsLoadingExportDetail(false);
        });
    },
    Cancel: () => {
      setVExportInventory(false);
      setExportProgressDetail(START_PROCESS_PERCENT);
      setStatusExportDetail(STATUS_IMPORT_EXPORT.NONE);
      setIsLoadingExportDetail(false);
    },
    OnExport: useCallback(
      (typeExport: string) => {
        setIsLoadingExport(true);
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
            setIsLoadingExport(false);
            showError("Có lỗi xảy ra, vui lòng thử lại sau");
          });
      },
      [getConditions, listExportFile, params.remain, params.store_ids],
    ),
    cancelExport: () => {
      setShowExportModal(false);
      setExportProgress(START_PROCESS_PERCENT);
      setStatusExport(STATUS_IMPORT_EXPORT.NONE);
      setIsLoadingExport(false);
    },
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
          if (response.data && response.data.status === EnumJobStatus.finish) {
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
            setExportProgress(FINISH_PROCESS_PERCENT);
            setIsLoadingExport(false);
          }
          if (response.data && response.data.status === EnumJobStatus.error) {
            setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
            setIsLoadingExport(false);
          }
        } else {
          setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
          setIsLoadingExport(false);
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
          if (response.data && response.data.status === EnumJobStatus.finish) {
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
            setExportProgressDetail(FINISH_PROCESS_PERCENT);
            setIsLoadingExportDetail(false);
          }
          if (response.data && response.data.status === EnumJobStatus.error) {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
            setIsLoadingExportDetail(false);
          }
        } else {
          setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
          setIsLoadingExportDetail(false);
        }
      });
    });
  }, [listExportFileDetail]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === STATUS_IMPORT_EXPORT.JOB_FINISH) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  useEffect(() => {
    if (listExportFileDetail.length === 0 || statusExportDetail === STATUS_IMPORT_EXPORT.JOB_FINISH)
      return;
    checkExportFileDetail();

    const getFileInterval = setInterval(checkExportFileDetail, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFileDetail, checkExportFileDetail, statusExportDetail]);

  // lock to skip column display config re-fetching
  const [isColumnConfigFetchSucceed, setIsColumnConfigFetched] = useState(false);

  useEffect(() => {
    // only fetch one when it had sumData
    if (objSummaryTable && !isColumnConfigFetchSucceed) {
      getConfigColumnInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objSummaryTable]);

  useEffect(() => {
    if (columnsConfig.length === 0) {
      setColumns(defaultColumns);
    } else {
      const newColumns: Array<ICustomTableColumType<InventoryResponse>> = columnsConfig.map((i) => {
        const newObject = defaultColumns.find((j) => i.dataIndex === j.dataIndex);
        return {
          ...newObject,
          visible: i.visible,
        };
      });
      setColumns(newColumns);
    }
  }, [defaultColumns, columnsConfig]);

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
        expandable={
          data.items.length > 0
            ? {
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

                  variantName = record.name;
                  variantSKU = record.sku;
                  setExpandRow([record.id]);
                  const store_ids: Array<number | string> = params.store_ids
                    ? params.store_ids.toString().split(",")
                    : [];
                  const store_ids_result: Array<number> = store_ids.reduce((acc, ele) => {
                    if (ele && Number(ele)) acc.push(Number(ele));
                    return acc;
                  }, [] as Array<number>);
                  fetchInventoryByVariant([record.id], store_ids_result, variantSKU, variantName);
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
              }
            : undefined
        }
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
            title: "Giá bán",
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
        defaultColumns={defaultColumns}
      />
      <InventoryExport
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        visible={vExportInventory}
        exportProgressDetail={exportProgressDetail}
        statusExportDetail={statusExportDetail}
        isLoadingExportDetail={isLoadingExportDetail}
      />
      {showExportModal && (
        <InventoryExportModal
          visible={showExportModal}
          onCancel={actionExport.cancelExport}
          onOk={actionExport.OnExport}
          exportProgress={exportProgress}
          statusExport={statusExport}
          isLoadingExport={isLoadingExport}
        />
      )}
    </div>
  );
};

export default AllTab;
