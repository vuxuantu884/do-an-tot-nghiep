import { Card } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import {
  SupplierResponse,
  GoodsObj,
  SupplierQuery,
} from "model/core/supplier.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import SupplierFilter from "component/filter/supplier.filter";
import { RootReducerType } from "model/reducers/RootReducerType";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import {
  SupplierDeleteAction,
  SupplierSearchAction,
} from "domain/actions/core/supplier.action";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { DistrictResponse } from "model/content/district.model";
import { DistrictGetByCountryAction } from "domain/actions/content/content.action";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
  {
    id: 2,
    name: "Export",
  },
];
const DefaultCountry = 233;
const initQuery: SupplierQuery = {
  goods: "",
  status: "",
  district_id: "",
  scorecard: "",
  note: "",
  type: "",
  contact: "",
  pic: "",
  from_created_date: "",
  to_created_date: "",
};

const ListSupplierScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [tableLoading, setTableLoading] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const supplierStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.supplier_status;
  }, shallowEqual);
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const scorecard = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.scorecard
  );
  const listSupplierType = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type
  );
  let dataQuery: SupplierQuery = { ...initQuery, ...getQueryParams(query) };
  let [params, setPrams] = useState<SupplierQuery>(dataQuery);
  const [selected, setSelected] = useState<Array<SupplierResponse>>([]);
  const [data, setData] = useState<PageResponse<SupplierResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<SupplierResponse>>
  >([
    {
      title: "Mã",
      dataIndex: "code",
      render: (value: string, item: SupplierResponse) => {
        return <Link to={`${UrlConfig.SUPPLIERS}/${item.id}`}>{value}</Link>;
      },
      visible: true,
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      visible: true,
    },
    {
      title: "Loại",
      dataIndex: "type_name",
      visible: true,
    },
    {
      title: "Ngành hàng",
      dataIndex: "goods",
      render: (values: Array<GoodsObj>) => {
        return (
          <div>
            {values.map((item, index) => (
              <div key={index}>{item.name}</div>
            ))}
          </div>
        );
      },
      visible: true,
    },
    {
      title: "Quốc gia",
      dataIndex: "country_name",
      visible: false,
    },
    {
      title: "Thành phố",
      dataIndex: "city_name",
      visible: false,
    },
    {
      title: "Quận huyện",
      dataIndex: "district_name",
      visible: false,
    },
    {
      title: "Người liên hệ",
      dataIndex: "contact_name",
      visible: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
    },
    {
      title: "Phân cấp",
      dataIndex: "scorecard",
      align: "center",
      visible: true,
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
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
      dataIndex: "status_name",
      render: (value: string, item: SupplierResponse) => (
        <div
          className={item.status === "active" ? "text-success" : "text-error"}
        >
          {value}
        </div>
      ),
      visible: true,
    },
  ]);
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onSelect = useCallback((selectedRow: Array<SupplierResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.SUPPLIERS}?${queryParam}`);
    },
    [history, params]
  );

  const searchSupplierCallback = useCallback(
    (listResult: PageResponse<SupplierResponse>) => {
      setTableLoading(false);
      setData(listResult);
    },
    []
  );

  const deleteCallback = useCallback(() => {
    selected.splice(0, selected.length);
    showSuccess("Xóa nhà cung cấp thành công");
    setTableLoading(true);
    dispatch(SupplierSearchAction(params, searchSupplierCallback));
  }, [dispatch, params, searchSupplierCallback, selected]);

  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần tử cần xóa");
      return;
    }

    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(SupplierDeleteAction(id, deleteCallback));
      return;
    }
  }, [deleteCallback, dispatch, selected]);
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(`${UrlConfig.SUPPLIERS}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 1:
        setConfirmDelete(true);
        // onDelete();
        break;
    }
  }, []);

  useEffect(() => {
    setTableLoading(true);
    dispatch(DistrictGetByCountryAction(DefaultCountry, setListDistrict));
    dispatch(SupplierSearchAction(params, searchSupplierCallback));
  }, [dispatch, params, searchSupplierCallback]);
  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Nhà cung cấp",
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.SUPPLIERS}/create`} />}
    >
      <Card>
        <div className="padding-20">
          <SupplierFilter
            onMenuClick={onMenuClick}
            listDistrict={listDistrict}
            actions={actions}
            onFilter={onFilter}
            goods={goods}
            supplierStatus={supplierStatus}
            scorecard={scorecard}
            params={params}
            initValue={initQuery}
            listSupplierType={listSupplierType}
          />
          <CustomTable
            isRowSelection
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            isLoading={tableLoading}
            showColumnSetting={true}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            columns={columnFinal}
            onSelectedChange={onSelect}
            dataSource={data.items}
            rowKey={(item: SupplierResponse) => item.id}
          />
          <ModalSettingColumn
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumn(data);
            }}
            data={columns}
          />
          <ModalDeleteConfirm
            onCancel={() => setConfirmDelete(false)}
            onOk={() => {
              setConfirmDelete(false);
              // dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
              onDelete();
            }}
            title="Bạn chắc chắn xóa nhà cung cấp ?"
            subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
            visible={isConfirmDelete}
          />
        </div>
      </Card>
    </ContentContainer>
  );
};

export default ListSupplierScreen;
