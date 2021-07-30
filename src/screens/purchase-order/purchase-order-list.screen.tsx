import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import PurchaseOrderFilter from "component/filter/purchase-order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig from "config/UrlConfig";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { PoSearchAction } from "domain/actions/po/po.action";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";
import {
  PurchaseOrder,
  PurchaseOrderQuery,
} from "model/purchase-order/purchase-order.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

const PurchaseOrderListScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [listSupplier, setSupplier] = useState<Array<SupplierResponse>>();
  let initQuery: PurchaseOrderQuery = {
    info: "",
  };

  let dataQuery: PurchaseOrderQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<PurchaseOrderQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<PurchaseOrder>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<PurchaseOrder>>
  >([
    {
      title: "Mã ",
      dataIndex: "code",
      render: (value: string, i: PurchaseOrder) => (
        <Link to={`${UrlConfig.PURCHASE_ORDER}/${i.id}`}>{value}</Link>
      ),
      visible: true,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      visible: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
    },
    {
      title: "Tiền phải trả",
      dataIndex: "total",
      visible: true,
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: false,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      visible: false,
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (value: string, row: PurchaseOrder) => (
        <div className="text-success">{value}</div>
      ),
      visible: true,
    },
  ]);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PURCHASE_ORDER}?${queryParam}`);
    },
    [history, params]
  );

  const onMenuClick = useCallback((index: number) => {}, []);
  let actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Xóa",
    },
    {
      id: 2,
      name: "Export",
    },
  ];
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.PURCHASE_ORDER}?${queryParam}`);
    },
    [history, params]
  );
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setSearchResult = useCallback(
    (result: PageResponse<PurchaseOrder> | false) => {
      setTableLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );

  useEffect(() => {
    dispatch(SupplierGetAllAction(setSupplier));
    dispatch(PoSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);
  return (
    <ContentContainer
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDER}`,
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.PURCHASE_ORDER}/create`} />}
    >
      <Card>
        <PurchaseOrderFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          listSupplier={listSupplier}
        />
        <CustomTable
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: 1080 }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: PurchaseOrder) => item.id}
        />
      </Card>
      <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data)
          }}
          data={columns}
        />
    </ContentContainer>
  );
};
export default PurchaseOrderListScreen;
