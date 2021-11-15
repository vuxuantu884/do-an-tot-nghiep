import {Card, Tooltip} from "antd";
import StoreFilter from "component/filter/store.filter";
import {MenuAction} from "component/table/ActionButton";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {StoreRankAction, StoreSearchAction, StoreGetTypeAction} from "domain/actions/core/store.action";
import {StoreQuery, StoreTypeRequest} from "model/core/store.model";
import {StoreResponse} from "model/core/store.model";
import {PageResponse} from "model/base/base-metadata.response";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";
import {Link} from "react-router-dom";
import {generateQuery} from "utils/AppUtils";
import {getQueryParams, useQuery} from "utils/useQuery";
import {RootReducerType} from "model/reducers/RootReducerType";
import {RiCheckboxCircleLine} from "react-icons/ri";
import {StoreRankResponse} from "model/core/store-rank.model";
import {GroupGetAction} from "domain/actions/content/content.action";
import {GroupResponse} from "model/content/group.model";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {ConvertUtcToLocalDate, DATE_FORMAT} from "utils/DateUtils";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import {OFFSET_HEADER_UNDER_NAVBAR} from "utils/Constants";
import {EditOutlined} from "@ant-design/icons";
import useAuthorization from "hook/useAuthorization";
import {StorePermissions} from "config/permissions/setting.permisssion";
import NoPermission from "screens/no-permission.screen";

const ACTIONS_INDEX = {
  UPDATE: 1,
};

const actionsDefault: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.UPDATE,
    name: "Chỉnh sửa",
    icon: <EditOutlined />,
  },
];

const initQuery: StoreQuery = {
  info: "",
  status: "",
  rank: "",
  hotline: "",
  group_id: "",
  from_begin_date: "",
  to_begin_date: "",
  from_square: "",
  to_square: "",
  type: "",
};

