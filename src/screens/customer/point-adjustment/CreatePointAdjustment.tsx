import React, {createRef, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import { useHistory } from "react-router";
import NumberFormat from "react-number-format";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Form,
  FormInstance,
  AutoComplete,
  InputNumber,
  Tooltip,
  Spin,
} from "antd";

import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { useQuery } from "utils/useQuery";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";

import {
  getCustomerListAction,
} from "domain/actions/customer/customer.action";
import {
  createCustomerPointAdjustmentAction,
  getImportCodeCustomerAdjustmentAction,
  getLoyaltyPoint,
} from "domain/actions/loyalty/loyalty.action";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { CustomerResponse } from "model/response/customer/customer.response";
import { PageResponse } from "model/base/base-metadata.response";
import { CustomerSearchQuery } from "model/query/customer.query";

import ContentContainer from "component/container/content.container";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { LoyaltyPermission } from "config/permissions/loyalty.permission";

import closeIcon from "assets/icon/X_close.svg";
import arrowBack from "assets/icon/arrow-back.svg";
import { StyledCreatePointAdjustment } from "screens/customer/point-adjustment/StyledPointAdjustment";
import { StyledComponent } from "screens/ecommerce/products/tab/not-connected-items/styles";
import { StyledFooterAction } from "screens/customer/common/CommonStyled";
import { UploadOutlined } from "@ant-design/icons";
import ImportCustomerIntoAdjustmentFile from "../import-file/importCustomerIntoAdjustment";

import { getImportCodeCustomerAdjustmentRequest, } from 'model/request/loyalty/loyalty.request';

import {RootReducerType} from "model/reducers/RootReducerType";
import BaseResponse from "base/base.response";
import {HttpStatus} from "config/http-status.config";
import {handleDelayActionWhenInsertTextInSearchInput, isNullOrUndefined} from "utils/AppUtils";
import {EnumJobStatus} from "config/enum.config";
import {getInfoAdjustmentByJobService} from "service/loyalty/loyalty.service";

import deleteIcon from "assets/icon/deleteIcon.svg";
import excelIcon from "assets/icon/icon-excel.svg";


const { Item } = Form;
const POINT_ADD_REASON = [
  "Tặng điểm sinh nhật",
  "Tặng điểm ngày cưới",
  "Tặng điểm bù",
  "Tặng điểm sự cố",
  "Khác",
];
const POINT_SUBTRACT_REASON = ["Trừ điểm bù", "Khác"];

const MONEY_ADD_REASON = ["Tặng tiền tích lũy", "Khác"];
const MONEY_SUBTRACT_REASON = ["Trừ tiền tích lũy", "Khác"];

const createPointAdjustmentPermission = [LoyaltyPermission.points_update];

