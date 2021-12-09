import {CheckCircleOutlined, DeleteOutlined, LoadingOutlined} from "@ant-design/icons";
import {Card, Row, Switch, Tag, Space, Button, Modal, Col, message, Divider} from "antd";
import Dragger from "antd/es/upload/Dragger";
import BaseResponse from "base/base.response";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import AccountFilter from "component/filter/account.filter";
import ButtonCreate from "component/header/ButtonCreate";
import {MenuAction} from "component/table/ActionButton";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import { HttpStatus } from "config/http-status.config";
import {AccountPermissions} from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import {
  AccountDeleteAction,
  AccountSearchAction,
  AccountUpdateAction,
  PositionGetListAction,
} from "domain/actions/account/account.action";
import {StoreGetListAction} from "domain/actions/core/store.action";
import useChangeHeaderToAction from "hook/filter/useChangeHeaderToAction";
import useAuthorization from "hook/useAuthorization";
import {
  AccountResponse,
  AccountSearchQuery,
  AccountStoreResponse,
} from "model/account/account.model";
import {DepartmentResponse} from "model/account/department.model";
import {PositionResponse} from "model/account/position.model";
import {PageResponse} from "model/base/base-metadata.response";
import {StoreResponse} from "model/core/store.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, useHistory} from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import { getDepartmentAllApi } from "service/accounts/account.service";
import {convertDepartment, generateQuery} from "utils/AppUtils";
import {ConvertUtcToLocalDate} from "utils/DateUtils";
import {showError, showSuccess} from "utils/ToastUtils";
import {getQueryParams, useQuery} from "utils/useQuery";
import {SearchContainer} from "./account.search.style";
import importIcon from "assets/icon/import.svg";
import { AppConfig } from "config/app.config";
import {RiUpload2Line} from "react-icons/ri";
import { getToken } from "utils/LocalStorageUtils";
import _ from "lodash";
import {VscError} from "react-icons/all";
import { EnumUploadStatus } from "config/enum.config";
import WarningImport from "component/import/warning-import";

const csvColumnMapping: any = {
  user_name: "Mã người dùng",
  password: "Mật khẩu",
  re_password: "Nhập lại mật khẩu",
  full_name: "Họ và tên",
  gender: "Giới tính",
  mobile: "Số điện thoại",
  stores: "Cửa hàng",
  birthday: "Ngày sinh",
  role_id: "Nhóm phân quyền",
  departments: "Bộ phận",
  jobs: "Vị trí",
  country_id: "Quốc gia",
  district_id: "Khu vực",
  address: "Địa chỉ",
};

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


type UploadStatus = "error" | "success" | "done" | "uploading" | "removed" | undefined;

const ListAccountScreen: React.FC = () => {
  const token = getToken() || "";
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [listDepartment, setDepartment] = useState<Array<DepartmentResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accountSelected, setAccountSelected] = useState<Array<AccountResponse>>([]);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<any>("");
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [importAccountRes, setImportAccountRes] = useState<
  Array<AccountResponse>
