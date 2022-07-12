import {
  FilterOutlined,
  PlusOutlined
} from "@ant-design/icons";
import {
  Button, Card, Col, Form,
  Input, message, Modal, Progress, Row, Select, Space
} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import AddImportCouponIcon from "assets/img/add_import_coupon_code.svg";
import AddListCouponIcon from "assets/img/add_list_coupon_code.svg";
import search from "assets/img/search.svg";
import VoucherIcon from "assets/img/voucher.svg";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import CustomFilter from "component/table/custom.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PROMOTION_CDN } from "config/cdn/promotion.cdn";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getPriceRuleAction } from "domain/actions/promotion/discount/discount.action";
import {
  addPromoCode,
  deletePromoCodeById,
  disableBulkPromoCode,
  enableBulkPromoCode,
  getDiscountUsageDetailAction,
  getListPromoCode,
  publishedBulkPromoCode,
  updatePromoCodeById
} from "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import {DiscountCode, DiscountUsageDetailResponse, PriceRule} from "model/promotion/price-rules.model";
import { DiscountSearchQuery } from "model/query/discount.query";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { VscError } from "react-icons/all";
import { RiUpload2Line } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { DATE_FORMAT } from "utils/DateUtils";
import {showError, showSuccess, showWarning} from "utils/ToastUtils";
import { AppConfig } from "../../../config/app.config";
import { getToken } from "../../../utils/LocalStorageUtils";
import { getQueryParams, useQuery } from "../../../utils/useQuery";
import { ACTIONS_PROMO_CODE, statuses, STATUS_PROMO_CODE } from "../constants";
import ActionColumn from "./actions/promo.action.column";
import CustomModal from "./components/CustomModal";
import "./promo-code.scss";
import {generateQuery, isNullOrUndefined} from "../../../utils/AppUtils";
import { useHistory } from "react-router-dom";
import {HttpStatus} from "config/http-status.config";
import {addPromotionCodeApi, getPromotionJobsApi} from "service/promotion/promo-code/promo-code.service";
import {EnumJobStatus} from "config/enum.config";
import ProcessAddDiscountCodeModal from "screens/promotion/promo-code/components/ProcessAddDiscountCodeModal";

import DiscountUsageDetailModal from "./components/DiscountUsageDetailModal";
import {exportDiscountCode} from "service/promotion/discount/discount.service";
import eyeIcon from "assets/icon/eye.svg";
import exportIcon from "assets/icon/export.svg";

const { Item } = Form;
const { Option } = Select;

