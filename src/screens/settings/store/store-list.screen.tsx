import { Button, Card, Row, Space, Tooltip } from "antd";
import StoreFilter from "component/filter/store.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { StoreGetTypeAction, StoreRankAction, StoreSearchAction } from "domain/actions/core/store.action";
import { StoreQuery, StoreResponse, StoreTypeRequest } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
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
import { OFFSET_HEADER_UNDER_NAVBAR, STATUS_IMPORT_EXPORT } from "utils/Constants";
import { DownloadOutlined, EditOutlined } from "@ant-design/icons";
import useAuthorization from "hook/useAuthorization";
import { StorePermissions } from "config/permissions/setting.permisssion";
import NoPermission from "screens/no-permission.screen";
import { DepartmentResponse } from "model/account/department.model";
import { departmentDetailAction } from "domain/actions/account/department.action";
import { AppConfig } from "config/app.config";
import AuthWrapper from "component/authorization/AuthWrapper";
import { TYPE_EXPORT } from "../../products/constants";
import { callApiNative } from "utils/ApiUtils";
import { showWarning } from "utils/ToastUtils";
import * as XLSX from "xlsx";
import moment from "moment";
import { storeGetApi } from "service/core/store.services";
import StoreExportModal from "./exportProduct";
import CustomPagination from "component/table/CustomPagination";

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
  status: null,
  rank: "",
  hotline: "",
  group_id: "",
  from_begin_date: "",
  to_begin_date: "",
  from_square: "",
  to_square: "",
  type: "",
  department_id: null,
};