>([]);

  //phân quyền
  const [allowReadAcc] = useAuthorization({
    acceptPermissions: [AccountPermissions.READ],
  });
  const [allowCreateAcc] = useAuthorization({
    acceptPermissions: [AccountPermissions.CREATE],
  }); 
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
      setPrams({...params});
      history.replace(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = {...params, ...values, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params]
  );
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
            //history.push(`${UrlConfig.ACCOUNTS}/${id}`);
            dispatch(AccountDeleteAction(id, deleteCallback));
            break;
          case 2:
            // dispatch(accountDel(id, onDeleteSuccess));
            break;
          case 3:
            break;
        }
      }
    },
    [accountSelected, deleteCallback, dispatch]
  );

  const AcctionCompoent = useChangeHeaderToAction(
    "Mã nhân viên",
    accountSelected.length > 0,
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
      dataIndex: "mobile",
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
                {...row, status: checked ? "active" : "inactive"},
                () => {}
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

  const importAccount = useCallback(() =>{
    setUploadStatus(undefined);
    setShowImportModal(false);
  },[]); 

  useEffect(() => {
    if (isFirstLoad.current) {
      getDepartmentAllApi()
      .then((response: BaseResponse<DepartmentResponse[]>) => {
        switch (response.code) {
          case HttpStatus.SUCCESS:
            if (response.data) {
              let array: any = convertDepartment(response.data);
              setDepartment(array);
            }
            break;
          default:
            response.errors.forEach((e) => showError(e));
            break;
        }
      })
      .catch((error) => {
        showError("Có lỗi khi lấy danh sách phòng ban!");
      });
      dispatch(PositionGetListAction(setPosition));
      dispatch(StoreGetListAction(setStore));
    }
    isFirstLoad.current = false;
    dispatch(AccountSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);
  return (
    <>
      {allowReadAcc ? (
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
                  <Button
                    className="light"
                    size="large"
                    icon={<img src={importIcon} style={{marginRight: 8}} alt="" />}
                    onClick={()=>{setShowImportModal(true)}}
                  >
                    Nhập file
                  </Button>
                </AuthWrapper>
                {allowCreateAcc && <ButtonCreate child="Thêm người dùng" path={`${UrlConfig.ACCOUNTS}/create`} />}
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
                scroll={{x: 1500}}
                sticky={{offsetScroll: 5, offsetHeader: 55}}
              />
            </Card> 
          </SearchContainer> 
            <Modal
                onCancel={() => { 
                  setShowImportModal(false);
                }}
                width={650}
                visible={showImportModal}
                title="Nhập file tài khoản"
                footer={[
                  <Button
                    key="back"
                    onClick={() => {
                      setSuccessCount(0);
                      setSuccessCount(0);
                      setUploadStatus(undefined);
                      setShowImportModal(false);
                    }}
                  >
                    Huỷ
                  </Button>,
                  <Button key="link" type="primary" onClick={() => importAccount()} disabled={uploadStatus === "error"}>
                    Nhập file
                  </Button>,
                ]}
              >
              <div
                style={{
                  display:
                    uploadStatus === undefined || uploadStatus === EnumUploadStatus.removed
                      ? ""
                      : "none",
                }}
              >
                <WarningImport link_template={AppConfig.ENTITLEMENTS_TEMPLATE_URL} />
                <Row gutter={24}>
                  <Col span={3}></Col>
                  <Col span={19}>
                    <Dragger
                      accept=".xlsx"
                      beforeUpload={(file) => {
                        if (
                          file.type !==
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        ) {
                          setUploadStatus("error");
                          setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                          setImportAccountRes([]);
                          return false;
                        }
                        setUploadStatus("uploading");
                        setUploadError([]);
                        return true;
                      }}
                      multiple={false}
                      showUploadList={false}
                      action={``}
                      headers={{Authorization: `Bearer ${token}`}}
                      onChange={(info) => {
                        const {status} = info.file;
                        if (status === EnumUploadStatus.done) {
                          const response = info.file.response;
                          if (response.code === 20000000) {
                            if (response.data.data.length > 0) {
                              setImportAccountRes(response.data.data);
                            }
                            if (response.data.errors.length > 0) {
                              const errors: Array<any> = _.uniqBy(
                                response.data.errors,
                                "index"
                              ).sort((a: any, b: any) => a.index - b.index);
                              setImportAccountRes([...errors]);
                            } else {
                              setImportAccountRes([]);
                            }
                            setImportTotal(response.data.total);
                            setSuccessCount(response.data.success_count);
                            setUploadStatus(status);
                          } else {
                            setUploadStatus("error");
                            setUploadError(response.errors);
                            setImportAccountRes([]);
                          }
                        } else if (status === EnumUploadStatus.error) {
                          message.error(`${info.file.name} file upload failed.`);
                          setUploadStatus(status);
                          setImportAccountRes([]);
                        }
                      }}
                    >
                      <p className="ant-upload-drag-icon">
                        <RiUpload2Line size={48} />
                      </p>
                      <p className="ant-upload-hint">
                        Kéo file vào đây hoặc tải lên từ thiết bị
                      </p>
                    </Dragger>
                  </Col>
                </Row>
              </div>
              <div
              style={{
                display:
                  uploadStatus === EnumUploadStatus.done ||
                  uploadStatus === EnumUploadStatus.uploading ||
                  uploadStatus === EnumUploadStatus.success ||
                  uploadStatus === EnumUploadStatus.error
                    ? ""
                    : "none",
              }}
            >
              <Row justify={"center"}>
                {uploadStatus === EnumUploadStatus.uploading ? (
                  <Col span={24}>
                    <Row justify={"center"}>
                      <LoadingOutlined style={{fontSize: "78px", color: "#E24343"}} />
                    </Row>
                    <Row justify={"center"}>
                      <h2 style={{padding: "10px 30px"}}>Đang upload file...</h2>
                    </Row>
                  </Col>
                ) : (
                  ""
                )}
                {uploadStatus === EnumUploadStatus.error ? (
                  <Col span={24}>
                    <Row justify={"center"}>
                      <VscError style={{fontSize: "78px", color: "#E24343"}} />
                    </Row>
                    <Row justify={"center"}>
                      <h2 style={{padding: "10px 30px"}}>
                        <li>{uploadError || "Máy chủ đang bận"}</li>
                      </h2>
                    </Row>
                  </Col>
                ) : (
                  ""
                )}
                {uploadStatus === EnumUploadStatus.done ||
                uploadStatus === EnumUploadStatus.success ? (
                  <Col span={24}>
                    <Row justify={"center"}>
                      <CheckCircleOutlined style={{fontSize: "78px", color: "#27AE60"}} />
                    </Row>
                    <Row justify={"center"}>
                      <h2 style={{padding: "10px 30px"}}>
                        Xử lý file nhập toàn tất:{" "}
                        <strong style={{color: "#2A2A86"}}>
                          {successCount} / {importTotal}
                        </strong>{" "}
                        người dùng thành công
                      </h2>
                    </Row>
                    <Divider />
                    {importAccountRes.length > 0 ? (
                      <div>
                        <Row justify={"start"}>
                          <h3 style={{color: "#E24343"}}>Danh sách lỗi: </h3>
                        </Row>
                        <Row justify={"start"}>
                          <li style={{padding: "10px 30px"}}>
                            {importAccountRes?.map((error: any, index) => (
                              <ul key={index}>
                                <span>
                                  - Dòng {error.index + 2}: {csvColumnMapping[error.column]}{" "}
                                  {csvColumnMapping[error.type.toLowerCase()]}
                                </span>
                              </ul>
                            ))}
                          </li>
                        </Row>
                      </div>
                    ) : (
                      ""
                    )}
                  </Col>
                ) : (
                  ""
                )}
              </Row>
            </div>
           </Modal>
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </>
  );
};

export default ListAccountScreen;