const CreatePointAdjustment = () => {
  const history = useHistory();
  const query = useQuery();
  const paramCustomerIds = query.get("customer_ids");

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const {account} = userReducer;
  
  const formRef = createRef<FormInstance>();
  const dispatch = useDispatch();

  const autoCompleteRefCustomer = useRef<any>(null);
  
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [type, setType] = useState<string>(query.get("type") as any);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [fieldName, setFieldName] = useState<string>("");

  const initFormValues = {
    type: type,
    reason: "Khác",
    value_change: null,
    note: null,
    search: "",
    name: ""
  };


  const callBackGetCustomerList = useCallback((result: PageResponse<any> | false) => {
    if (!!result) {
      setSelectedCustomers(result.items);
    }
  }, []);

  useEffect(() => {
    if (paramCustomerIds) {
      const customerIds = paramCustomerIds.split(",").map((id) => Number(id));
      const params: CustomerSearchQuery = {
        page: 1,
        limit: customerIds.length,
        ids: customerIds,
        search_type: "SIMPLE"
      }
      
      dispatch(getCustomerListAction(params, callBackGetCustomerList));
    }
  }, [callBackGetCustomerList, dispatch, paramCustomerIds]);


  const handleRemoveCustomer = (customer: any) => {
    const newSelectedCustomers = selectedCustomers.filter(item => item.id !== customer.id);
    setSelectedCustomers(newSelectedCustomers);
  };
  
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      visible: true,
      align: "center",
      render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
      width: "70px",
    },
    {
      title: "Số điện thoại",
      visible: true,
      dataIndex: "phone",
    },
    {
      title: "Tên khách hàng",
      visible: true,
      dataIndex: "full_name",
    },
    {
      title: "Mã khách hàng",
      visible: true,
      dataIndex: "code",
      align: "center",
    },
    {
      title: "Số điểm hiện tại",
      visible: true,
      dataIndex: "point",
      align: "center",
      render: (value: any) => (
        value ?
        <NumberFormat
          value={value}
          displayType={"text"}
          thousandSeparator={true}
        /> : 0
      ),
    },
    {
      width: "60px",
      render: (value: any, item: any) => {
        return (
          <StyledComponent>
            <img
              src={closeIcon}
              className="delete-item-icon"
              alt=""
              onClick={() => handleRemoveCustomer(item)}
            />
          </StyledComponent>
        );
      }
    },
  ];

  const updateCustomerList = React.useCallback((data: PageResponse<any> | false) => {
    setIsSearchingCustomer(false);
    if (data) {
      setCustomers(data.items);
    }
  }, []);
  
  const customerChangeSearch = useCallback(
    (value) => {
      setKeySearchCustomer(value);
      if(value.length >= 3) {
        setIsSearchingCustomer(true);
      } else {
        setIsSearchingCustomer(false);
      }
      
      let query: any = { request: value.trim() };
      const handleSearch = () => {
        dispatch(getCustomerListAction(query, updateCustomerList));
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRefCustomer, () => handleSearch());
    },
    [dispatch, updateCustomerList]
  );

  const transformCustomers = useMemo(() => {
    return customers.map((customer) => {
      return {
        label: customer.full_name + " - " + customer.phone,
        value: customer.full_name + " - " + customer.phone,
        customer: customer,
      };
    });
  }, [customers]);

  const onSelect = (value: any, option: any) => {
    const customer = option?.customer;
    if (customer) {
      const newSelectedCustomers = [...selectedCustomers];
      const isExistCustomer = newSelectedCustomers.find(item => item.id === customer.id);
      if (isExistCustomer) {
        showWarning("Khách hàng đã được chọn!");
      } else {
        dispatch(
          getLoyaltyPoint(customer.id, (data: LoyaltyPoint) => {
            customer.point = data ? data.point : 0;
            newSelectedCustomers.unshift(customer);
            setSelectedCustomers(newSelectedCustomers);
          })
        );
      }
    }
  };

  const onUpdateEnd = useCallback(
    (data: any) => {
      formRef.current?.resetFields();
      setSelectedCustomers([]);
      showSuccess("Tạo mới phiếu điều chỉnh thành công");
      history.replace(`${UrlConfig.CUSTOMER2}-adjustments/${data?.id}`)
    },
    [formRef, history]
  );

  const onChangeName = (e: any) => {
    setFieldName(e.target.value.trim());
  };

  const onBlur = (e: any) => {
    const nameValue = e.target.value.trim();
    setFieldName(nameValue);
    formRef.current?.setFieldsValue({
      name: nameValue,
    });
  };


  const onChangeType = useCallback(
    (value: string) => {
      setType(value);
      formRef.current?.setFieldsValue({
        reason: "Khác",
      });
    },
    [formRef]
  );

  
  const goBack = () => {
    if (paramCustomerIds?.length) {
      history.replace(`${UrlConfig.CUSTOMER}`)
    } else {
      history.replace(`${UrlConfig.CUSTOMER2}-adjustments`)
    }
  };

  //handle import customer adjustment
  const [isVisibleImportModal, setIsVisibleImportModal] = useState(false);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState<boolean>(false);
  const [fileImportCustomerAdjustment, setFileImportCustomerAdjustment] = useState<Array<File>>([]);
  const [importCustomerAdjustmentCode, setImportCustomerAdjustmentCode] = useState(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [importProgressPercent, setImportProgressPercent] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);


  const handleJobCodeResponse = (data: any) => {
    if (data) {
      setImportCustomerAdjustmentCode(data.code);
      setIsVisibleProgressModal(true);
      setIsDownloading(true);
    } else {
      showError("Có lỗi tải lên file tạo phiếu điều chỉnh. Vui lòng thử lại sau!");
    }
  }

  // import modal
  const openImportFileModal = () => {
    setIsVisibleImportModal(true);
  }

  const onOkImportModal = () => {
    setIsVisibleImportModal(false);
  }

  const onCancelImportModal = () => {
    setIsVisibleImportModal(false);
  }
  // end import modal

  const handleRemoveFileImportCustomerAdjustment = () => {
    setFileImportCustomerAdjustment([]);
  }

  //-- end handle import customer adjustment --/

  const onFinish = useCallback(
    (values) => {
      if (!values.value_change) {
        showError("Giá trị điều chỉnh phải lớn hơn 0");
        return;
      }

      if (fileImportCustomerAdjustment.length > 0) {
        const paramsByImportCustomer: getImportCodeCustomerAdjustmentRequest = {
          file: fileImportCustomerAdjustment[0],
          name: values.name,
          value_change: values.value_change,
          type: values.type,
          note: values.note,
          reason: values.reason,
          created_by: account?.code || "",
          created_name: account?.full_name || "",
        }
        dispatch(getImportCodeCustomerAdjustmentAction(paramsByImportCustomer, handleJobCodeResponse))
      } else {
        const customerIds = selectedCustomers.map(customer => customer.id);
        const params = {
          customer_ids: customerIds,
          note: values.note,
          reason: values.reason,
          value_change: values.value_change,
          type: values.type,
          name: values.name,
        }
        dispatch(createCustomerPointAdjustmentAction(params, onUpdateEnd));
      }
    },
    [account?.code, account?.full_name, dispatch, fileImportCustomerAdjustment, onUpdateEnd, selectedCustomers]
  );

  const checkDisableCreateButton = useCallback(() => {
    return !fieldName || (selectedCustomers.length === 0 && fileImportCustomerAdjustment.length === 0);
  }, [fieldName, fileImportCustomerAdjustment.length, selectedCustomers.length]);

  //handle create adjustment
  const handleCreateAdjustment = () => {
    formRef.current?.submit();
  }
  //--end handle create adjustment --//

  // handle process import file
  const resetProgress = () => {
    setImportCustomerAdjustmentCode(null);
    setImportProgressPercent(0);
    setProgressData(null);
  }

  const onOKProgressModal = () => {
    resetProgress();
    setIsVisibleProgressModal(false);
  }

  const getProgressImportFile = useCallback(() => {
    let getImportProgressPromise: Promise<BaseResponse<any>> = getInfoAdjustmentByJobService(importCustomerAdjustmentCode);
    Promise.all([getImportProgressPromise]).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS && response.data && !isNullOrUndefined(response.data.total)) {
          const processData = response.data;
          setProgressData(processData);
          
          const progressCount = processData.processed;
          if (progressCount >= processData.total || processData.status.toUpperCase() === EnumJobStatus.finish) {
            setImportProgressPercent(100);
            setImportCustomerAdjustmentCode(null);
            setIsDownloading(false);
            showSuccess("Hoàn thành tạo mới phiếu điều chỉnh từ file tải lên!");
          } else {
            const percent = Math.floor(progressCount / processData.total * 100);
            setImportProgressPercent(percent);
          }
        }
      });
    });
  }, [importCustomerAdjustmentCode]);

  useEffect(() => {
    if (importProgressPercent === 100 || !importCustomerAdjustmentCode) {
      return;
    }
    getProgressImportFile();
    const getFileInterval = setInterval(getProgressImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [getProgressImportFile, importCustomerAdjustmentCode, importProgressPercent]);
  // end handle process import file
  
  return (
    <StyledCreatePointAdjustment>
      <ContentContainer
        title="Phiếu điều chỉnh"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Phiếu điều chỉnh",
            path: `${UrlConfig.CUSTOMER2}-adjustments`,
          },
          {
            name: "Thêm mới",
          },
        ]}
        extra={<></>}
      >
        <AuthWrapper acceptPermissions={createPointAdjustmentPermission} passThrough>
            {(allowed: boolean) => (allowed ?
              <Card
                title="THÔNG TIN ĐIỀU CHỈNH"
              >
                <div className="create-point-adjustments">
                  <Form
                    onFinish={onFinish}
                    initialValues={initFormValues}
                    layout="vertical"
                    ref={formRef}
                  >
                    <Row className="row">
                      <Col span={17}>
                        <div className="row-label">
                          <span>Tên phiếu điều chỉnh </span>
                          <span className="text-error">*</span>
                        </div>
                        <div className="row-content">
                          <Item
                            name="name"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập tên phiếu điều chỉnh",
                              },
                            ]}
                          >
                            <Input
                              onChange={onChangeName}
                              onBlur={onBlur}
                              maxLength={255}
                              placeholder="Nhập tên phiếu điều chỉnh"
                            />
                          </Item>
                        </div>
                      </Col>
                    </Row>

                    <Row className="row">
                      <Col span={8}>
                        <div className="row-label">
                          Kiểu điều chỉnh <span className="text-error">*</span>
                        </div>
                        <div className="row-content">
                          <Item
                            name="type"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn kiểu điều chỉnh",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Chọn kiểu điều chỉnh"
                              style={{ width: "100%" }}
                              onChange={onChangeType}
                            >
                             <Select.Option key="ADD_POINT" value="ADD_POINT">
                              Tặng điểm tích lũy
                              </Select.Option>
                            
                              <Select.Option key="SUBTRACT_POINT" value="SUBTRACT_POINT">
                              Trừ điểm tích lũy
                              </Select.Option>
                            
                              <Select.Option key="ADD_MONEY" value="ADD_MONEY">
                              Tặng tiền tích lũy
                              </Select.Option>
                            
                              <Select.Option key="SUBTRACT_MONEY" value="SUBTRACT_MONEY">
                              Trừ tiền tích lũy
                              </Select.Option>
                            </Select>
                          </Item>
                        </div>
                      </Col>
                      <Col span={1} />
                      <Col span={8}>
                        <div className="row-label">
                          Lý do điều chỉnh <span className="text-error">*</span>
                        </div>
                        <div className="row-content">
                          <Item
                            name="reason"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn lý do điều chỉnh",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Chọn lý do điều chỉnh"
                              style={{ width: "100%" }}
                            >
                              {type === "ADD_POINT" && 
                                POINT_ADD_REASON.map((reason, idx) => (
                                  <Select.Option key={idx} value={reason}>
                                    {reason}
                                  </Select.Option>
                                ))
                              }

                              {type === "SUBTRACT_POINT" && 
                                  POINT_SUBTRACT_REASON.map((reason, idx) => (
                                    <Select.Option key={idx} value={reason}>
                                      {reason}
                                    </Select.Option>
                                  ))
                              }

                              {type === "ADD_MONEY" && 
                                MONEY_ADD_REASON.map((reason, idx) => (
                                  <Select.Option key={idx} value={reason}>
                                    {reason}
                                  </Select.Option>
                                ))
                              }

                              {type === "SUBTRACT_MONEY" && 
                                MONEY_SUBTRACT_REASON.map((reason, idx) => (
                                  <Select.Option key={idx} value={reason}>
                                    {reason}
                                  </Select.Option>
                                ))
                              }
                            </Select>
                          </Item>
                        </div>
                      </Col>
                    </Row>
                    <Row className="row">
                      <Col span={8}>
                        <div className="row-label">
                          Giá trị <span className="text-error">*</span>
                        </div>
                        <div className="row-content">
                          <Item
                            name="value_change"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập giá trị",
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              placeholder="Nhập giá trị"
                              min="0"
                              max="1000000000"
                            />
                          </Item>
                        </div>
                      </Col>
                      <Col span={1} />
                      <Col span={8}>
                        <div className="row-label">Ghi chú</div>
                        <div className="row-content">
                          <Item name="note">
                            <Input placeholder="Nhập ghi chú" />
                          </Item>
                        </div>
                      </Col>
                    </Row>

                    <Row className="row">
                      <Col span={17}>
                        <div className="row-label">
                          <span>Khách hàng </span>
                          <span className="text-error">*</span>
                        </div>
                        <div className="row-content row-content-info-customer">
                          <Item
                            name="search"
                            rules={[
                              {
                                message: "",
                              },
                            ]}
                            className="search-info-customer"
                          >
                            <AutoComplete
                              allowClear
                              notFoundContent={
                                isSearchingCustomer ? <Spin size="small"/> : "Không tìm thấy khách hàng"
                              }
                              onSearch={customerChangeSearch}
                              options={transformCustomers}
                              onSelect={onSelect}
                              placeholder="Tìm kiếm theo mã khách hàng, tên, SĐT khách hàng"
                              value={keySearchCustomer}
                              ref={autoCompleteRefCustomer}
                              disabled={fileImportCustomerAdjustment.length > 0}
                            />
                          </Item>

                          <Button
                            className="upload-file-customer"
                            size="large"
                            icon={<UploadOutlined />}
                            onClick={openImportFileModal}
                            disabled={selectedCustomers.length > 0}
                          >
                            Nhập file
                          </Button>
                        </div>
                      </Col>

                      <Col span={7}  className="customer-adjustment-file-name">
                        {fileImportCustomerAdjustment.length > 0 &&
                          <div style={{ marginTop: 10 }}>
                            <img src={excelIcon} alt="" style={{ marginRight: 5 }}/>
                            <span style={{ padding: "0 2px", wordBreak: "break-all" }}>{fileImportCustomerAdjustment[0].name}</span>
                            <Tooltip
                              overlay="Xóa file"
                              placement="top"
                              color="red"
                            >
                              <img
                                src={deleteIcon}
                                style={{ marginLeft: 5, cursor: "pointer" }}
                                alt=""
                                onClick={handleRemoveFileImportCustomerAdjustment}
                              />
                            </Tooltip>
                          </div>
                        }
                      </Col>
                    </Row>

                    <Row>
                      <Col span={24}>
                        <CustomTable
                          bordered
                          dataSource={selectedCustomers}
                          columns={columns}
                          pagination={false}
                          rowKey={(item: any) => item.id}
                        />
                      </Col>
                    </Row>

                    <StyledFooterAction>
                      <div className="footer-action">
                        <Button
                          onClick={goBack}
                          type="text"
                          className="go-back-button"
                        >
                          <span>
                            <img style={{ marginRight: "10px" }} src={arrowBack} alt="" />
                            <span>Quay lại</span>
                          </span>
                        </Button>
                        
                        <div className="confirm-button">
                          <Button
                            onClick={goBack}
                            style={{ marginRight: 10 }}
                            type="default"
                          >
                            Huỷ
                          </Button>

                          <Button
                            type="primary"
                            onClick={handleCreateAdjustment}
                            disabled={checkDisableCreateButton()}
                          >
                            Thêm mới
                          </Button>
                        </div>
                      </div>
                    </StyledFooterAction>
                  </Form>
                </div>
              </Card>
              : <NoPermission />)}
          </AuthWrapper>

          {/* import customer file */}
          <ImportCustomerIntoAdjustmentFile
            isVisibleImportModal={isVisibleImportModal}
            onOkImportModal={onOkImportModal}
            onCancelImportModal={onCancelImportModal}
            isVisibleProgressModal={isVisibleProgressModal}
            progressData={progressData}
            onOKProgressModal={onOKProgressModal}
            setFileImportCustomerAdjustment={setFileImportCustomerAdjustment}
            importProgressPercent={importProgressPercent}
            isDownloading={isDownloading}
          />
      </ContentContainer>
    </StyledCreatePointAdjustment>
  );
};

export default CreatePointAdjustment;