const StoreListScreen: React.FC = () => {
  //hook
  const dispatch = useDispatch();
  const query = useQuery();
  const history = useHistory();
  //end hook
  //master data
  const [rowKey, setRowKey] = useState<Array<any>>([]);
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const [storeRanks, setStoreRank] = useState<Array<StoreRankResponse>>([]);
  const [groups, setGroups] = useState<Array<GroupResponse>>([]);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [type, setType] = useState<Array<StoreTypeRequest>>([]);
  //end master data
  let dataQuery: StoreQuery = {...initQuery, ...getQueryParams(query)};
  const [params, setPrams] = useState<StoreQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<StoreResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [selected, setSelected] = useState<Array<StoreResponse>>([]);

  //phân quyền
  const [allowReadStore] = useAuthorization({
    acceptPermissions: [StorePermissions.READ],
  });
  const [allowCreateStore] = useAuthorization({
    acceptPermissions: [StorePermissions.CREATE],
  });
  const [allowUpdateStore] = useAuthorization({
    acceptPermissions: [StorePermissions.UPDATE],
  });

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === ACTIONS_INDEX.UPDATE) {
        return allowUpdateStore;
      }
      return false;
    });
  }, [allowUpdateStore]);

  const menuFilter = useMemo(() => {
    return actions.filter((item) => {
      if (selected.length === 0) {
        return item.id !== 1 && item.id !== 2;
      }
      if (selected.length > 1) {
        return item.id !== 1;
      }

      return true;
    });
  }, [selected, actions]);
  const isFirstLoad = useRef(true);
  const [loading, setLoading] = useState(false);
  const [columns, setColumn] = useState<Array<ICustomTableColumType<StoreResponse>>>([
    {
      title: "Mã cửa hàng",
      width: 120,
      dataIndex: "code",
      render: (value, item) => {
        return (
          <Link to={`${UrlConfig.STORE}/${item.id}`}>{value}</Link>
        );
      },
      visible: true,
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "name",
      sorter: true,
      visible: true,
    },
    {
      title: "Loại",
      dataIndex: "type_name",
      visible: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "hotline",
      visible: true,
    },
    {
      title: "Thành phố",
      dataIndex: "city_name",
      visible: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      visible: true,
    },
    {
      title: "Phân cấp",
      dataIndex: "rank_name",
      width: 100,
      align: "center",
      visible: true,
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
      align: "center",
      width: 150,
      visible: false,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      align: "left",
      width: 130,
      visible: false,
      render: (value: string) => {
        return ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY);
      },
    },
    {
      title: "Ngày sửa",
      dataIndex: "updated_date",
      align: "center",
      width: 130,
      visible: false,
      render: (value: string) => {
        return ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY);
      },
    },
    {
      title: "Người sửa",
      dataIndex: "updated_name",
      align: "center",
      width: 150,
      visible: false,
    },
    {
      title: "Cho phép bán",
      dataIndex: "is_saleable",
      align: "center",
      width: 150,
      visible: true,
      render: (value) => (
        <div className="text-center">
          <div
            style={
              !value
                ? {
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderColor: "#27ae60",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }
                : {
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderColor: "#27ae60",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    backgroundColor: "#27ae60",
                  }
            }
          />
        </div>
      ),
    },
    {
      title: "Đang kiểm kho",
      dataIndex: "is_stocktaking",
      align: "center",
      width: 150,
      visible: true,
      render: (value) => (
        <div className="text-center">
          <div
            style={
              !value
                ? {
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderColor: "#27ae60",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }
                : {
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderColor: "#27ae60",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    backgroundColor: "#27ae60",
                  }
            }
          />
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status_name",
      width: 100,
      visible: true,
      render: (value, item) => {
        let text = "";
        switch (item.status) {
          case "active":
            text = "text-success";
            break;
          case "inactive":
            text = "text-error";
            break;
        }
        return (
          <div style={{textAlign: "center", fontSize: "20px"}} className={text}>
            <Tooltip title={value}>
              <RiCheckboxCircleLine />
            </Tooltip>
          </div>
        );
      },
    },
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({...params});
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = {...params, ...values, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onGetDataSuccess = useCallback((data: PageResponse<StoreResponse>) => {
    setLoading(false);
    setData(data);
  }, []);

  const onMenuClick = useCallback(
    (index: number) => {
      console.log(index, selected);

      if (index === actions[0].id && selected.length === 1) {
        history.push(`${UrlConfig.STORE}/${selected[0].id}/edit`);
      }
    },
    [selected, history, actions]
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );
  const onSelect = useCallback((selectedRow: Array<StoreResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(StoreRankAction(setStoreRank));
      dispatch(GroupGetAction(setGroups));
      dispatch(StoreGetTypeAction(setType));
    }
    isFirstLoad.current = false;
    setLoading(true);
    dispatch(StoreSearchAction(params, onGetDataSuccess));
  }, [dispatch, onGetDataSuccess, params]);
  return (
    <>
      {allowReadStore ? (
        <ContentContainer
          title="Quản lý cửa hàng"
          breadcrumb={[
            {
              name: "Tổng quan",
              path: UrlConfig.HOME,
            },
            {
              name: "Cửa hàng",
            },
          ]}
          extra={
            allowCreateStore ? <ButtonCreate path={`${UrlConfig.STORE}/create`} /> : null
          }
        >
          <Card>
            <StoreFilter
              initValue={initQuery}
              storeStatusList={storeStatusList}
              onMenuClick={onMenuClick}
              actions={menuFilter}
              onFilter={onFilter}
              params={params}
              storeRanks={storeRanks}
              groups={groups}
              type={type}
            />
            <CustomTable
              selectedRowKey={rowKey}
              onChangeRowKey={(rowKey) => setRowKey(rowKey)}
              isRowSelection
              showColumnSetting={true}
              isLoading={loading}
              pagination={{
                pageSize: data.metadata.limit,
                total: data.metadata.total,
                current: data.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              onSelectedChange={onSelect}
              scroll={{x: 1080}}
              sticky={{offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR}}
              dataSource={data.items}
              columns={columnFinal}
              rowKey={(item: StoreResponse) => item.id}
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
          </Card>
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </>
  );
};

export default StoreListScreen;
