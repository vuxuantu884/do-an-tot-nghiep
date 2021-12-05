import {
  Card,
  Button,
  Form,
  Input,
  Row,
  Space,
  Modal,
  Col,
  Select,
  message,
  Divider,
} from "antd";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import moment from "moment";
import actionColumn from "./actions/promo.action.column";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import exportIcon from "assets/icon/export.svg";
import VoucherIcon from "assets/img/voucher.svg";
import AddImportCouponIcon from "assets/img/add_import_coupon_code.svg";
import AddListCouponIcon from "assets/img/add_list_coupon_code.svg";
import CustomModal from "./components/CustomModal";
import Dragger from "antd/lib/upload/Dragger";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import search from "assets/img/search.svg";
import "./promo-code.scss";
import {useParams} from "react-router";
import {
  CheckCircleOutlined,
  FilterOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {useDispatch} from "react-redux";
import {DATE_FORMAT} from "utils/DateUtils";
import {PageResponse} from "model/base/base-metadata.response";
import {DiscountSearchQuery} from "model/query/discount.query";
import {getQueryParams, useQuery} from "../../../utils/useQuery";
import {RiUpload2Line} from "react-icons/ri";
import {
  addPromoCode,
  getListPromoCode,
  deletePromoCodeById,
  updatePromoCodeById,
  publishedBulkPromoCode,
  enableBulkPromoCode,
  disableBulkPromoCode,
} from "domain/actions/promotion/promo-code/promo-code.action";
import {PromoCodeResponse} from "model/response/promotion/promo-code/list-promo-code.response";
import {hideLoading, showLoading} from "domain/actions/loading.action";
import {showSuccess} from "utils/ToastUtils";
import {DiscountResponse} from "model/response/promotion/discount/list-discount.response";
import {promoGetDetail} from "domain/actions/promotion/discount/discount.action";
import {AppConfig} from "../../../config/app.config";
import _ from "lodash";
import {getToken} from "../../../utils/LocalStorageUtils";
import {ACTIONS_PROMO_CODE, STATUS_PROMO_CODE} from "../constant";
import {VscError} from "react-icons/all";
import useAuthorization from "hook/useAuthorization";
import {PromoPermistion} from "config/permissions/promotion.permisssion";
import {MenuAction} from "component/table/ActionButton";
import NoPermission from "screens/no-permission.screen";

const csvColumnMapping: any = {
  sku: "Mã SKU",
  min_amount: "SL Tối thiểu",
  usage_limit: "Giới hạn",
  discount_percentage: "Chiết khấu (%)",
  fixed_amount: "Chiết khấu (VND)",
  invalid: "không đúng định dạng CHỮ HOA + SỐ",
  notfound: "không tìm thấy",
  required: "Không được trống",
  code: "Mã chiết khấu",
  already_exist: "Đã tồn tại trong hệ thống",
  duplicate: "Mã đã bị trùng trong file",
};

const ListCode = () => {
  const token = getToken() || "";
  const dispatch = useDispatch();
  const {id} = useParams() as any;
  const priceRuleId = id;
  const query = useQuery();
  const [form] = Form.useForm();
  let dataQuery: any = {
    ...{
      code: "",
    },
    ...getQueryParams(query),
  };
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showAddCodeManual, setShowAddCodeManual] = React.useState<boolean>(false);
  const [showAddCodeRandom, setShowAddCodeRandom] = React.useState<boolean>(false);
  const [showImportFile, setShowImportFile] = React.useState<boolean>(false);
  const [showEditPopup, setShowEditPopup] = React.useState<boolean>(false);
  const [editData, setEditData] = React.useState<any>();
  const [uploadError, setUploadError] = useState<any>("");
  const [deleteData, setDeleteData] = React.useState<any>();
  const [data, setData] = useState<PageResponse<PromoCodeResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [promoValue, setPromoValue] = useState<any>();
  const [params, setParams] = useState<DiscountSearchQuery>(dataQuery);
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [codeErrorsResponse, setCodeErrorsResponse] = useState<Array<any>>([]);
  const [uploadStatus, setUploadStatus] = useState<
    "error" | "success" | "done" | "uploading" | "removed" | undefined
  >(undefined);

  //phân quyền
  const [actionsPromoCode, setAcionsPromoCode] =
    useState<Array<MenuAction>>(ACTIONS_PROMO_CODE);
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
  });
  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });
  const [allowReadPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.READ],
  });

  // section handle call api GET DETAIL
  const onResult = useCallback((result: DiscountResponse | false) => {
    setPromoValue(result);
  }, []);
  useEffect(() => {
    dispatch(promoGetDetail(id, onResult));
  }, [dispatch, id, onResult]);

  // handle response get list
  const fetchData = useCallback((data: any) => {
    setData(data);
    setTableLoading(false);
  }, []);

  // Call API get list
  useEffect(() => {
    dispatch(getListPromoCode(priceRuleId, params, fetchData));
  }, [dispatch, fetchData, priceRuleId, params]);

  useEffect(() => {
    setAcionsPromoCode([...ACTIONS_PROMO_CODE]);
    if (!allowCancelPromoCode)
      setAcionsPromoCode([...ACTIONS_PROMO_CODE.filter((e) => e.id !== 2 && e.id !== 3)]);
  }, [allowCancelPromoCode]);

  const onPageChange = useCallback(
    (page, limit) => {
      setParams({...params, page, limit});
    },
    [params]
  );

  const onFilter = useCallback(
    (values) => {
      switch (values.state) {
        case "ENABLED":
          values.disabled = false;
          values.published = undefined;
          break;
        case "DISABLED":
          values.disabled = true;
          values.published = undefined;
          break;
        case "GIFTED":
          values.disabled = undefined;
          values.published = true;
          break;
        default:
          break;
      }
      let newParams = {...params, ...values, page: 1};
      if (!values.state) {
        delete newParams["disabled"];
        delete newParams["published"];
      }
      delete newParams["state"];
      delete newParams["query"];
      setParams(newParams);
    },
    [params]
  );

  // section EDIT by Id
  const handleUpdate = (item: any) => {
    setEditData(item);
    setShowEditPopup(true);
  };
  // section EDIT by Id
  function handleEdit(value: any) {
    if (!value) return;
    let body = {
      id: editData.id,
      code: value,
    };
    dispatch(showLoading());
    dispatch(updatePromoCodeById(priceRuleId, body, onUpdateSuccess));
  }
  const onUpdateSuccess = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Cập nhật thành công");
        dispatch(getListPromoCode(priceRuleId, params, fetchData));
      }
    },
    [dispatch, priceRuleId, params, fetchData]
  );

  // section DELETE by Id
  function handleDelete(item: any) {
    setDeleteData(item);
    setIsShowDeleteModal(true);
  }

  // section ADD Manual
  function handleAddManual(value: any, form?: any) {
    if (!value) return;
    let body = {
      discount_codes: [],
      generate_discount_codes: null,
    };
    (value.listCode as Array<string>).forEach((element) => {
      if (!element) return;
      (body.discount_codes as Array<any>).push({code: element});
    });
    dispatch(showLoading());
    dispatch(addPromoCode(priceRuleId, body, onAddSuccess));
    form.resetFields();
  }
  function handleAddRandom(value: any) {
    if (!value) return;
    let body = {
      discount_codes: null,
      generate_discount_codes: {
        prefix: value.prefix,
        suffix: value.suffix,
        length: value.length,
        count: value.count,
      },
    };
    dispatch(showLoading());
    dispatch(addPromoCode(priceRuleId, body, onAddSuccess));
  }
  const onAddSuccess = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Thêm thành công");
        setShowAddCodeManual(false);
        dispatch(getListPromoCode(priceRuleId, params, fetchData));
      }
    },
    [dispatch, priceRuleId, params, fetchData]
  );

  // section DELETE bulk
  const deleteCallBack = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Thao tác thành công");
        dispatch(getListPromoCode(priceRuleId, params, fetchData));
      }
    },
    [dispatch, priceRuleId, params, fetchData]
  );

  // section Ngưng áp dụng
  const handleStatus = useCallback((item: any) => {
    const body = {
      ids: [item.id],
    };
    dispatch(disableBulkPromoCode(priceRuleId, body, deleteCallBack));
  }, [deleteCallBack, dispatch, priceRuleId]);

  // section Đã tặng
  const handleGift = useCallback((item: any) => {
    const body = {
      ids: [item.id],
    };
    dispatch(publishedBulkPromoCode(priceRuleId, body, deleteCallBack));
  }, [deleteCallBack, dispatch, priceRuleId]);

  const columns: Array<ICustomTableColumType<any>> = useMemo(
    () => [
      {
        title: "Mã giảm giá",
        visible: true,
        fixed: "left",
        width: "30%",
        dataIndex: "code",
      },
      {
        title: "Đã sử dụng",
        visible: true,
        fixed: "left",
        dataIndex: "usage_count",
        width: "10%",
      },
      {
        title: "Lượt áp dụng còn lại",
        visible: true,
        fixed: "left",
        dataIndex: "remaining_count",
        width: "15%",
      },
      {
        title: "Trạng thái",
        visible: true,
        fixed: "left",
        dataIndex: "status",
        align: "center",
        width: "12%",
        render: (value: any, item: any, index: number) => {
          const status: any | null = STATUS_PROMO_CODE.find(
            (e) => e.disabled === item.disabled
          );
          return <div style={status?.style}>{status?.value}</div>;
        },
      },
      {
        title: "Ngày tạo mã",
        visible: true,
        fixed: "left",
        align: "center",
        width: "15%",
        render: (value: any, item: any, index: number) => (
          <div>{`${
            item.created_date ? moment(item.created_date).format(DATE_FORMAT.DDMMYYY) : ""
          }`}</div>
        ),
      },
      actionColumn(handleUpdate, handleDelete, handleStatus, handleGift),
    ],
    [handleGift, handleStatus]
  );
  const columnFinal = React.useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const statuses = [
    {
      code: "ENABLED",
      value: "Đang áp dụng",
    },
    {
      code: "DISABLED",
      value: "Ngừng áp dụng",
    },
    // {
    //   code: 'GIFTED',
    //   value: 'Đã tặng' ,
    // }
  ];

  const onMenuClick = useCallback(
    async (index: number) => {
      if (selectedRowKey.length === 0) {
        return;
      }
      const body = {
        ids: selectedRowKey,
      };
      switch (index) {
        case 1:
          dispatch(publishedBulkPromoCode(priceRuleId, body, deleteCallBack));
          break;
        case 2:
          dispatch(showLoading());
          dispatch(enableBulkPromoCode(priceRuleId, body, deleteCallBack));
          break;
        case 3:
          dispatch(showLoading());
          dispatch(disableBulkPromoCode(priceRuleId, body, deleteCallBack));
          break;
      }
    },
    [dispatch, deleteCallBack, priceRuleId, selectedRowKey]
  );

  const {Item} = Form;
  const {Option} = Select;

  const openFilter = useCallback(() => {
    // setVisible(true);
  }, []);

  return (
    <>
      {allowReadPromoCode ? (
        <ContentContainer
          title={`Mã giảm giá của đợt phát hành ${promoValue?.code}`}
          breadcrumb={[
            {
              name: "Tổng quan",
              path: UrlConfig.HOME,
            },
            {
              name: "Khuyến mại",
              path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
            },
            {
              name: "Mã chiết khấu đơn hàng",
            },
          ]}
          extra={
            <Row>
              <Space>
                <Button
                  type="default"
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                  // onClick={onExport}
                  onClick={() => {}}
                >
                  Xuất file
                </Button>
                {allowCreatePromoCode ? (
                  <Button
                    className="ant-btn-outline ant-btn-primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setShowModalAdd(true)}
                  >
                    Thêm mới mã giảm giá
                  </Button>
                ) : null}
              </Space>
            </Row>
          }
        >
          <Card>
            <div className="discount-code__search">
              <CustomFilter onMenuClick={onMenuClick} menu={actionsPromoCode}>
                <Form onFinish={onFilter} initialValues={params} layout="inline" form={form}>
                  <Item name="code" className="search">
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="Tìm kiếm theo mã, tên chương trình"
                      onBlur={(e) => {form.setFieldsValue({code: e.target.value?.trim()})}}
                    />
                  </Item>
                  <Item name="state">
                    <Select
                      showArrow
                      showSearch
                      style={{minWidth: "200px"}}
                      optionFilterProp="children"
                      placeholder="Chọn trạng thái"
                      allowClear={true}
                    >
                      {statuses?.map((item) => (
                        <Option key={item.code} value={item.code}>
                          {item.value}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                  <Item>
                    <Button type="primary" htmlType="submit">
                      Lọc
                    </Button>
                  </Item>
                  <Item>
                    <Button icon={<FilterOutlined />} onClick={openFilter}>
                      Thêm bộ lọc
                    </Button>
                  </Item>
                </Form>
              </CustomFilter>

              <CustomTable
                selectedRowKey={selectedRowKey}
                onChangeRowKey={(rowKey) => {
                  setSelectedRowKey(rowKey);
                }}
                isRowSelection
                isLoading={tableLoading}
                // sticky={{offsetScroll: 5}}
                pagination={{
                  pageSize: data.metadata.limit,
                  total: data.metadata.total,
                  current: data.metadata.page,
                  showSizeChanger: true,
                  onChange: onPageChange,
                  onShowSizeChange: onPageChange,
                }}
                dataSource={data.items}
                columns={columnFinal}
                rowKey={(item: any) => item.id}
              />
            </div>
          </Card>
          <Modal
            className="modal-show-add-discount"
            onCancel={() => setShowModalAdd(false)}
            width={600}
            visible={showModalAdd}
            title="Thêm mã giảm giá"
            footer={[]}
          >
            <Row gutter={24}>
              <Col
                span="24"
                style={{
                  display: "flex",
                  gap: 15,
                }}
              >
                <div
                  className="card-discount-code"
                  onClick={() => {
                    setShowModalAdd(false);
                    setShowAddCodeManual(true);
                  }}
                >
                  <img
                    style={{
                      background:
                        "linear-gradient(65.71deg, #0088FF 28.29%, #33A0FF 97.55%)",
                    }}
                    src={VoucherIcon}
                    alt=""
                  />
                  <p style={{fontWeight: 500}}>Thêm mã thủ công</p>
                </div>
                <div
                  className="card-discount-code"
                  onClick={() => {
                    setShowModalAdd(false);
                    setShowAddCodeRandom(true);
                  }}
                >
                  <img
                    style={{
                      background:
                        "linear-gradient(62.06deg, #0FD186 25.88%, #3FDA9E 100%)",
                    }}
                    src={AddListCouponIcon}
                    alt=""
                  />
                  <p style={{fontWeight: 500}}>Thêm mã ngẫu nhiên</p>
                </div>
                <div
                  className="card-discount-code"
                  onClick={() => {
                    setShowModalAdd(false);
                    setShowImportFile(true);
                  }}
                >
                  <img
                    style={{
                      background:
                        "linear-gradient(66.01deg, #FFAE06 37.34%, #FFBE38 101.09%)",
                    }}
                    src={AddImportCouponIcon}
                    alt=""
                  />
                  <p style={{fontWeight: 500}}>Nhập file Excel</p>
                </div>
              </Col>
            </Row>
          </Modal>
          <CustomModal
            type={"MANUAL"}
            visible={showAddCodeManual}
            okText="Thêm"
            cancelText="Thoát"
            title="Thêm mã thủ công"
            onCancel={() => {
              setShowAddCodeManual(false);
            }}
            onOk={(value, form) => {
              handleAddManual(value, form);
            }}
          />
          <CustomModal
            type={"RANDOM"}
            visible={showAddCodeRandom}
            okText="Thêm"
            cancelText="Thoát"
            title="Thêm mã ngẫu nhiên"
            onCancel={() => {
              setShowAddCodeRandom(false);
            }}
            onOk={(data) => {
              handleAddRandom(data);
              setShowAddCodeRandom(false);
            }}
          />
          <Modal
            onCancel={() => {
              setUploadStatus(undefined);
              setShowImportFile(false);
            }}
            width={650}
            visible={showImportFile}
            title="Nhập file khuyến mại"
            footer={[
              <Button
                key="back"
                onClick={() => {
                  setUploadStatus(undefined);
                  setShowImportFile(false);
                }}
              >
                Huỷ
              </Button>,

              <Button
                key="link"
                type="primary"
                onClick={() => {
                  setUploadStatus(undefined);
                  dispatch(promoGetDetail(id, onResult));
                  setShowImportFile(false);
                }}
                disabled={uploadStatus === "error"}
              >
                Xác nhận
              </Button>,
            ]}
          >
            <div
              style={{
                display:
                  uploadStatus === undefined || uploadStatus === "removed" ? "" : "none",
              }}
            >
              <Row gutter={12}>
                <Col span={3}>Chú ý:</Col>
                <Col span={19}>
                  <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
                  <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
                  <p>
                    - Tải file mẫu{" "}
                    <a href={AppConfig.DISCOUNT_CODES_TEMPLATE_URL}> tại đây </a>{" "}
                  </p>
                  <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
                  <p>
                    - Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến
                    5 phút. Trong lúc hệ thống xử lý không F5 hoặc tắt cửa sổ trình duyệt.
                  </p>
                </Col>
              </Row>
              <Row gutter={24}>
                <div className="dragger-wrapper">
                  <Dragger
                    accept=".xlsx"
                    multiple={false}
                    showUploadList={false}
                    action={`${AppConfig.baseUrl}promotion-service/price-rules/${priceRuleId}/discount-codes/read-file`}
                    headers={{Authorization: `Bearer ${token}`}}
                    beforeUpload={(file) => {
                      if (
                        file.type !==
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      ) {
                        setUploadStatus("error");
                        setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                        return false;
                      }
                      setUploadStatus("uploading");
                      setUploadError([]);
                      return true;
                    }}
                    onChange={(info) => {
                      const {status} = info.file;
                      if (status === "done") {
                        const response = info.file.response;
                        if (response.code === 20000000) {
                          if (response.data.errors.length > 0) {
                            const errors: Array<any> = _.uniqBy(
                              response.data.errors,
                              "index"
                            ).sort((a: any, b: any) => a.index - b.index);
                            setCodeErrorsResponse([...errors]);
                          }else{
                            setCodeErrorsResponse([]);
                          }
                          setImportTotal(response.data.total);
                          setSuccessCount(response.data.success_count);
                          setUploadStatus(status);
                          dispatch(getListPromoCode(priceRuleId, params, fetchData));
                        } else {
                          setUploadStatus("error");
                          setUploadError(response.errors);
                        }
                      } else if (status === "error") {
                        message.error(`${info.file.name} file upload failed.`);
                        setUploadStatus(status);
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
                </div>
              </Row>
            </div>
            <Row>
              <div
                style={{
                  display:
                    uploadStatus === "done" ||
                    uploadStatus === "uploading" ||
                    uploadStatus === "success" ||
                    uploadStatus === "error"
                      ? ""
                      : "none",
                }}
              >
                <Row justify={"center"}>
                  {uploadStatus === "uploading" ? (
                    <Col span={24}>
                      <Row justify={"center"}>
                        {/*<Col span={24}>*/}
                        <Space size={"large"}>
                          <LoadingOutlined style={{fontSize: "78px", color: "#E24343"}} />
                          <h2 style={{padding: "10px 30px"}}>Đang upload file...</h2>
                        </Space>
                        {/*</Col>*/}
                      </Row>
                    </Col>
                  ) : (
                    ""
                  )}
                  {uploadStatus === "error" ? (
                    <Col span={24}>
                      <Row justify={"center"}>
                        <Space size={"large"}>
                          <VscError style={{fontSize: "78px", color: "#E24343"}} />
                          <h2 style={{padding: "10px 30px"}}>
                            <li>{uploadError || "Máy chủ đang bận"}</li>
                          </h2>
                        </Space>
                      </Row>
                    </Col>
                  ) : (
                    ""
                  )}
                  {uploadStatus === "done" ? (
                    <Col span={24}>
                      <Row justify={"center"}>
                        <CheckCircleOutlined
                          style={{fontSize: "78px", color: "#27AE60"}}
                        />
                      </Row>
                      <Row justify={"center"}>
                        <h2 style={{padding: "10px 30px"}}>
                          Xử lý file nhập toàn tất:{" "}
                          <strong style={{color: "#2A2A86"}}>
                            {successCount} / {importTotal}
                          </strong>{" "}
                         mã giảm giá thành công
                        </h2>
                      </Row>
                      {codeErrorsResponse.length > 0 ? (
                        <div>
                          <Divider />
                          <Row justify={"start"}>
                            <h3 style={{color: "#E24343"}}>Danh sách lỗi: </h3>
                          </Row>
                          <Row justify={"start"}>
                            <li style={{padding: "10px 30px"}}>
                              {codeErrorsResponse?.map((error: any, index) => (
                                <ul key={index}>
                                  <span>
                                    - Dòng {error.index + 2}: {error.value}{" "}
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
            </Row>
          </Modal>
          <CustomModal
            type={"EDIT"}
            visible={showEditPopup}
            okText="Thêm"
            valueChange={editData?.code}
            cancelText="Thoát"
            title={`Sửa mã giảm giá ${editData?.code}`}
            onCancel={() => {
              setShowEditPopup(false);
            }}
            onOk={(data) => {
              handleEdit(data?.code);
              setShowEditPopup(false);
            }}
          />
          <ModalDeleteConfirm
            onCancel={() => setIsShowDeleteModal(false)}
            onOk={() => {
              setIsShowDeleteModal(false);
              dispatch(showLoading());
              dispatch(deletePromoCodeById(priceRuleId, deleteData.id, deleteCallBack));
            }}
            okText="Đồng ý"
            cancelText="Huỷ"
            title="Xóa mã giảm giá"
            subTitle="Bạn có chắc chắn xóa mã giảm giá, ..."
            visible={isShowDeleteModal}
          />
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </>
  );
};

export default ListCode;