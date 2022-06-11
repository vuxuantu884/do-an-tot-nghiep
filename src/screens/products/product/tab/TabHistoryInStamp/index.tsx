import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { cloneDeep } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseQuery } from "model/base/base.query";
import {
  BarcodePrintHistoriesResponse,
  BarcodePrintTemEditNoteRequest,
  ProductBarcodePrintHistories,
  VariantResponse,
} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import ModalPickManyProduct from "screens/products/product/component/ModalPickManyProduct";
import { productGetHistoryInTem, productUpdateHistoryInTem } from "service/product/product.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, generateQuery, splitEllipsis } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { primaryColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { StyledComponent } from "../style";
import EditNoteBarcode from "./EditNoteBarcode";
import HistoryInStampFilter from "./HistoryInStampFilter";
interface IProps {
  visiblePickManyModal: boolean;
  onTogglePickManyModal: () => void;
}

const initQuery: BaseQuery = {
  sort_column: "created_date",
  sort_type: "desc",
};
const TabHistoryInStamp: React.FC<IProps> = (props) => {
  //props
  const { visiblePickManyModal, onTogglePickManyModal } = props;
  //page hooks
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  //page state
  const [data, setData] = useState<PageResponse<BarcodePrintHistoriesResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [showSettingColumn, setShowSettingColumn] = useState(false);

  //redux state
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions
  );

  const onResult = useCallback((result: PageResponse<BarcodePrintHistoriesResponse> | false) => {
    setLoading(false);
    if (result) {
      setData({ ...result });
    }
  }, []);

  const dataQuery: ProductBarcodePrintHistories = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [params, setParams] = useState<ProductBarcodePrintHistories>(dataQuery);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      const queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${ProductTabUrl.STAMP_PRINTING_HISTORY}?${queryParam}`);
    },
    [history, params]
  );

  const getTotalQuantityPrint = useCallback(() => {
    const barcodePrintHistories = cloneDeep(data.items);
    const total = barcodePrintHistories.reduce((value, element) => {
      return value + element.quantity_print || 0;
    }, 0);
    return formatCurrency(total, ".");
  }, [data]);

  const getTotalCountDistinct = useCallback(() => {
    const barcodePrintHistories = cloneDeep(data.items);
    const total: Array<any> = [];
    barcodePrintHistories.forEach((element) => {
      if (!total.includes(element.created_by)) {
        total.push(element.created_by);
      }
    });

    return formatCurrency(total.length, ".");
  }, [data]);

  const onFilter = useCallback(
    (values) => {
      const newPrams = {
        ...params,
        ...{
          ...values,
        },
        page: 1,
      };
      setParams(newPrams);
      const queryParam = generateQuery(newPrams);
      history.replace(`${ProductTabUrl.STAMP_PRINTING_HISTORY}?${queryParam}`);
    },
    [params, history]
  );

  const getDataPrintHistories = useCallback(
    async (paramsQuery: ProductBarcodePrintHistories) => {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        productGetHistoryInTem,
        paramsQuery
      );
      onResult(response);
    },
    [dispatch, onResult]
  );

  const onUpdateNoteItem = useCallback(
    async (
      note: Pick<BarcodePrintHistoriesResponse, "note">,
      item: BarcodePrintHistoriesResponse,
      paramsQuery: ProductBarcodePrintHistories
    ) => {
      setLoading(true);
      const values: BarcodePrintTemEditNoteRequest = {
        note,
      };
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        productUpdateHistoryInTem,
        item.id,
        values
      );
      if (response) {
        showSuccess("Cập nhật ghi chú thành công");
        getDataPrintHistories(paramsQuery);
      }
    },
    [dispatch, getDataPrintHistories]
  );

  const defaultColumns: Array<ICustomTableColumType<BarcodePrintHistoriesResponse>> =
    useMemo(() => {
      return [
        {
          title: "STT",
          key: "index",
          render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
          visible: true,
          width: 60,
          fixed: "left",
          align: "center",
        },
        {
          title: "Sản phẩm",
          dataIndex: "",
          fixed: "left",
          visible: true,
          render: (value, item) => {
            let strName = item.name.trim();
            strName =
              window.screen.width >= 1920
                ? splitEllipsis(strName, 100, 30)
                : window.screen.width >= 1600
                  ? (strName = splitEllipsis(strName, 60, 30))
                  : window.screen.width >= 1366
                    ? (strName = splitEllipsis(strName, 47, 30))
                    : strName;
            return (
              <div>
                <Link
                  to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}>
                  {item.sku}
                </Link>
                <div>
                  {" "}
                  <TextEllipsis value={strName} line={1} />
                </div>
              </div>
            );
          },
        },
        {
          title: "Giá bán",
          dataIndex: "retail_price",
          visible: true,
          align: "right",
          width: 120,
          render: (value) => (value ? formatCurrency(value) : "---"),
        },
        {
          title: (
            <div>
              Số lượng tem (<span style={{ color: "#2A2A86" }}>{getTotalQuantityPrint()}</span>)
            </div>
          ),
          dataIndex: "quantity_print",
          visible: true,
          align: "center",
          width: 200,
          render: (value) => value || "---",
        },
        {
          title: "Thơi gian in",
          dataIndex: "created_date",
          visible: true,
          align: "right",
          width: 120,
          render: (value) => (value ? ConvertUtcToLocalDate(value) : "---"),
        },
        {
          title: (
            <div>
              {" "}
              Người thao tác (<span style={{ color: "#2A2A86" }}>{getTotalCountDistinct()}</span>)
            </div>
          ),
          dataIndex: "created_by",
          visible: true,
          width: 200,
          render: (value, item) =>
            value ? (
              <div>
                {" "}
                <Link to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>{value}</Link>
                <div>{item.created_name}</div>
              </div>
            ) : (
              "---"
            ),
        },
        {
          title: "Mã tham chiếu",
          dataIndex: "order_reference",
          visible: true,
          fixed: "left",
        },
        {
          title: "Đơn đặt hàng",
          visible: true,
          align: "left",
          dataIndex: "supplier",
          width: 200,
          render: (value, item) => {
            return (
              <>
                {" "}
                {value || item.order_code ? (
                  <div>
                    <Link to={`${UrlConfig.PURCHASE_ORDERS}/${item.order_id}`}>
                      {item.order_code}
                    </Link>
                    {value && (
                      <div>
                        <span className="txt-muted">NCC: </span>{" "}
                        <Link to={`${UrlConfig.SUPPLIERS}/${item.supplier_id}`}>{value}</Link>
                      </div>
                    )}
                  </div>
                ) : (
                  "---"
                )}
              </>
            );
          },
        },
        {
          title: "Ghi chú",
          visible: true,
          align: "center",
          dataIndex: "note",
          render: (value, item) => {
            const hasPermission = [ProductPermission.update].some((element) => {
              return currentPermissions.includes(element);
            });
            return (
              <div className="note">
                <EditNoteBarcode
                  isHaveEditPermission={hasPermission}
                  note={value}
                  title=""
                  color={primaryColor}
                  onOk={(newNote) => {
                    const value = newNote as unknown;
                    const urlSearchParams = new URLSearchParams(window.location.search);
                    const paramsQuery = Object.fromEntries(urlSearchParams.entries());
                    onUpdateNoteItem(value as Pick<BarcodePrintHistoriesResponse, "note">, item, {
                      ...initQuery,
                      ...paramsQuery,
                    });
                  }}
                />
              </div>
            );
          },
          width: 200,
        },
      ];
    }, [currentPermissions, getTotalQuantityPrint, onUpdateNoteItem]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<BarcodePrintHistoriesResponse>>>(defaultColumns);

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  useEffect(() => {
    setLoading(true);
    getDataPrintHistories(params);
  }, [getDataPrintHistories, params]);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [defaultColumns]);

  return (
    <StyledComponent>
      <HistoryInStampFilter
        onMenuClick={() => { }}
        actions={[]}
        onFilter={onFilter}
        params={params}
        listCountries={[]}
        onClickOpen={() => setShowSettingColumn(true)}
      />
      <ModalPickManyProduct
        visible={visiblePickManyModal}
        onCancel={onTogglePickManyModal}
        selected={[]}
        onSave={(result: Array<VariantResponse>) => {
          history.push(`${UrlConfig.PRODUCT}/barcode`, { selected: result });
          onTogglePickManyModal();
        }}
      />
      <CustomTable
        className="small-padding"
        bordered
        isRowSelection={false}
        isShowPaginationAtHeader
        scroll={{ x: 1300 }}
        columns={columnFinal}
        dataSource={data.items}
        isLoading={loading}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
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
    </StyledComponent>
  );
};

export default TabHistoryInStamp;
