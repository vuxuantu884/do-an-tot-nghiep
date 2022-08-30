import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { showError, showSuccess } from "utils/ToastUtils";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

import {
  getCampaignContactListAction,
  getCampaignDetailAction,
  getCampaignRefIdAction,
  resendContactMessageAction,
  updateCampaignAction,
  updateContactMessageAction,
} from "domain/actions/marketing/marketing.action";
import { CampaignContactSearchQuery } from "model/marketing/marketing.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CAMPAIGN_STATUS_LIST, MESSAGE_STATUS_LIST } from "screens/marketing/campaign/campaign-helper";
import {
  CampaignDetailStyled,
  CampaignListFilterStyled,
  UpdateContactMessageStyled,
} from "screens/marketing/campaign/campaign-styled";

import circleCountBlue from "assets/icon/circle-count-blue.svg";
import userYellowIcon from "assets/icon/user-yellow.svg";
import failIcon from "assets/icon/fail-icon.svg";
import circleCountSuccess from "assets/icon/circle-count-success.svg";
import editIcon from "assets/icon/edit.svg";
import reloadGrayIcon from "assets/icon/reload-gray.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import { RiEditLine } from "react-icons/ri";
import TagStatus from "component/tag/tag-status";
import useAuthorization from "hook/useAuthorization";
import { CAMPAIGN_PERMISSION } from "config/permissions/marketing.permission";

const { Option } = Select;

// campaign permission
const updateCampaignPermission = [CAMPAIGN_PERMISSION.marketings_campaigns_update];
const viewContactPermission = [CAMPAIGN_PERMISSION.marketings_contacts_read];