const StoreListScreen: React.FC = () => {
  //hook
  const dispatch = useDispatch();
  const query = useQuery();
  const history = useHistory();
  //end hook
  //master data
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status,
  );
  const [storeRanks, setStoreRank] = useState<Array<StoreRankResponse>>([]);
  const [groups, setGroups] = useState<Array<GroupResponse>>([]);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [type, setType] = useState<Array<StoreTypeRequest>>([]);
  //end master data
  const [exportStore, setExportStore] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(0);
  let dataQuery: StoreQuery = { ...initQuery, ...getQueryParams(query) };
  const [params, setPrams] = useState<StoreQuery>(dataQuery);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<StoreResponse>>([]);
  const [data, setData] = useState<PageResponse<StoreResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [listDepartment, setDepartment] = useState<any>();

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
      if (selectedRowData.length === 0) {
        return item.id !== 1 && item.id !== 2;
      }
      if (selectedRowData.length > 1) {
        return item.id !== 1;
      }

      return true;
    });
  }, [selectedRowData, actions]);

  const findParent = useCallback((list: any, departmentId: number, parent = null) => {
    if (!list) return;
    for (let item of list) {
      let res: any =
        item.id === departmentId
          ? parent
            ? parent
            : item
          : item.children && findParent(item.children, departmentId, item);
      if (res) return res;
    }
  }, []);

  const isFirstLoad = useRef(true);
  const [loading, setLoading] = useState(false);
  const [columns, setColumn] = useState<Array<ICustomTableColumType<StoreResponse>>>([
    {
      title: "Mã cửa hàng",
      width: 120,
      dataIndex: "code",
      visible: true,
      fixed: "left",
      render: (value, record) => {
        return (
          <div
            className="data-hover"
            onClick={() => history.push(`${UrlConfig.STORE}/${record.id}`)}
          >
            {value}
          </div>
        );
      },
    },
    {
      title: "ID cửa hàng",
      dataIndex: "id",
      visible: true,
      fixed: "left",
      width: 100,
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "name",
      visible: true,
      fixed: "left",
      width: 220,
    },
    {
      title: "Trực thuộc",
      dataIndex: "departmentParentName",
      visible: true,
      width: 220,
    },
    {
      title: "Loại",
      dataIndex: "type_name",
      visible: true,
      width: 150,
    },
    {
      title: "Số điện thoại",
      dataIndex: "hotline",
      visible: true,
      width: 120,
    },
    {
      title: "Thành phố",
      dataIndex: "city_name",
      visible: true,
      width: 150,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      visible: true,
      width: 200,
    },
    {
      title: "Phân cấp",
      dataIndex: "rank_name",
      width: 100,
      align: "center",
      visible: true,
      sorter: (currentRecord, nextRecord) => {
        const currentRankName = currentRecord.rank_name?.toUpperCase() || "";
        const nextRankName = nextRecord.rank_name?.toUpperCase() || "";

        if (currentRankName > nextRankName) {
          return 1;
        }
        if (currentRankName < nextRankName) {
          return -1;
        }
        return 0;
      },
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
          <div style={{ textAlign: "center", fontSize: "20px" }} className={text}>
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
    [history, params],
  );
  const onFilter = useCallback(
    (values) => {
      values.info = values.info ? values.info.trim() : null;
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params],
  );

  const onResDepartment = useCallback(
    (departmentData: DepartmentResponse | Array<DepartmentResponse> | false) => {
      if (departmentData) {
        setDepartment(departmentData);

        setData((data: any) => {
          if (!data) return;

          const newData = { ...data };
          if (newData.items.length === 0) return data;

          newData.items.forEach((i: any) => {
            if (i.parent_id === -1) i.departmentParentName = i.name;
            else
              i.departmentParentName = findParent(departmentData, i.department_id)
                ? findParent(departmentData, i.department_id).name
                : null;
          });

          setData(newData);
          return data;
        });
      }
    },
    [findParent],
  );

  const onGetDataSuccess = useCallback((data: PageResponse<StoreResponse>) => {
    setLoading(false);
    setData(data);
  }, []);

  const onMenuClick = useCallback(
    (index: number) => {
      if (index === actions[0].id && selectedRowData.length === 1) {
        history.push(`${UrlConfig.STORE}/${selectedRowData[0].id}/update`);
      }
    },
    [selectedRowData, history, actions],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  useEffect(() => {
    if (isFirstLoad.current) {
      // dispatch(DepartmentGetListAction(setDepartment));
      dispatch(StoreRankAction(setStoreRank));
      dispatch(GroupGetAction(setGroups));
      dispatch(StoreGetTypeAction(setType));
    }
    dispatch(
      departmentDetailAction(
        AppConfig.BUSINESS_DEPARTMENT ? AppConfig.BUSINESS_DEPARTMENT : "",
        onResDepartment,
      ),
    );
    isFirstLoad.current = false;
    setLoading(true);
    dispatch(StoreSearchAction(params, onGetDataSuccess));
  }, [dispatch, onGetDataSuccess, onResDepartment, params]);

  const getItemsByCondition = useCallback(
    async (type: string) => {
      let res: any;
      let items: Array<StoreResponse> = [];
      const limit = 30;
      let times = 0;

      setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
      switch (type) {
        case TYPE_EXPORT.page:
          res = await callApiNative(
            { isShowLoading: false },
            dispatch,
            storeGetApi,
            { ...params, limit: params.limit ?? 30 },
          );
          if (res) {
            items = items.concat(res.items);
          }
          break;
        case TYPE_EXPORT.selected:
          items = [...selectedRowData];
          break;
        case TYPE_EXPORT.all:
          const roundAll = Math.round(data.metadata.total / limit);
          times = roundAll < data.metadata.total / limit ? roundAll + 1 : roundAll;

          for (let index = 1; index <= times; index++) {
            const res = await callApiNative(
              { isShowLoading: false },
              dispatch,
              storeGetApi,
              { ...params, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
          }

          break;
        case TYPE_EXPORT.allin:
          if (!data.metadata.total || data.metadata.total === 0) {
            break;
          }

          let index = 1;
          let itemsTemp = [1];

          while (itemsTemp.length !== 0) {
            res = await callApiNative(
              { isShowError: true },
              dispatch,
              storeGetApi,
              { ...initQuery, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
              itemsTemp = res.items;
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
            index++;
          }
          break;
        default:
          break;
      }
      setExportProgress(100);
      return items;
    },
    [dispatch, params, data.metadata.total, selectedRowData],
  );

  const convertItemExport = (item: StoreResponse) => {
    return {
      [`Mã cửa hàng`]: item.code,
      [`Tên cửa hàng`]: item.name,
      [`Trực thuộc`]: item.departmentParentName,
      [`Mã bưu điện`]: item.zip_code,
      [`Mã tham chiếu`]: item.reference_id,
      [`Email`]: item.mail,
      [`Loại`]: item.type_name,
      [`Số điện thoại`]: item.hotline,
      [`Thành phố`]: item.city_name,
      [`Địa chỉ`]: item.address,
      [`Phân cấp`]: item.rank_name,
      [`Trạng thái`]: item.status_name,
      [`Cho phép bán`]: item.is_saleable ? "Có" : "Không",
      [`Đang kiểm kho`]: item.is_stocktaking ? "Có" : "Không",
      [`VM trực thuộc`]: item.vm,
      [`Ngày mở cửa`]: ConvertUtcToLocalDate(item.begin_date),
      [`Diện tích`]: item.square ? `${item.square} m2` : '',
      [`Link google`]: item.link_google_map,
    };
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selectedRowData && selectedRowData.length === 0) {
        setStatusExport(0);
        showWarning("Bạn chưa chọn bản ghi nào để xuất file");
        setExportStore(false);
        return;
      }
      const res = await getItemsByCondition(typeExport);
      if (!res || res.length === 0) {
        setStatusExport(0);
        showWarning("Không có bản ghi nào đủ điều kiện");
        return;
      }

      const workbook = XLSX.utils.book_new();
      for (let i = 0; i < res.length; i++) {
        const e: StoreResponse = res[i];
        const item = convertItemExport(e);
        dataExport.push(item);
      }

      let worksheet = XLSX.utils.json_to_sheet(dataExport);
      XLSX.utils.book_append_sheet(workbook, worksheet, "data");

      setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
      const today = moment(new Date(), "YYYY/MM/DD");
      const month = today.format("M");
      const day = today.format("D");
      const year = today.format("YYYY");
      XLSX.writeFile(workbook, `store_${day}_${month}_${year}.xlsx`);
      setExportStore(false);
      setExportProgress(0);
      setStatusExport(0);
    },
    Cancel: () => {
      setExportStore(false);
      setExportProgress(0);
      setStatusExport(0);
    },
  };

  const onSelectedChange = useCallback((selectedRow: Array<StoreResponse>, selected: boolean | undefined, changeRow: any) => {
    const newSelectedRowKeys = changeRow.map((row: any) => row.id);

    if (selected) {
      setSelectedRowKeys([
        ...selectedRowKeys,
        ...newSelectedRowKeys
      ]);
      setSelectedRowData([
        ...selectedRowData,
        ...changeRow
      ]);
      return;
    }

    const newSelectedRowKeysByDeselected = selectedRowKeys.filter((item) => {
      const findIndex = changeRow.findIndex((row: any) => row.id === item);

      return findIndex === -1
    });

    const newSelectedRowByDeselected = selectedRowData.filter((item) => {
      const findIndex = changeRow.findIndex((row: any) => row.id === item.id);

      return findIndex === -1
    });

    setSelectedRowKeys(newSelectedRowKeysByDeselected);
    setSelectedRowData(newSelectedRowByDeselected);
  }, [selectedRowData, selectedRowKeys]);

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
            <Row>
              <Space>
                <AuthWrapper acceptPermissions={[StorePermissions.READ]}>
                  <Button
                    className="btn-view"
                    size="large"
                    icon={<DownloadOutlined className="btn-view-icon"/>}
                    onClick={() => {
                      setExportStore(true);
                    }}
                  >
                    Xuất file
                  </Button>
                </AuthWrapper>
                {allowCreateStore && (
                  <ButtonCreate child="Thêm cửa hàng" path={`${UrlConfig.STORE}/create`} />
                )}
              </Space>
            </Row>
          }
        >
          <Card>
            <StoreFilter
              listDepartment={listDepartment}
              initValue={initQuery}
              storeStatusList={storeStatusList}
              onMenuClick={onMenuClick}
              actions={menuFilter}
              onFilter={onFilter}
              params={params}
              storeRanks={storeRanks}
              groups={groups}
              type={type}
              onClickOpen={() => setShowSettingColumn(true)}
            />
            <CustomPagination
              pagination={{
                pageSize: data.metadata.limit,
                total: data.metadata.total,
                current: data.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
            />
            <CustomTable
              selectedRowKey={selectedRowKeys}
              onSelectedChange={(selectedRows, selected, changeRow) => onSelectedChange(selectedRows, selected, changeRow)}
              isRowSelection
              showColumnSetting={true}
              isLoading={loading}
              scroll={{ x: 'max-content' }}
              pagination={false}
              sticky={{
                offsetScroll: 5,
                offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
              }}
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

      <StoreExportModal
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        visible={exportStore}
        exportProgress={exportProgress}
        statusExport={statusExport}
      />
    </>
  );
};

export default StoreListScreen;
