import { Card } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import {
  SupplierResponse,
  SupplierQuery,
  SupplierContactResposne,
} from "model/core/supplier.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import SupplierFilter from "component/filter/supplier.filter";
import { RootReducerType } from "model/reducers/RootReducerType";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import { SupplierDeleteAction, SupplierSearchAction } from "domain/actions/core/supplier.action";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { DistrictResponse } from "model/content/district.model";
import { DistrictGetByCountryAction } from "domain/actions/content/content.action";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { DeleteOutlined } from "@ant-design/icons";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";
import useAuthorization from "hook/useAuthorization";
import NoPermission from "screens/no-permission.screen";
import useEffectOnce from "react-use/lib/useEffectOnce";
import TextEllipsis from "component/table/TextEllipsis";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

const ACTIONS_INDEX = {
  DELETE: 1,
};

const actionsDefault: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.DELETE,
    name: "Xóa",
    icon: <DeleteOutlined />,
  },
];

const DefaultCountry = 233;
const initQuery: SupplierQuery = {
  district_id: undefined,
  note: "",
  contact: "",
  pics: [],
  from_created_date: "",
  to_created_date: "",
  status: undefined,
  type: undefined,
  scorecard: undefined,
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

  //phân quyền
  const [allowDeleteSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.DELETE],
  });

  const [allowReadSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.READ],
  });

  const [allowCreateSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.CREATE],
  });

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === ACTIONS_INDEX.DELETE) {
        return allowDeleteSup;
      }
      return false;
    });
  }, [allowDeleteSup]);

  const scorecard = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.scorecard);
  const listSupplierType = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type,
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
  const [columns, setColumn] = useState<Array<ICustomTableColumType<SupplierResponse>>>([
    {
      title: "Mã",
      dataIndex: "code",
      fixed: "left",
      render: (value: string, item: SupplierResponse) => {
        return <Link to={`${UrlConfig.SUPPLIERS}/${item.id}`}>{value}</Link>;
      },
      visible: true,
      width: 130,
    },
    {
      width: 300,
      title: "Tên nhà cung cấp",
      fixed: "left",
      dataIndex: "name",
      visible: true,
      render: (value: string, item: SupplierResponse) => {
        return <TextEllipsis value={value} line={2} />;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "contacts",
      width: 130,
      render: (contacts: Array<SupplierContactResposne>) => {
        let index = contacts.findIndex((value) => value.is_default);
        if (index === -1) {
          if (contacts.length > 0) {
            return contacts[0].phone;
          }
          return "";
        }
        return contacts[index].phone;
      },
      visible: true,
    },
    {
      title: "Merchandiser",
      width: 200,
      dataIndex: "pic",
      render: (_, item: SupplierResponse) =>
        item.pic ? (
          <div>
            <div>{item.pic_code}</div>
            <div>
              <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${item.pic_code}`}>
                {item.pic}
              </Link>
            </div>
          </div>
        ) : (
          "---"
        ),
      visible: true,
    },
    {
      width: 120,
      title: "Trạng thái",
      dataIndex: "status_name",
      render: (value: string, item: SupplierResponse) => (
        <div className={item.status === "active" ? "text-success" : "text-error"}>{value}</div>
      ),
      visible: true,
    },
    {
      width: 150,
      title: "Nhóm hàng",
      dataIndex: "collection",
      visible: true,
      render: (_, item) => <span>{item?.collection?.name}</span>,
    },
    {
      width: 100,
      title: "Phân cấp",
      dataIndex: "scorecard",
      align: "center",
      visible: true,
    },
    {
      width: 150,
      title: "Quốc gia",
      dataIndex: "country_name",
      visible: false,
    },
    {
      width: 150,
      title: "Thành phố",
      dataIndex: "city_name",
      visible: false,
    },
    {
      width: 150,
      title: "Quận huyện",
      dataIndex: "district_name",
      visible: false,
    },
    {
      width: 150,
      title: "Người tạo",
      dataIndex: "created_name",
      visible: false,
    },
    {
      width: 150,
      title: "Ngày tạo",
      dataIndex: "created_date",
      visible: false,
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      width: 150,
      title: "Loại",
      dataIndex: "type_name",
      visible: true,
    },
  ]);
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const onSelect = useCallback((selectedRow: Array<SupplierResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
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
    [history, params],
  );

  const searchSupplierCallback = useCallback((listResult: PageResponse<SupplierResponse>) => {
    setTableLoading(false);
    setData(listResult);
  }, []);

  const deleteCallback = useCallback(() => {
    selected.splice(0, selected.length);
    showSuccess("Xóa nhà cung cấp thành công");
    setTableLoading(true);
    dispatch(SupplierSearchAction(params, searchSupplierCallback));
  }, [dispatch, params, searchSupplierCallback, selected]);

  const onDelete = useCallback(() => {
    if (selected && selected.length > 0) {
      selected.forEach((e) => {
        dispatch(SupplierDeleteAction(e.id, deleteCallback));
      });
    }
  }, [deleteCallback, dispatch, selected]);
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(`${UrlConfig.SUPPLIERS}?${queryParam}`);
    },
    [history, params],
  );
  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.DELETE:
          if (selected.length === 0) {
            showWarning("Vui lòng chọn nhà cung cấp cần xóa");
            return;
          }
          setConfirmDelete(true);
          break;
      }
    },
    [selected],
  );

  useEffectOnce(() => {
    dispatch(DistrictGetByCountryAction(DefaultCountry, setListDistrict));
  });

  useEffect(() => {
    setTableLoading(true);
    dispatch(SupplierSearchAction(params, searchSupplierCallback));
  }, [dispatch, params, searchSupplierCallback]);

  return (
    <>
      {allowReadSup ? (
        <ContentContainer
          title="Quản lý nhà cung cấp"
          breadcrumb={[
            {
              name: "Sản phẩm",
            },
            {
              name: "Quản lý sản phẩm",
              path: `${UrlConfig.PRODUCT}`,
            },
            {
              name: "Nhà cung cấp",
            },
          ]}
          extra={
            allowCreateSup ? (
              <ButtonCreate child="Thêm nhà cung cấp" path={`${UrlConfig.SUPPLIERS}/create`} />
            ) : null
          }
        >
          <Card>
            <SupplierFilter
              onMenuClick={onMenuClick}
              listDistrict={listDistrict}
              actions={actions}
              onFilter={onFilter}
              supplierStatus={supplierStatus}
              scorecard={scorecard}
              params={params}
              setParams={setPrams}
              initValue={initQuery}
              listSupplierType={listSupplierType}
              onClickOpen={() => setShowSettingColumn(true)}
            />
            <CustomTable
              className="small-padding"
              isRowSelection
              pagination={{
                pageSize: data.metadata.limit,
                total: data.metadata.total,
                current: data.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              scroll={{ x: "max-content" }}
              sticky={{
                offsetScroll: 5,
                offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
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
                onDelete();
              }}
              title="Bạn chắc chắn xóa nhà cung cấp ?"
              subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
              visible={isConfirmDelete}
            />
          </Card>
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </>
  );
};

export default ListSupplierScreen;