const CampaignDetail = () => {

  const dispatch = useDispatch();
  const params: any = useParams();
  const [form] = Form.useForm();
  const history = useHistory();

  // campaign permission
  const [allowUpdateCampaign] = useAuthorization({
    acceptPermissions: updateCampaignPermission,
    not: false,
  });
  const [allowViewContact] = useAuthorization({
    acceptPermissions: viewContactPermission,
    not: false,
  });

  const [campaignDetail, setCampaignDetail] = useState<any>();
  const [campaignAnalysis, setCampaignAnalysis] = useState<any>();

  const [isShowUpdateMessageModal, setIsShowUpdateMessageModal] = useState<boolean>(false);
  const [contactMessage, setContactMessage] = useState<string>("");
  const [contactItemUpdate, setContactItemUpdate] = useState<any>();

  /** campaign sms info list */
  const campaignSmsInfoList = useMemo(() => {
    return [
      {
        name: "Loại tin",
        value: campaignDetail?.message_type || null,
      },
      {
        name: "Thời gian tạo",
        value: campaignDetail?.created_date ? (
          <span>{ConvertUtcToLocalDate(campaignDetail?.created_date, DATE_FORMAT.DDMMYYY)}</span>
        ) : null,
      },
      {
        name: "Brandname",
        value: campaignDetail?.brand_name || null,
      },
      {
        name: "Thời gian gửi",
        value: campaignDetail?.send_date ? (
          <span>{ConvertUtcToLocalDate(campaignDetail?.send_date, DATE_FORMAT.DDMMYYY)}</span>
        ) : null,
      },
      {
        name: "Kênh gửi",
        value: campaignDetail?.channel || null,
      },
    ];
  }, [campaignDetail])

  /** campaign analysis list */
  const campaignAnalysisList: Array<any> = useMemo(() => {
    return [
      {
        name: "Tổng chi phí",
        value: campaignAnalysis ? `${campaignAnalysis.TotalPrice} đ` : "--",
        icon: circleCountBlue,
      },
      {
        name: "Tin gửi thành công",
        value: campaignAnalysis ? campaignAnalysis.SendSuccess : "--",
        icon: circleCountSuccess,
      },
      {
        name: "Số người nhận",
        value: campaignAnalysis ? campaignAnalysis.TotalReceiver : "--",
        icon: userYellowIcon,
      },
      {
        name: "Tin thất bại",
        value: campaignAnalysis ? campaignAnalysis.SendFailed : "--",
        icon: failIcon,
      },
    ];
  }, [campaignAnalysis]);

  const getCampaignAnalysis = (refId: string) => {
    const analysisQuery = {
      RefId: refId,
      ApiKey: "22D6D84CB8CF8FDE819E5EAFC4DFCD",
      SecretKey: "459AEAB79160E7EBCEC046BEA40E15",
    };
    const params = generateQuery(analysisQuery);
    const link = `https://rest.esms.vn/MainService.svc/json/GetSendStatus?${params}`;

    fetch(link)
      .then((response) => response.json())
      .then((actualData) => {
        setCampaignAnalysis(actualData);
      })
      .catch((err) => {
        console.log(err?.message);
        showError(err?.message);
      });
  }
  /** end campaign analysis list */

  /** lấy chi tiết chiến dịch */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (params?.id) {
      dispatch(getCampaignDetailAction(params.id, setCampaignDetail));
      // fake campaign id = 5
      dispatch(getCampaignRefIdAction(5, (response) => {
        if (response) {
          getCampaignAnalysis(response.ref_id);
        }
      }));
    }
  }, [dispatch, params?.id]);

  /** lấy danh sách KH cho chiến dịch */
  const [queryContactSearch, setQueryContactSearch] = useState<CampaignContactSearchQuery>(
      {
        page: 1,
        limit: 30,
        phone: null,
        statuses: null,
      },
    );
  const [isLoading, setIsLoading] = useState(false);
  const [campaignCustomerData, setCampaignCustomerData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const updateCampaignCustomerListData = useCallback((responseData: PageResponse<any> | false) => {
    setIsLoading(false);
    if (responseData) {
      setCampaignCustomerData(responseData);
    }
  }, []);

  const getCampaignCustomerList = useCallback((query: any) => {
    if (!allowViewContact) {
      return;
    } else {
      const queryCustomer = {
        ...queryContactSearch,
        ...query,
      };
      setQueryContactSearch(queryCustomer);
      setIsLoading(true);
      dispatch(getCampaignContactListAction(Number(params?.id), queryCustomer, updateCampaignCustomerListData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowViewContact, dispatch, params?.id, updateCampaignCustomerListData]);

  const reloadPage = () => {
    window.location.reload();
  };

  /** column table */
  const resendContactMessage = useCallback((item: any) => {
    dispatch(resendContactMessageAction(item.id, (response) => {
      if (response) {
        getCampaignCustomerList({});
        showSuccess("Gửi lại tin thành công.");
      }
    }));
  }, [dispatch, getCampaignCustomerList]);

  const handleUpdateContactMessage = (item: any) => {
    setContactMessage(item.customer_message);
    setContactItemUpdate(item);
    setIsShowUpdateMessageModal(true);
  };

  const callbackUpdateContactMessage = (response: any) => {
    if (response) {
      setIsShowUpdateMessageModal(false);
      showSuccess("Cập nhật nội dung tin nhắn thành công.");

      // getCampaignCustomerList({});
      setTimeout(() => {
        reloadPage();
      }, 100);
    }
  };

  const onOkUpdateContactMessage = () => {
    const queryParams = {
      id: contactItemUpdate.id,
      customer_message: contactMessage,
    }
    dispatch(updateContactMessageAction(queryParams, callbackUpdateContactMessage));
  };
  
  const onCancelUpdateContactMessage = () => {
    setIsShowUpdateMessageModal(false);
    setContactMessage("");
  };

  const ContactRowAction = useCallback((item: any) => {
    return (
      <div>
        {(item.customer_message_status === "PENDING" || item.customer_message_status === "FAILED") &&
          <Button
            type="link"
            icon={
              <Tooltip title={"Chỉnh sửa"}>
                <img src={editIcon} alt="editIcon" style={{ width: "24px" }} />
              </Tooltip>
            }
            style={{ padding: 0, width: "30px", marginRight: "20px" }}
            onClick={() => handleUpdateContactMessage(item)}
          />
        }

        {item.customer_message_status === "FAILED" &&
          <Button
            type="link"
            icon={
              <Tooltip title={"Gửi lại"}>
                <img src={reloadGrayIcon} alt="reloadGrayIcon" />
              </Tooltip>
            }
            style={{ padding: 0, width: "30px" }}
            onClick={() => resendContactMessage(item)}
          />
        }
      </div>
    );
  }, [resendContactMessage]);

  const columns: Array<ICustomTableColumType<any>> = useMemo(() => {
    return [
      {
        title: "STT",
        align: "center",
        render: (value: any, item: any, index: number) => (
          <div>
            {(campaignCustomerData.metadata.page - 1) * campaignCustomerData.metadata.limit + index + 1}
          </div>
        ),
        width: "70px",
      },
      {
        title: "Số điện thoại",
        width: "200px",
        render: (item: any) => {
          return (
            <span>{item.customer_phone_number}</span>
          );
        },
      },
      {
        title: "Trạng thái gửi",
        align: "center",
        width: "200px",
        render: (item: any) => {
          const campaignStatus: any = MESSAGE_STATUS_LIST.find(
            (status) => status.value.toUpperCase() === item.customer_message_status?.toUpperCase());
          return <div style={{ color: `${campaignStatus?.color}` }}>{campaignStatus?.name}</div>;
        },
      },
      {
        title: "Thời gian gửi",
        width: "200px",
        align: "center",
        render: (item: any) => {
          return (
            <div>{ConvertUtcToLocalDate(item.customer_message_date, DATE_FORMAT.DDMMYYY)}</div>
          );
        },
      },
      {
        title: "Nội dung tin nhắn",
        render: (item: any) => {
          return (
            <div>{item.customer_message}</div>
          );
        },
      },
      {
        title: "Thao tác",
        align: "center",
        width: "150px",
        render: (item: any) => (
          ContactRowAction(item)
        ),
      },
    ];
  }, [ContactRowAction, campaignCustomerData.metadata.limit, campaignCustomerData.metadata.page]);

  const onPageChange = useCallback((page, limit) => {
      getCampaignCustomerList({ page, limit });
    }, [getCampaignCustomerList],
  );

  const onFinish = useCallback(
    (values) => {
      getCampaignCustomerList(values);
    },
    [getCampaignCustomerList],
  );

  useEffect(() => {
    if (allowViewContact) {
      getCampaignCustomerList({});
    }
  }, [allowViewContact, getCampaignCustomerList]);
  /** --- */

  /** update campaign status */
  const updateCampaignStatus = (status: string) => {
    const params = {
      ...campaignDetail,
      status: status,
    };

    setIsLoading(true);
    dispatch(updateCampaignAction(campaignDetail?.id, { ...params }, (response) => {
      setIsLoading(false);
      showSuccess(`${status === "ACTIVE" ? "Kích hoạt" : "Tạm ngừng"} chiến dịch thành công.`);
      setCampaignDetail(response);
    }));
  };


  const renderCampaignStatus = useCallback(() => {
    const campaignStatus =  CAMPAIGN_STATUS_LIST.find(item => item.value === campaignDetail?.status?.toUpperCase());
    return (
      <>
        <span style={{ marginRight: "20px" }}>THÔNG TIN CHIẾN DỊCH</span>
        {campaignStatus &&
          <TagStatus type={campaignStatus.tagStatus}>
            {campaignStatus.name}
          </TagStatus>
        }
      </>
    )
  }, [campaignDetail?.status]);

  const renderMessageStatus = useCallback(() => {
    const campaignStatus =  MESSAGE_STATUS_LIST.find(item => item.value === campaignDetail?.message_status?.toUpperCase());
    return (
      <div style={{ display: "flex", alignItems: "center"}}>
        <span>THỐNG KÊ CHIẾN DỊCH</span>
        {campaignStatus &&
          <span
            style={{
              marginLeft: "20px",
              color: campaignStatus.color,
              fontWeight: 400,
              fontSize: "14px",
              textTransform: "none",
              padding: "4px 8px",
              border: `1px solid ${campaignStatus.color}`,
              borderRadius: "2px",
            }}
          >
            {campaignStatus?.name}
          </span>
        }
      </div>
    )
  }, [campaignDetail?.message_status]);

  return (
    <CampaignDetailStyled>
      <ContentContainer
        title="Chi tiết chiến dịch"
        breadcrumb={[
          {
            name: "Khách hàng",
            path: UrlConfig.CUSTOMER,
          },
          {
            name: "Marketing",
          },
          {
            name: "Danh sách chiến dịch",
            path: `${UrlConfig.MARKETING}/campaigns`,
          },
          {
            name: "Chi tiết chiến dịch",
          },
        ]}
      >
        <div>
          <Card
            title={renderCampaignStatus()}
            className="campaign-info"
          >
            <Row>
              <Col span={8}>
                <div className="item-detail">
                  <span className="item-label">Mã chiến dịch: </span>
                  <span>{campaignDetail?.code}</span>
                </div>

                <div className="item-detail" style={{ marginTop: "8px" }}>
                  <span className="item-label">Tên chiến dịch: </span>
                  <span>{campaignDetail?.campaign_name}</span>
                </div>
              </Col>

              <Col span={15} className="item-detail">
                <span className="item-label">Mô tả: </span>
                <span>{campaignDetail?.description || "---"}</span>
              </Col>
            </Row>
          </Card>

          <Card
            title={"CHI TIẾT CHIẾN DỊCH"}
            className="campaign-sms-detail"
          >
            <Row>
              <Col span={16}>
                <Row style={{ width: "100%", marginRight: "16px" }}>
                  {campaignSmsInfoList?.map((info: any, index: number) => (
                    <Col key={index} span={12} className="item-info">
                      <Col span={11}>
                        <span className="item-label">{info.name}</span>
                      </Col>
                      <Col span={13}>
                        <b>: {info.value ? info.value : "---"}</b>
                      </Col>
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col span={7}>
                <div className="sms-label">Nội dung tin nhắn:</div>
                <div className="sms-content">{campaignDetail?.campaign_message}</div>
              </Col>
            </Row>
          </Card>

          <Card
            title={renderMessageStatus()}
            className="campaign-analysis"
          >
            <Row>
              {campaignAnalysisList?.map((info: any, index: number) => (
                <Col key={index} span={6} className="item-info">
                  <img src={info.icon} alt="" style={{ marginRight: "16px" }} />
                  <div>
                    <div className="item-label">{info.name}</div>
                    <div className="analysis-value">{info.value}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {allowViewContact &&
            <Card
              title={"DANH SÁCH KHÁCH HÀNG"}
              className="campaign-customer-list"
            >
              <CampaignListFilterStyled>
                <Form
                  form={form}
                  onFinish={onFinish}
                  layout="inline"
                  className="inline-filter"
                >
                  <Form.Item name="phone" className="input-search">
                    <Input
                      disabled={isLoading}
                      allowClear
                      prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                      placeholder="Tên kiếm KH theo sđt"
                    />
                  </Form.Item>

                  <Form.Item
                    name="statuses"
                    className="status"
                  >
                    <Select
                      mode="multiple"
                      maxTagCount="responsive"
                      showArrow
                      showSearch
                      placeholder="Trạng thái"
                      allowClear
                      getPopupContainer={(trigger: any) => trigger.parentElement}
                      optionFilterProp="children"
                    >
                      {MESSAGE_STATUS_LIST?.map((item: any) => (
                        <Option key={item.value} value={item.value}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={isLoading}>
                      Lọc
                    </Button>
                  </Form.Item>
                </Form>
              </CampaignListFilterStyled>

              <CustomTable
                bordered
                isLoading={isLoading}
                sticky={{ offsetScroll: 5, offsetHeader: 55 }}
                pagination={{
                  pageSize: campaignCustomerData?.metadata?.limit,
                  total: campaignCustomerData?.metadata?.total,
                  current: campaignCustomerData?.metadata?.page,
                  showSizeChanger: true,
                  onChange: onPageChange,
                  onShowSizeChange: onPageChange,
                }}
                isShowPaginationAtHeader
                dataSource={campaignCustomerData?.items}
                columns={columns}
                rowKey={(item: any) => item.id}
              />
            </Card>
          }

          <BottomBarContainer
            back="Quay lại danh sách chiến dịch"
            backAction={() => history.push(`${UrlConfig.MARKETING}/campaigns`)}
            rightComponent={
              allowUpdateCampaign &&
              <Space>
                <Button onClick={() => history.push(`${UrlConfig.MARKETING}/campaigns/${params?.id}/update`)}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <RiEditLine color="#757575" style={{ width: "15px", marginRight: "8px" }} />
                    <span>Chỉnh sửa</span>
                  </div>
                </Button>

                {(campaignDetail?.status?.toUpperCase() === "WAITING" || campaignDetail?.status?.toUpperCase() === "PAUSE") &&
                  <Button onClick={() => updateCampaignStatus("ACTIVE")} type={"primary"}>
                    Kích hoạt
                  </Button>
                }

                {(campaignDetail?.status?.toUpperCase() === "ACTIVE") &&
                  <Button onClick={() => updateCampaignStatus("PAUSE")} type={"primary"}>
                    Tạm ngừng
                  </Button>
                }
              </Space>
            }
          />
        </div>
      </ContentContainer>

      <Modal
        visible={isShowUpdateMessageModal}
        title="Cập nhật nội dung tin nhắn"
        onCancel={onCancelUpdateContactMessage}
        onOk={onOkUpdateContactMessage}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        centered
        maskClosable={false}
      >
        <UpdateContactMessageStyled>
          <Input.TextArea
            value={contactMessage}
            placeholder="Nhập nội dung tin nhắn"
            onChange={(e: any) => {
              setContactMessage(e.target.value);
            }}
          />
        </UpdateContactMessageStyled>
      </Modal>
    </CampaignDetailStyled>
  );
};

export default CampaignDetail;