const ListCode = () => {
  const token = getToken() || "";
  const dispatch = useDispatch();
  const { id } = useParams() as any;
  const priceRuleId = id;
  const query = useQuery();
  const [form] = Form.useForm();
  let dataQuery: any = {
    code: "",
    limit : 30,
    page: 1,
    ...getQueryParams(query),
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showAddCodeManual, setShowAddCodeManual] = React.useState<boolean>(false);
  const [showAddCodeRandom, setShowAddCodeRandom] = React.useState<boolean>(false);
  const [showImportFile, setShowImportFile] = React.useState<boolean>(false);
  const [showEditPopup, setShowEditPopup] = React.useState<boolean>(false);
  const [editData, setEditData] = React.useState<any>();
  const [uploadError, setUploadError] = useState<any>("");
  const [deleteData, setDeleteData] = React.useState<any>();
  const [promoCodeList, setPromoCodeList] = useState<PageResponse<DiscountCode>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const history = useHistory();
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [promoValue, setPromoValue] = useState<any>();
  const [params, setParams] = useState<DiscountSearchQuery>(dataQuery);
  const [uploadStatus, setUploadStatus] = useState<"error">();

  //phân quyền
  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });
  const [allowUpdatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.UPDATE],
  });

  // section handle call api GET DETAIL
  const onResult = useCallback((result: PriceRule) => {
    if (result)
      setPromoValue(result);
  }, []);

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      history.push(`${UrlConfig.PROMOTION}/issues/codes/${id}?${queryParam}`);
    },
    [history, id, params]
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
      let newParams = { ...params, ...values, page: 1 };
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

  // handle response get list
  const onSetPromoListData = useCallback((data: PageResponse<DiscountCode>) => {
    setIsLoading(false);
    if (data) {
      setPromoCodeList(data);
    }
  }, []);

  const getDiscountCodeData = useCallback(() => {
    setIsLoading(true);
    dispatch(getListPromoCode(priceRuleId, params, onSetPromoListData));
  }, [dispatch, onSetPromoListData, params, priceRuleId]);

  const onUpdateSuccess = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Cập nhật thành công");
        getDiscountCodeData();
      }
    },
    [dispatch, getDiscountCodeData]
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
      (body.discount_codes as Array<any>).push({ code: element });
    });

    resetProgress();
    dispatch(showLoading());
    addPromotionCodeApi(priceRuleId, body)
      .then((response) => {
        setShowAddCodeManual(false);
        if (response?.code) {
          setIsVisibleProcessModal(true);
          setJobCreateCode(response.code);
          setIsProcessing(true);
        } else {
          showWarning("Có lỗi khi tạo tiến trình Thêm mới mã giảm giá");
        }
      })
      .catch((error) => {
        if (error.response?.data?.errors?.length > 0) {
          const errorMessage = error.response?.data?.errors[0];
          showError(`${errorMessage ? errorMessage: "Có lỗi xảy ra, vui lòng thử lại sau"}`);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
    form.resetFields();
  }

  // handle jobs create new discount code
  const [jobCreateCode, setJobCreateCode] = useState<string>("");
  const [isVisibleProcessModal, setIsVisibleProcessModal] = useState(false);
  const [processPercent, setProcessPercent] = useState<number>(0);
  const [progressData, setProgressData] = useState(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const resetProgress = () => {
    setProcessPercent(0);
    setJobCreateCode("");
    setProgressData(null);
  }

  const getPromotionJobs = useCallback(() => {
    if (!jobCreateCode) return;

    let promotionJobsPromises: any = getPromotionJobsApi(jobCreateCode);
    Promise.all([promotionJobsPromises]).then((responses) => {
      responses.forEach((response) => {
        const processData = response?.data;
        if (response.code === HttpStatus.SUCCESS && processData && !isNullOrUndefined(processData.total)) {
          setProgressData(processData);
          if (processData.status?.toUpperCase() === EnumJobStatus.finish) {
            setProcessPercent(100);
            setJobCreateCode("");
            setIsProcessing(false);
          } else {
            if (processData.processed >= processData.total) {
              setProcessPercent(99);
            } else {
              const percent = Math.round((processData.processed / processData.total) * 100 * 100) / 100;
              setProcessPercent(percent);
            }
          }
        }
      });
    });
  }, [jobCreateCode]);

  useEffect(() => {
    if (processPercent === 100 || !jobCreateCode) return;

    getPromotionJobs();

    const getFileInterval = setInterval(getPromotionJobs,3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPromotionJobs, jobCreateCode]);
  
  const onOKProgressImportCustomer = () => {
    resetProgress();
    setIsVisibleProcessModal(false);
    setUploadStatus(undefined);
    getDiscountCodeData();
  }
  // end handle jobs create new discount code

  const handleAddRandom = (value: any) => {
    if (!value) return;
    resetProgress();
    const body = {
      discount_codes: null,
      generate_discount_codes: {
        prefix: value.prefix,
        suffix: value.suffix,
        length: value.length,
        count: value.count,
      },
    };

    dispatch(showLoading());
    addPromotionCodeApi(priceRuleId, body)
      .then((response) => {
        setShowAddCodeManual(false);
        if (response?.code) {
          setIsVisibleProcessModal(true);
          setJobCreateCode(response.code);
          setIsProcessing(true);
        } else {
          showWarning("Có lỗi khi tạo tiến trình Thêm mới mã giảm giá");
        }
      })
      .catch((error) => {
        if (error.response?.data?.errors?.length > 0) {
          const errorMessage = error.response?.data?.errors[0];
          showError(`${errorMessage ? errorMessage: "Có lỗi xảy ra, vui lòng thử lại sau"}`);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }

  const onAddSuccess = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Thêm thành công");
        setShowAddCodeManual(false);
        getDiscountCodeData();
      }
    },
    [dispatch, getDiscountCodeData]
  );

  // section DELETE bulk
  const deleteCallBack = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Thao tác thành công");
        getDiscountCodeData();
      }
    },
    [dispatch, getDiscountCodeData]
  );

  // section Ngưng áp dụng
  const handleStatus = useCallback((item: any) => {
    const body = {
      ids: [item.id],
    };
    dispatch(disableBulkPromoCode(priceRuleId, body, deleteCallBack));
  }, [deleteCallBack, dispatch, priceRuleId]);

  // handle detail modal
  const [isVisibleDiscountUsageDetailModal, setIsVisibleDiscountUsageDetailModal] = useState(false);
  const [discountUsageDetailList, setDiscountUsageDetailList] = useState<Array<DiscountUsageDetailResponse>>([]);

  const onCloseDiscountUsageDetailModal = () => {
    setIsVisibleDiscountUsageDetailModal(false);

  }
  const openDiscountCodeDetailModal = (data: any) => {
    dispatch(getDiscountUsageDetailAction(data.code, (response) => {
      if (!!response) {
        setDiscountUsageDetailList(response);
        setIsVisibleDiscountUsageDetailModal(true);
      }
    }));
  }
  // end handle detail modal

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã giảm giá",
      visible: true,
      fixed: "left",
      width: "25%",
      dataIndex: "code",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      dataIndex: "usage_count",
      width: "15%",
      render: (value: number, data: any) => {
        return (
          <>
            {value > 0 ?
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
                <div >{value}</div>
                <Button onClick={() => openDiscountCodeDetailModal(data)} style={{ border: '1px solid #2A2A86'}}>
                  <img src={eyeIcon} style={{ marginRight: 10 }} alt="" />
                  <span style={{ color: '#2A2A86'}}>Chi tiết</span>
                </Button>
              </div>
              : <div>{value}</div>
            }
          </>
        );
      },
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
      dataIndex: "disabled",
      align: "center",
      width: "12%",
      render: (disabled: boolean) => {
        const StatusTag: ReactNode = STATUS_PROMO_CODE.find(
          (e: any) => e.disabled === disabled
        ).Component;
        return StatusTag;
      },
    },
    {
      title: "Ngày tạo mã",
      visible: true,
      fixed: "left",
      align: "center",
      width: "15%",
      dataIndex: "created_date",
      render: (created_date: string) => (
        created_date ? moment(created_date).format(DATE_FORMAT.DDMMYYY) : ""
      ),
    },
    ActionColumn(handleUpdate, handleDelete, handleStatus),
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



  const openFilter = useCallback(() => {
    // setVisible(true);
  }, []);

  useEffect(() => {
    dispatch(getPriceRuleAction(id, onResult));
  }, [dispatch, id, onResult]);


  // Call API get list
  useEffect(() => {
    getDiscountCodeData();
  }, [getDiscountCodeData]);

  // handle export file
  const [isVisibleExportProcessModal, setIsVisibleExportProcessModal] = useState(false);
  const [exportCode, setExportCode] = useState<string | null>(null);
  const [exportProcessPercent, setExportProcessPercent] = useState<number>(0);

  const resetExportProcess = () => {
    setExportProcessPercent(0);
    setExportCode(null);
  }

  const handleExportFile = () => {
    resetExportProcess();
    dispatch(showLoading());
    exportDiscountCode(priceRuleId)
      .then((response) => {
        if (response?.code) {
          setIsVisibleExportProcessModal(true);
          setExportCode(response.code);
        } else {
          showError(`${response.message ? response.message : "Có lỗi khi tạo tiến trình xuất file mã giảm giá"}`);
        }
      })
      .catch((error) => {
        if (error.response?.data?.errors?.length > 0) {
          const errorMessage = error.response?.data?.errors[0];
          showError(`${errorMessage ? errorMessage: "Có lỗi khi tạo tiến trình xuất file mã giảm giá"}`);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }

  const onCancelProgressModal = useCallback(() => {
    resetExportProcess();
    setIsVisibleExportProcessModal(false);
  }, []);

  const onExportFile = useCallback(() => {
    if (!exportCode) return;
    
    let getFilePromises: any = getPromotionJobsApi(exportCode);
    Promise.all([getFilePromises]).then((responses) => {
      responses.forEach((response: any) => {
        if (isVisibleExportProcessModal && response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status?.toUpperCase() === "FINISH") {
            if (response.data.url) {
              setExportCode(null);
              setExportProcessPercent(100);
              showSuccess("Xuất file dữ liệu mã giảm giá thành công!");
              window.open(response.data.url);
            }
          } else {
            if (response.data.total > 0) {
              const percent = Math.floor(response.data.success / response.data.total * 100);
              setExportProcessPercent(percent >= 100 ? 99 : percent);
            }
          }
        }
      });
    });
  }, [exportCode, isVisibleExportProcessModal]);

  useEffect(() => {
    if (exportProcessPercent === 100 || !exportCode) return;

    onExportFile();

    const getFileInterval = setInterval(onExportFile,3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExportFile, exportCode]);
  // end handle export file


  return (

    <ContentContainer
      title={`Mã giảm giá của đợt phát hành ${promoValue?.code ?? ''}`}
      breadcrumb={[
        {
          name: "Khuyến mại",
        },
        {
          name: "Đợt phát hành",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
        {
          name: `${promoValue?.code}`,
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${promoValue?.id}`,
        },
        {
          name: "Danh sách mã giảm giá",
        },
      ]}
      extra={
        <Row>
          <Space>
            <Button
              disabled={isLoading}
              size="large"
              icon={
                <img src={exportIcon} style={{ marginRight: 8 }} alt="" />
              }
              onClick={handleExportFile}>
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
          <CustomFilter onMenuClick={onMenuClick} menu={ACTIONS_PROMO_CODE} actionDisable={!allowUpdatePromoCode}>
            <Form onFinish={onFilter} initialValues={params} layout="inline" form={form}>
              <Item name="code" className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tìm kiếm theo mã, tên chương trình"
                  onBlur={(e) => { form.setFieldsValue({ code: e.target.value?.trim() }) }}
                />
              </Item>
              <Item name="state">
                <Select
                  showArrow
                  showSearch
                  style={{ minWidth: "200px" }}
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
            bordered
            selectedRowKey={selectedRowKey}
            onChangeRowKey={(rowKey) => {
              setSelectedRowKey(rowKey);
            }}
            isRowSelection
            isLoading={isLoading}
            // sticky={{offsetScroll: 5}}
            pagination={{
              pageSize: promoCodeList.metadata.limit,
              total: promoCodeList.metadata.total,
              current: promoCodeList.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            isShowPaginationAtHeader
            dataSource={promoCodeList.items}
            columns={columns}
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
              <p style={{ fontWeight: 500 }}>Thêm mã thủ công</p>
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
              <p style={{ fontWeight: 500 }}>Thêm mã ngẫu nhiên</p>
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
              <p style={{ fontWeight: 500 }}>Nhập file Excel</p>
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
              dispatch(getPriceRuleAction(id, onResult));
              setShowImportFile(false);
            }}
            disabled={uploadStatus === "error"}
          >
            Xong
          </Button>,
        ]}
      >
        <div style={{ display: uploadStatus === undefined ? "" : "none" }}>
          <Row gutter={12}>
            <Col span={3}>Chú ý:</Col>
            <Col span={19}>
              <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
              <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
              <p>
                - Tải file mẫu{" "}
                <a href={PROMOTION_CDN.DISCOUNT_CODES_TEMPLATE_URL}> tại đây </a>{" "}
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
                action={`${AppConfig.baseUrl}promotion-service/price-rules/${priceRuleId}/discount-codes/read-file2`}
                headers={{ Authorization: `Bearer ${token}` }}
                beforeUpload={(file) => {
                  if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    setUploadStatus("error");
                    setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                    return false;
                  }
                  setShowImportFile(false);
                  setIsVisibleProcessModal(true);
                  setUploadError([]);
                  return true;
                }}
                onChange={(info) => {
                  const { status } = info.file;
                  if (status === "done") {
                    setUploadStatus(undefined);
                    if (info.file?.response?.code) {
                      setIsVisibleProcessModal(true);
                      resetProgress();
                      setJobCreateCode(info.file.response.code);
                      setIsProcessing(true);
                    } else {
                      setIsVisibleProcessModal(false);
                      setUploadStatus("error");
                      setUploadError("Có lỗi khi tạo tiến trình Thêm mới mã giảm giá.");
                    }
                  } else if (status === "error") {
                    setIsVisibleProcessModal(false);
                    message.error(`${info.file.name} file upload failed.`);
                    setUploadStatus("error");
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
          <div style={{ display: uploadStatus === "error" ? "" : "none" }}>
            <Row justify={"center"}>
              {uploadStatus === "error" ? (
                <Col span={24}>
                  <Row justify={"center"}>
                    <Space size={"large"}>
                      <VscError style={{ fontSize: "78px", color: "#E24343" }} />
                      <h2 style={{ padding: "10px 30px" }}>
                        <li>{uploadError || "Máy chủ đang bận"}</li>
                      </h2>
                    </Space>
                  </Row>
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

      {/* Process create new discount code */}
      {isVisibleProcessModal &&
        <ProcessAddDiscountCodeModal
          visible={isVisibleProcessModal}
          onOk={onOKProgressImportCustomer}
          progressData={progressData}
          progressPercent={processPercent}
          isProcessing={isProcessing}
        />
      }

      {/* Progress export customer data */}
      {isVisibleExportProcessModal &&
        <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleExportProcessModal}
          title="Xuất file"
          centered
          width={600}
          maskClosable={false}
          footer={[
            <>
              {exportProcessPercent < 100 ?
                <Button key="cancel-process-modal" danger onClick={onCancelProgressModal}>
                  Thoát
                </Button>
                :
                <Button key="confirm-process-modal" type="primary" onClick={onCancelProgressModal}>
                  Xác nhận
                </Button>
              }
            </>
          ]}>
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>
              {exportProcessPercent < 100 ?
                <span>Đang tạo file, vui lòng đợi trong giây lát...</span>
                :
                <span style={{ color: "#27AE60" }}>Đã xuất file dữ liệu mã khuyến mại thành công!</span>
              }
            </div>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProcessPercent}
            />
          </div>
        </Modal>
      }

      {/* Process create new discount code */}
      {isVisibleDiscountUsageDetailModal &&
        <DiscountUsageDetailModal
          visible={isVisibleDiscountUsageDetailModal}
          discountUsageDetailList={discountUsageDetailList}
          onCloseModal={onCloseDiscountUsageDetailModal}
        />
      }
    </ContentContainer>
  );
};

export default ListCode;
