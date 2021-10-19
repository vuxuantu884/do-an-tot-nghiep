import { Card, Tooltip } from "antd";
import StoreFilter from "component/filter/store.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  StoreRankAction,
  StoreSearchAction,
} from "domain/actions/core/store.action";
import { StoreQuery } from "model/core/store.model";
import { StoreResponse } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { RootReducerType } from "model/reducers/RootReducerType";
import { RiCheckboxCircleLine } from "react-icons/ri";
import { StoreRankResponse } from "model/core/store-rank.model";
import { GroupGetAction } from "domain/actions/content/content.action";
import { GroupResponse } from "model/content/group.model";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";

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
};

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa",
  },
  {
    id: 2,
    name: "Xóa",
  },
  {
    id: 3,
    name: "Export",
  },
];

const StoreListScreen: React.FC = () => {
  //hook
  const dispatch = useDispatch();
  const query = useQuery();
  const history = useHistory();
  //end hook
  //master data
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const [storeRanks, setStoreRank] = useState<Array<StoreRankResponse>>([]);
  const [groups, setGroups] = useState<Array<GroupResponse>>([]);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  //end master data
  let dataQuery: StoreQuery = { ...initQuery, ...getQueryParams(query) };
  const [params, setPrams] = useState<StoreQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<StoreResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const isFirstLoad = useRef(true);
  const [loading, setLoading] = useState(false);
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<StoreResponse>>
  >([
    {
      title: "Mã cửa hàng",
      width: 120,
      dataIndex: "code",
      render: (value, item) => {
        return <Link to={`${UrlConfig.STORE}/${item.id}`}>{value}</Link>;
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
          case "temp_lock":
            text = "text-secondary";
            break;
          case "permanent_lock":
            text = "text-error";
            break;
        }
        return (
          <div
            style={{ textAlign: "center", fontSize: "20px" }}
            className={text}
          >
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
      setPrams({ ...params });
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
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
  const onMenuClick = useCallback((index: number) => {}, []);
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(StoreRankAction(setStoreRank));
      dispatch(GroupGetAction(setGroups));
    }
    isFirstLoad.current = false;
    setLoading(true);
    dispatch(StoreSearchAction(params, onGetDataSuccess));
  }, [dispatch, onGetDataSuccess, params]);
  return (
    <ContentContainer
      title="Quản lý cửa hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Cửa hàng",
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.STORE}/create`} />}
    >
      <Card>
          <StoreFilter
            initValue={initQuery}
            storeStatusList={storeStatusList}
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            params={params}
            storeRanks={storeRanks}
            groups={groups}
          />
          <CustomTable
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
            scroll={{ x: 1080 }}
            onShowColumnSetting={() => setShowSettingColumn(true)}
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
  );
};

export default StoreListScreen;
