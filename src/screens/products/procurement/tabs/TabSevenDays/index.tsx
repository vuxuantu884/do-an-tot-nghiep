import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { StyledComponent } from "./styles";
import {
  POSearchProcurement
} from "domain/actions/po/po-procument.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  ProcurementQuery,
  PurchaseProcument,
  PurchaseProcumentLineItem
} from "model/purchase-order/purchase-procument";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { ProcumentStatus, ProcurementStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT, getStartOfDay } from "utils/DateUtils";
import { Link } from "react-router-dom";
import UrlConfig from "../../../../../config/url.config";
import TabCurrentFilter from "../../filter/TabCurrent.filter";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useHistory } from "react-router";
import { generateQuery } from "utils/AppUtils";
import moment from "moment";

const TabSevenDays: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [selected, setSelected] = useState<Array<PurchaseProcument>>([]);

  const today = new Date();
  const [params, setParams] = useState<ProcurementQuery>({});
  const search = useCallback(() => {
    const search = new URLSearchParams(history.location.search);
    const newParams = {
      ...params,
      is_cancel: false,
      status: ProcumentStatus.NOT_RECEIVED,
      expect_receipt_from: getStartOfDay(today),
      expect_receipt_to: moment(today).add(7, 'days').endOf('day').format(`YYYY-MM-DDTHH:mm:ss`).toString() + "Z",
      ...getQueryParams(search),
    }
    setLoading(true);
    dispatch(
      POSearchProcurement(newParams, (result) => {
        setLoading(false);
        if (result) {
          setData(result);
        }
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, history.location.search, params]);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      history.replace(
        `${UrlConfig.PROCUREMENT}/seven-days?${generateQuery(params)}`
      );
    },
    [history, params]
  );

  const defaultColumns: Array<ICustomTableColumType<PurchaseProcument>> = useMemo(()=> {
    return [
      {
        title: "Mã nhập kho",
        dataIndex: "code",
        fixed: "left",
        render: (value) => value,
        width: 150,
      },
      {
        title: "Mã đơn đặt hàng",
        dataIndex: "purchase_order",
        fixed: "left",
        width: 150,
        visible: true,
        render: (value) => {
          return (
            <Link to={`${UrlConfig.PURCHASE_ORDERS}/${value.id}`}>
              {value.code}
            </Link>
          );
        },
      },
      {
        title: "Mã tham chiếu",
        dataIndex: "purchase_order",
        fixed: "left",
        width: 120,
        visible: true,
        render: (value) => {
          return (value?.reference)
        },
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "purchase_order",
        visible: true,
        width: 150,
        render: (value, row) => {
          return (
            <Link
              to={`${UrlConfig.SUPPLIERS}/${row.purchase_order.supplier_id}`}
              className="link-underline"
              target="_blank"
            >
              {value?.supplier}
            </Link>
          )
        }
      },
      {
        title: "Merchandiser",
        dataIndex: "purchase_order",
        visible: true,
        render: (value, row) => {
          if (!row || !row.purchase_order.merchandiser_code || !row.purchase_order.merchandiser) return "";
          return (
            <Link
              to={`${UrlConfig.ACCOUNTS}/${row.purchase_order.merchandiser_code}`}
              className="link-underline"
              target="_blank"
            >
              {`${row.purchase_order.merchandiser_code} - ${row.purchase_order.merchandiser}`}
            </Link>
          )
        },
      },
      {
        title: "Kho nhận hàng dự kiến",
        dataIndex: "store",
        render: (value) => value,
        visible: true,
        width: 200,
      },
      {
        title: "Ngày nhận hàng dự kiến",
        dataIndex: "expect_receipt_date",
        visible: true,
        render: (value) =>
          ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
        width: 200,
      },
      {
        title: "SL được duyệt",
        align: "center",
        dataIndex: "procurement_items",
        visible: true,
        render: (value, record: PurchaseProcument) => {
          if (
            record.status === ProcurementStatus.not_received ||
            record.status === ProcurementStatus.received
          ) {
            let totalConfirmQuantity = 0;
            value.forEach((item: PurchaseProcumentLineItem) => {
              totalConfirmQuantity += item.quantity;
            });
            return totalConfirmQuantity;
          }
        },
      },
      {
        title: "Ngày tạo",
        align: "center",
        dataIndex: "created_date",
        visible: true,
        render: (value) => ConvertUtcToLocalDate(value),
      },
      {
        title: "Người tạo",
        dataIndex: "created_name",
        visible: true,
        render: (value) => value,
      },
    ]
  },[]);

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<PurchaseProcument>>
    >(defaultColumns);

  const onSelectedChange = useCallback(
    (selectedRow: Array<PurchaseProcument>) => {

      setSelected(
        selectedRow.filter(function (el) {
          return el !== undefined;
        })
      );
    },
    []
  );

  useEffect(() => {
    setColumns(defaultColumns);
  }, [selected, defaultColumns]);

  useEffect(() => {
    search();
  }, [search, history.location.search]);

  const query = useQuery();
  let paramsUrl: any = useMemo(() => {
    return {...getQueryParams(query)}
  }, [query]);

  return (
    <StyledComponent>
      <div className="margin-top-20">
        <TabCurrentFilter paramsUrl={paramsUrl} />
        <CustomTable
          isLoading={loading}
          dataSource={data.items}
          sticky={{ offsetScroll: 5, offsetHeader: 109 }}
          scroll={{ x: 1400 }}
          columns={columns}
          rowKey={(item) => item.id}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
        />
      </div>
    </StyledComponent>
  );
};

export default TabSevenDays;
