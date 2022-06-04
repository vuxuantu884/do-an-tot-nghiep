import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import TextEllipsis from "component/table/TextEllipsis";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import {
  BarcodePrintHistoriesResponse,
  ProductBarcodePrintHistories,
  VariantResponse
} from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import ModalPickManyProduct from "screens/products/product/component/ModalPickManyProduct";
import { productGetHistoryInTem } from "service/product/product.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, generateQuery, splitEllipsis } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { StyledComponent } from "../style";
interface IProps {
  visiblePickManyModal: boolean;
  onTogglePickManyModal: () => void;
}

const TabHistoryInTem: React.FC<IProps> = (props) => {
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

  const onResult = useCallback((result: PageResponse<BarcodePrintHistoriesResponse> | false) => {
    setLoading(false);
    if (result) {
      setData({ ...result });
    }
  }, []);


  let dataQuery: ProductBarcodePrintHistories = {
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<ProductBarcodePrintHistories>(dataQuery);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${ProductTabUrl.STAMP_PRINTING_HISTORY}?${queryParam}`);
    },
    [history, params]
  );
  const columns: Array<ICustomTableColumType<BarcodePrintHistoriesResponse>> = useMemo(
    () => [
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
        visible: true,
        render: (value, item) => {
          let strName = (item.name.trim());
          strName = window.screen.width >= 1920 ? splitEllipsis(strName, 100, 30)
            : window.screen.width >= 1600 ? strName = splitEllipsis(strName, 60, 30)
              : window.screen.width >= 1366 ? strName = splitEllipsis(strName, 47, 30) : strName;
          return (
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}>{item.sku}</Link>
              <div> <TextEllipsis value={strName} line={1} /></div>
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
        title: "Số lượng tem",
        dataIndex: "quantity_print",
        visible: true,
        align: "center",
        width: 120,
        render: (value) => value || "---",
      },
      {
        title: "Thơi gian in",
        dataIndex: "updated_date",
        visible: true,
        align: "right",
        width: 120,
        render: (value) => (value ? ConvertUtcToLocalDate(value) : "---"),
      },
      {
        title: "Người thao tác",
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
                  <Link to={`${UrlConfig.PURCHASE_ORDERS}/${item.order_id}`}>{item.order_code}</Link>
                  {value && <div><span className="txt-muted">NCC: </span>   <Link to={`${UrlConfig.SUPPLIERS}/${item.supplier_id}`}>{value}</Link></div>}
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
        align: "left",
        dataIndex: "note",
        render: (value) => (value ? <div>{value}</div> : "---"),
        width: 160,
      },
    ],
    []
  );

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);


  useEffect(() => {
    setLoading(true);
    const getDataPrintHistories = async () => {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        productGetHistoryInTem,
        params
      );
      onResult(response);
    };
    getDataPrintHistories();
  }, [dispatch, onResult, params]);

  return (
    <StyledComponent>
      <ModalPickManyProduct
        visible={visiblePickManyModal}
        onCancel={onTogglePickManyModal}
        selected={[]}
        onSave={(result: Array<VariantResponse>) => {
          history.push(`${UrlConfig.PRODUCT}/barcode`, { selected: result });
          onTogglePickManyModal();
        }} />
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
    </StyledComponent>
  );
};

export default TabHistoryInTem;
