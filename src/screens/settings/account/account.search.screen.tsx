import { DeleteOutlined } from "@ant-design/icons";
import { Card, Row, Space, Switch, Tag } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import AccountFilter from "component/filter/account.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { AccountPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import {
  AccountDeleteAction,
  AccountSearchAction,
  AccountUpdateAction,
  DepartmentGetListAction,
  PositionGetListAction
} from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import useChangeHeaderToAction from "hook/filter/useChangeHeaderToAction";
import useAuthorization from "hook/useAuthorization";
import {
  AccountResponse,
  AccountSearchQuery,
  AccountStoreResponse
} from "model/account/account.model";
import { DepartmentResponse, DepartmentView } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { convertDepartment, generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { SearchContainer } from "./account.search.style";

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


const ListAccountScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [tableLoading, setTableLoading] = useState(true);
  const [listDepartment, setDepartment] = useState<Array<DepartmentView>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accountSelected, setAccountSelected] = useState<Array<AccountResponse>>([]);

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
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params]
  );

  const onClearFilter = () => {
    let newPrams = { page: 1 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`${UrlConfig.ACCOUNTS}?${queryParam}`);
  }

  const setSearchResult = useCallback(
    (listResult: PageResponse<AccountResponse> | false) => {
      if (!listResult) {
        return;
      }
      setTableLoading(false);
      setData(listResult);
    },
    []
  );
  const deleteCallback = useCallback(
    (result: boolean) => {
      if (result) {
        setAccountSelected([]);
        showSuccess("Xóa dữ liệu thành công");
        setTableLoading(true);
        dispatch(AccountSearchAction(params, setSearchResult));
      }
    },
    [dispatch, params, setSearchResult]
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
    [accountSelected, deleteCallback, dispatch]
  );

  const AcctionCompoent = useChangeHeaderToAction(
    "Mã nhân viên",
    accountSelected.length === 1,
    onMenuClick,
    actions
  );

  const defaultColumns: Array<ICustomTableColumType<AccountResponse>> = [
    {
      title: <AcctionCompoent />,
      fixed: "left",
      width: 130,
      render: (value: AccountResponse) => {
        return <Link to={`${UrlConfig.ACCOUNTS}/${value.code}`}>{value.code}</Link>;
      },
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "user_name",
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
    },
    {
      title: "Cửa hàng",
      dataIndex: "account_stores",
      width: 300,
      render: (stores: Array<AccountStoreResponse>) => (
        <>
          {stores.length < 3 ? (
            <span>
              {stores.map((item) => {
                return <Tag color="green">{item.store}</Tag>;
              })}
            </span>
          ) : (
            <span>
              <Tag color="green">{stores[0].store}</Tag>
              <Tag color="green">{stores[1].store}</Tag>
              <Tag color="green">+{stores.length - 2}...</Tag>
            </span>
          )}
        </>
      ),
    },
    {
      title: "Phân quyền",
      width: 200,
      dataIndex: "role_name",
    },
    {
      title: "Ngày tạo",
      width: 150,
      render: (value: AccountResponse) => {
        return ConvertUtcToLocalDate(value.created_date, "DD/MM/YYYY");
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (value: string, row: AccountResponse) => (
        <Switch
          size="small"
          className="ant-switch-success"
          defaultChecked={value === "active"}
          onChange={(checked) => {
            dispatch(
              AccountUpdateAction(
                row.id,
                { ...row, status: checked ? "active" : "inactive" },
                () => { }
              )
            );
          }}
        />
      ),
    },
  ];

  let [columns, setColumns] =
    useState<Array<ICustomTableColumType<AccountResponse>>>(defaultColumns);

  useLayoutEffect(() => {
    setColumns(defaultColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountSelected]);

  useEffect(() => {
    dispatch(DepartmentGetListAction((response: DepartmentResponse[]) => {
      if (response) {
        setDepartment(convertDepartment(response));
      }
    }));
    dispatch(PositionGetListAction(setPosition));
    dispatch(StoreGetListAction(setStore));
  }, [dispatch]);

  useEffect(() => {
    setTableLoading(true);
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
            listStore={listStore}
            onClearFilter={onClearFilter}
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
            dataSource={data.items}
            columns={columns}
            rowKey={(item: AccountResponse) => item.id}
            scroll={{ x: 1500 }}
            sticky={{ offsetScroll: 5, offsetHeader: 55 }}
          />
        </Card>
      </SearchContainer>

    </ContentContainer>
  );
};

export default ListAccountScreen;
