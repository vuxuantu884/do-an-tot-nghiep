import UrlConfig, { ProcurementTabUrl } from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { ProcurementItemsReceipt, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { formatCurrency, generateQuery, splitEllipsis } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT, formatDateTimeFilter } from "utils/DateUtils";
import { StyledComponent } from "./style";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { Image } from "antd";
import ImageProduct from "screens/products/product/component/image-product.component";
import { useDispatch } from "react-redux";
import { getQueryParams, useQuery } from "utils/useQuery";
import { callApiNative } from "utils/ApiUtils";
import { getListProcurementItemsReceipt } from "service/purchase-order/purchase-procument.service";
import TextEllipsis from "component/table/TextEllipsis";
import { cloneDeep } from "lodash";
import TabProductsFilter from "../../filter/TabProducts.filter";
import { PhoneOutlined } from "@ant-design/icons";

interface TabProductsProps { }

const TabProducts: React.FC<TabProductsProps> = (props: TabProductsProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const query = useQuery();

  let paramsUrl: any = useMemo(() => {
    return { ...getQueryParams(query) }
  }, [query]);

  const [loading, setLoading] = useState<boolean>(false)
  // let [paramsUrl, setParamsUrl] = useState<any>(dataQuery);
  const [data, setData] = useState<PageResponse<ProcurementItemsReceipt>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [showSettingColumn, setShowSettingColumn] = useState(false);

  useEffect(() => {
    const getListProcurementItems = async () => {
      setLoading(true);
      const newParams = {
        ...paramsUrl,
        stock_in_date_from: paramsUrl.stock_in_date_from && formatDateTimeFilter(paramsUrl.stock_in_date_from, 'DD/MM/YYYY HH:mm')?.format(),
        stock_in_date_to: paramsUrl.stock_in_date_to && formatDateTimeFilter(paramsUrl.stock_in_date_to, 'DD/MM/YYYY HH:mm')?.format(),
      }
      const response = await callApiNative({ isShowError: true }, dispatch, getListProcurementItemsReceipt, newParams)
      if (response) {
        setData(response)
        setLoading(false);
      }
    }
    getListProcurementItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.search, dispatch]);

  const getTotalRealQuantity = useCallback((): string => {
    let total = 0
    const procurementItems = cloneDeep(data.items)
    procurementItems.forEach((item: ProcurementItemsReceipt) => {
      total += item.real_quantity
    })
    return formatCurrency(total, ".")
  }, [data])

  const defaultColumns: Array<ICustomTableColumType<ProcurementItemsReceipt>> = useMemo(() => {
    return [
      {
        title: "Ảnh",
        align: "center",
        dataIndex: "variant_image",
        width: 70,
        render: (value: string) => {
          // let url = null;
          // value.variant_images?.forEach((item) => {
          //     if (item.product_avatar) {
          //       url = item.url;
          //     }
          //   });
          return (
            <>
              {value ? <Image width={40} height={40} placeholder="Xem" src={value ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={value} />}
            </>
          );
        },
        visible: true,
      },
      {
        title: "Sản phẩm",
        dataIndex: "sku",
        width: 300,
        visible: true,
        render: (value, record, index) => {
          if (record.variant && value) {
            let strName = (record.variant.trim());
            strName = window.screen.width >= 1920 ? splitEllipsis(strName, 100, 30)
              : window.screen.width >= 1600 ? strName = splitEllipsis(strName, 60, 30)
                : window.screen.width >= 1366 ? strName = splitEllipsis(strName, 47, 30) : strName;
            return (
              <>
                <div>
                  <Link to={{
                    pathname: `${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`,
                  }}
                    target="_blank"
                  >
                    {value}
                  </Link>
                </div>
                <div><TextEllipsis value={strName} line={1} /></div>
              </>
            )
          } else {
            return ""
          }
        },
      },
      {
        title: "Mã phiếu nhập kho",
        dataIndex: "procurement",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value, record, index) => {
          if (!value) return ""
          return (
            <>
              <div>
                <Link to={{
                  pathname: `${UrlConfig.PURCHASE_ORDERS}/${record.procurement?.purchase_order?.id}/procurements/${value.id}`,
                }}
                  target="_blank"
                >
                  <b>{value.code}</b>
                </Link>
              </div>
              <div>
                <div>
                  Ngày nhận:
                  <div>{ConvertUtcToLocalDate(record.procurement?.stock_in_date, DATE_FORMAT.HHmm_DDMMYYYY)}</div>
                </div>
              </div>
            </>
          )
        },
      },
      {
        title: "Kho nhận",
        dataIndex: "procurement",
        width: 200,
        align: 'center',
        render: (value, record, index) => {
          return (
            <>
              {value.store}
            </>
          )
        },
        visible: true,
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "procurement",
        align: 'center',
        render: (value, record, index) => {
          return (
            <>
              <Link
                to={`${UrlConfig.SUPPLIERS}/${value.supplier_id}`}
                className="link-underline"
                target="_blank"
              >
                {value?.purchase_order?.supplier}
              </Link>
              <div>
                <PhoneOutlined /> {value?.purchase_order?.phone}
              </div>
            </>
          )
        },
        visible: true,
      },
      {
        title: <div>SL thực nhận (<span style={{ color: "#2A2A86" }}>{getTotalRealQuantity()}</span>)</div>,
        align: "center",
        dataIndex: "real_quantity",
        visible: true,
        width: 150,
        render: (value, record, index) => {
          return formatCurrency(value, ".");
        },
      },
      {
        title: "Người nhận",
        dataIndex: "procurement",
        width: 200,
        align: 'center',
        visible: true,
        render: (value: PurchaseProcument, row) => {
          if (value && value.stock_in_by) {
            const name = value.stock_in_by.split('-')
            return (
              <>
                <div>
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${name[0]}`}
                    className="primary"
                    target="_blank"
                  >
                    {name[0]}
                  </Link>
                </div>
                <b> {name[1]}</b>
              </>
            )
          } else {
            return ""
          }
        }
      },
      {
        title: "Ghi chú",
        align: "center",
        dataIndex: "procurement",
        visible: true,
        render: (value, record) => {
          return (value?.note)
        },
      },
    ]
  }, [getTotalRealQuantity]);

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<ProcurementItemsReceipt>>
  >(defaultColumns);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [defaultColumns]);

  const columnFinal = useMemo(() =>
    columns.filter((item) => item.visible === true)
    , [columns]);

  const onPageChange = useCallback((page: number, size?: number) => {
    paramsUrl.page = page;
    paramsUrl.limit = size;
    history.replace(
      `${ProcurementTabUrl.PRODUCTS}?${generateQuery(paramsUrl)}`
    );
  }, [paramsUrl, history]);

  return <StyledComponent>
    <div className="margin-top-20">
      <TabProductsFilter paramsUrl={paramsUrl} onClickOpen={() => setShowSettingColumn(true)} />
      <CustomTable
        isRowSelection
        // selectedRowKey={selected.map(e => e.id)}
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        columns={columnFinal}
        rowKey={(item) => item.id}
        // scroll={{ x: 2000 }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        // onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
        isShowPaginationAtHeader
        bordered
      />
      {
        showSettingColumn && (
          <ModalSettingColumn
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumns(data);
            }}
            data={columns}
          />
        )
      }
    </div>
  </StyledComponent>
}

export default TabProducts