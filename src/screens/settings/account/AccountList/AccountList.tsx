import { DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Row, Space, Switch } from "antd";
import uploadIcon from "assets/icon/upload.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import AccountFilter from "component/filter/account.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { AccountPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import {
  AccountDeleteAction,
  AccountSearchAction,
  AccountUpdateAction,
  DepartmentGetListAction,
  PositionGetListAction,
} from "domain/actions/account/account.action";
import useChangeHeaderToAction from "hook/filter/useChangeHeaderToAction";
import useAuthorization from "hook/useAuthorization";
import {
  AccountResponse,
  AccountSearchQuery,
  AccountStoreResponse,
} from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { PageResponse } from "model/base/base-metadata.response";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { SearchContainer } from "../account.search.style";
import ImportExcel from "../components/me-contact/ImportExcel";
import FullNameAccount from "./FullNameAccount";
import { convertDataApiToDataSrcTable } from "./helper";
import TagList from "./TagList";

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

const initQuery: AccountSearchQuery = {
  info: "",
  code: "",
};

const DEFAULT_TYPICAL_OPTION = 2;

const ListAccountScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  //page state
  const [tableLoading, setTableLoading] = useState(true);
  const [listDepartment, setDepartment] = useState<Array<DepartmentResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
  const [accountSelected, setAccountSelected] = useState<Array<AccountResponse>>([]);
  const [isImport, setIsImport] = useState<boolean>(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);

  //phân quyền
  const [allowDeleteAcc] = useAuthorization({
    acceptPermissions: [AccountPermissions.DELETE],
  });

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === ACTIONS_INDEX.DELETE) {
        return allowDeleteAcc;
      }
      return false;
    });
  }, [allowDeleteAcc]);

  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.account_status;
  });
  let dataQuery: AccountSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<AccountSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<AccountResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const onSelect = useCallback((selectedRow: Array<AccountResponse>) => {
    let selectData: Array<AccountResponse> = [];
    selectedRow.forEach((x) => {
      if (x !== undefined) {
        selectData.push(x);
      }
    });
    setAccountSelected(selectData);
  }, []);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params],
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params],
  );

  const onClearFilter = () => {
    let newPrams = { page: 1 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`${UrlConfig.ACCOUNTS}?${queryParam}`);
  };

  const setSearchResult = useCallback((listResult: PageResponse<AccountResponse> | false) => {
    if (!listResult) {
      return;
    }
    setTableLoading(false);
    setData(listResult);
  }, []);
  const deleteCallback = useCallback(
    (result: boolean) => {
      if (result) {
        setAccountSelected([]);
        showSuccess("Xóa dữ liệu thành công");
        setTableLoading(true);
        dispatch(AccountSearchAction(params, setSearchResult));
      }
    },
    [dispatch, params, setSearchResult],
  );

  const onMenuClick = useCallback(
    (index: number) => {
      if (accountSelected.length > 0) {
        let id = accountSelected[0].id;
        switch (index) {
          case 1:
            dispatch(AccountDeleteAction(id, deleteCallback));
            break;
        }
      }
    },
    [accountSelected, deleteCallback, dispatch],
  );

  const ActionComponent = useChangeHeaderToAction(
    "Mã nhân viên",
    accountSelected.length === 1,
    onMenuClick,
    actions,
  );

  const defaultColumns: Array<ICustomTableColumType<AccountResponse>> = [
    {
      title: <ActionComponent />,
      fixed: "left",
      width: 130,
      visible: true,
      render: (value: AccountResponse) => {
        return <Link to={`${UrlConfig.ACCOUNTS}/${value.code}`}>{value.code}</Link>;
      },
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "user_name",
      visible: true,
      width: 150,
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      visible: true,
      width: 250,
      render: (value: string) => {
        return <FullNameAccount name={value} />;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
      width: 150,
    },

    {
      title: "Nhóm quyền",
      width: 200,
      dataIndex: "role_name",
      visible: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      align: "center",
      visible: true,
      render: (value: string, row: AccountResponse) => (
        <Switch
          size="small"
          className="ant-switch-success"
          defaultChecked={value === "active"}
          onChange={(checked) => {
            const storeIds: number[] = row.account_stores.reduce(
              (acc: Array<number>, item: AccountStoreResponse) => {
                if (item.store_id) {
                  acc.push(item.store_id);
                }
                return acc;
              },
              [],
            );
            dispatch(
              AccountUpdateAction(
                row.id,
                {
                  ...row,
                  store_ids: storeIds,
                  status: checked ? "active" : "inactive",
                },
                () => {},
              ),
            );
          }}
        />
      ),
    },
    {
      title: "Ngày tạo",
      width: 150,
      visible: true,
      render: (value: AccountResponse) => {
        return ConvertUtcToLocalDate(value.created_date, "DD/MM/YYYY");
      },
    },
    {
      title: "Cửa hàng",
      dataIndex: "account_stores",
      width: 300,
      visible: true,
      render: (stores, record: any) => (
        <TagList
          fullOptions={record.stores}
          typicalOptions={record.stores}
          otherOption={record.otherOptionStore}
        />
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "account_jobs",
      width: 300,
      visible: true,
      render: (job, record: any) => (
        <TagList
          fullOptions={record.departments}
          typicalOptions={record.departments}
          otherOption={record.otherOptionDepartment}
        />
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "account_jobs",
      width: 300,
      visible: true,
      render: (stores, record: any) => (
        <TagList
          fullOptions={record.positions}
          typicalOptions={record.positions}
          otherOption={record.otherOptionPosition}
        />
      ),
    },
  ];

  let [columns, setColumns] =
    useState<Array<ICustomTableColumType<AccountResponse>>>(defaultColumns);

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  useLayoutEffect(() => {
    setColumns(defaultColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountSelected]);

  useEffect(() => {
    dispatch(
      DepartmentGetListAction((response: DepartmentResponse[]) => {
        if (response) {
          setDepartment(response);
        }
      }),
    );
    dispatch(PositionGetListAction(setPosition));
  }, [dispatch]);

  useEffect(() => {
    setTableLoading(true);
    const storeIds = params.store_ids?.map((idString) => Number(idString)); // convert string to number: do cái select tree store có value là number, nhưng load data từ url thì là string
    params.store_ids = storeIds;
    dispatch(AccountSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <ContentContainer
      title="Quản lý người dùng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý người dùng",
        },
      ]}
      extra={
        <Row>
          <Space>
            {/* <AuthWrapper acceptPermissions={[AccountPermissions.CREATE]}>
              <Button
                className="light"
                size="large"
                icon={<img src={uploadIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={() => history.push(`${UrlConfig.ACCOUNTS}/import`)}
              >
                Nhập file
              </Button>
            </AuthWrapper> */}
            <AuthWrapper acceptPermissions={[AccountPermissions.CREATE]}>
              <ButtonCreate child="Thêm người dùng" path={`${UrlConfig.ACCOUNTS}/create`} />
            </AuthWrapper>
          </Space>
        </Row>
      }
    >
      <SearchContainer>
        <Card>
          <AccountFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            params={params}
            listDepartment={listDepartment}
            listPosition={listPosition}
            listStatus={listStatus}
            onClearFilter={onClearFilter}
            onClickOpen={() => setShowSettingColumn(true)}
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
            onSelectedChange={onSelect}
            isLoading={tableLoading}
            dataSource={convertDataApiToDataSrcTable(data.items, DEFAULT_TYPICAL_OPTION)}
            columns={columnFinal}
            rowKey={(item: AccountResponse) => item.id}
            scroll={{ x: "max-content" }}
            sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
          />
        </Card>
        <ImportExcel
          onCancel={() => {
            setIsImport(false);
          }}
          onOk={() => {}}
          title="Nhập file người dùng"
          visible={isImport}
        />
        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            console.log(data);
            setShowSettingColumn(false);
            setColumns(data);
          }}
          data={columns}
        />
      </SearchContainer>
    </ContentContainer>
  );
};

export default ListAccountScreen;
