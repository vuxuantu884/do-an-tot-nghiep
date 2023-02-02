import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  Space,
} from "antd";
import { ArrowLeftOutlined, MenuOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";

import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import UrlConfig from "config/url.config";

import ContentContainer from "component/container/content.container";
import BottomBarContainer from "component/container/bottom-bar.container";

import {
  CHANNEL_LIST,
  KEYWORD_LIST,
  SMS_TYPE_LIST,
} from "screens/marketing/campaign/campaign-helper";
import { CampaignCreateStyled } from "screens/marketing/campaign/campaign-styled";

import wifiBatteryIcon from "assets/icon/wifi-battery.svg";
import androidNavBack from "assets/icon/android-nav-back.svg";
import androidNavHome from "assets/icon/android-nav-home.svg";
import androidNavMulti from "assets/icon/android-nav-multi.svg";
import {
  createCampaignAction,
  getBrandNameAction,
  getCampaignContactAction,
  getCampaignDetailAction,
  getImportFileTemplateAction,
  getMessageTemplateAction,
  updateCampaignAction,
} from "domain/actions/marketing/marketing.action";
import CampaignImportFile from "screens/marketing/campaign/campaign-create/CampaignImportFile";
import { PageResponse } from "model/base/base-metadata.response";
import CustomTable from "component/table/CustomTable";
import useAuthorization from "hook/useAuthorization";
import { CAMPAIGN_PERMISSION } from "config/permissions/marketing.permission";
import { CampaignContactSearchQuery } from "model/marketing/marketing.model";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

const { Option } = Select;

// campaign permission
const viewContactPermission = [CAMPAIGN_PERMISSION.marketings_contacts_read];
const createContactPermission = [CAMPAIGN_PERMISSION.marketings_contacts_create];

const CampaignCreateUpdate = () => {
  const [form] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const history = useHistory();
  const dispatch = useDispatch();
  const params: any = useParams();

  // campaign permission
  const [allowViewContact] = useAuthorization({
    acceptPermissions: viewContactPermission,
    not: false,
  });
  const [allowCreateContact] = useAuthorization({
    acceptPermissions: createContactPermission,
    not: false,
  });

  let activeCampaign = true;

  const [isCreateCampaign, setIsCreateCampaign] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSelectedNow, setIsSelectedNow] = useState(true);
  const [campaignMessage, setCampaignMessage] = useState<string>("");
  const [activatedBtn, setActivatedBtn] = useState({
    name: "",
    value: "",
    icon: "",
  });

  const [brandNameList, setBrandNameList] = useState<Array<any>>([]);
  const [messageTemplateList, setMessageTemplateList] = useState<Array<any>>([
    {
      NetworkID: null,
      TempContent:
        "YODY ky niem 3 thang ban trai nghiem sp,tang ban ma GIAM GIA 100K:{P}(AD SPTK nguyen gia>200k),HSD:07/12/17.Moi ban mang TN den Yody nhan uu dai.LH:18002086.",
      TempId: 18659,
    },
  ]);

  const [importFileTemplate, setImportFileTemplate] = useState<string>("");
  const [isVisibleImportFileModal, setIsVisibleImportFileModal] = useState<boolean>(false);

  const [campaignDetail, setCampaignDetail] = useState<any>();
  const [isEditInfo, setIsEditInfo] = useState<boolean>(true);

  const [queryContactSearch, setQueryContactSearch] = useState<CampaignContactSearchQuery>({
    page: 1,
    limit: 30,
    phone: null,
    statuses: null,
  });
  const [campaignCustomerData, setCampaignCustomerData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  /** get contact data */
  const updateContactListData = useCallback((responseData: PageResponse<any> | false) => {
    setIsLoading(false);
    if (responseData) {
      setCampaignCustomerData(responseData);
    }
  }, []);

  const getContactList = useCallback(
    (campaignId, params) => {
      if (!allowViewContact) {
        return;
      }

      setIsLoading(true);
      dispatch(getCampaignContactAction(campaignId, params, updateContactListData));
    },
    [allowViewContact, dispatch, updateContactListData],
  );
  /** end get contact data */

  /** message template */
  const resetMessageTemplate = useCallback(() => {
    return; //fake message template
    // setMessageTemplateList([]);
    // form.setFieldsValue({
    //   message_template: null,
    // });
  }, []);

  const getMessageTemplate = useCallback((query: any) => {
    return; //fake data
    // dispatch(getMessageTemplateAction(query, (response) => {
    //   setMessageTemplateList(response);
    // }));
  }, []);

  /** handle update campaign */
  const updateCampaignDetail = useCallback(
    (response: any) => {
      if (response) {
        response.message_type = 2; //fake message_type
        response.message_template = 18659; //fake message_template
        setCampaignDetail(response);
        setIsEditInfo(false);
        form.setFieldsValue({
          ...response,
          message_type: response.message_type ? Number(response.message_type) : null,
        });
        setCampaignMessage(response.campaign_message);

        const messageTemplateQuery = {
          type: Number(response.message_type),
          brand_name: response.brand_name,
        };
        getMessageTemplate(messageTemplateQuery);
      }
    },
    [form, getMessageTemplate],
  );

  useEffect(() => {
    if (params?.id && brandNameList?.length > 0) {
      dispatch(getCampaignDetailAction(params.id, updateCampaignDetail));
      getContactList(params.id, {
        page: 1,
        limit: 30,
      });
    }
  }, [brandNameList, dispatch, getContactList, params.id, updateCampaignDetail]);

  useEffect(() => {
    if (params?.id) {
      setIsCreateCampaign(false);
    }
  }, [params?.id]);
  /** end handle update campaign */

  useEffect(() => {
    dispatch(getBrandNameAction(setBrandNameList));
  }, [dispatch]);

  // set default channel: SMS
  useEffect(() => {
    const smsChannel = CHANNEL_LIST.find((item) => item.value === "SMS");
    if (smsChannel) {
      setActivatedBtn(smsChannel);
    }
  }, []);

  /** handle campaign info */
  const createCampaignCallback = useCallback((response: any) => {
    setIsLoading(false);
    if (response) {
      setCampaignDetail(response);
      showSuccess("Đã tạo mới thông tin chiến dịch");
      setIsEditInfo(false);
    }
  }, []);

  const onCreateCampaign = () => {
    form.validateFields().then(() => {
      const params = form.getFieldsValue();
      setIsLoading(true);
      dispatch(createCampaignAction({ ...params }, createCampaignCallback));
    });
  };

  const updateCampaignInfoCallback = useCallback((response: any) => {
    setIsLoading(false);
    if (response) {
      setCampaignDetail(response);
      showSuccess("Chỉnh sửa thông tin chiến dịch thành công");
      setIsEditInfo(false);
    }
  }, []);

  const onUpdateCampaign = () => {
    form.validateFields().then(() => {
      const formValues = form.getFieldsValue();
      const params = { ...campaignDetail, ...formValues };
      setIsLoading(true);
      dispatch(updateCampaignAction(campaignDetail?.id, { ...params }, updateCampaignInfoCallback));
    });
  };

  const onCancelCreateUpdateInfo = () => {
    if (campaignDetail) {
      form.setFieldsValue({
        campaign_name: campaignDetail.campaign_name,
        description: campaignDetail.description,
      });
      setIsEditInfo(false);
    } else {
      form.resetFields();
    }
  };

  const renderCampaignInfoButton = () => {
    if (campaignDetail) {
      if (isEditInfo) {
        return (
          <>
            <Button onClick={onCancelCreateUpdateInfo}>{"Hủy"}</Button>

            <Button style={{ marginLeft: "20px" }} type={"primary"} onClick={onUpdateCampaign}>
              {"Cập nhật"}
            </Button>
          </>
        );
      } else {
        return (
          <Button onClick={() => setIsEditInfo(true)} type={"primary"}>
            Chỉnh sửa
          </Button>
        );
      }
    } else {
      return (
        <>
          <Button onClick={onCancelCreateUpdateInfo}>Hủy</Button>

          <Button style={{ marginLeft: "20px" }} type={"primary"} onClick={onCreateCampaign}>
            {"Tạo mới"}
          </Button>
        </>
      );
    }
  };
  /** end handle campaign info */

  /** submit form */
  const submitCallback = useCallback(
    (result) => {
      setIsLoading(false);
      if (result) {
        if (params?.id) {
          showSuccess("Cập nhật chiến dịch thành công");
        } else {
          showSuccess("Thêm mới chiến dịch thành công");
        }
        history.push(`${UrlConfig.MARKETING}/campaigns/${result.id}`);
      }
    },
    [history, params?.id],
  );

  const handleSubmit = (values: any) => {
    const params = {
      ...values,
      channel: activatedBtn.value,
      message_type: 2, //fake message_type
    };

    if (activeCampaign) {
      params.status = "ACTIVE";
    } else {
      params.status = campaignDetail?.status ? campaignDetail?.status : "WAITING";
    }

    setIsLoading(true);
    dispatch(updateCampaignAction(campaignDetail?.id, { ...params }, submitCallback));
  };

  const handleSubmitFail = (errorFields: any) => {
    const error = errorFields[0]?.errors[0];
    if (error) {
      showError({ error });
    } else {
      showError("Dữ liệu nhập vào chưa đúng, vui lòng kiểm tra lại");
    }
  };

  const handleSaveAndActive = () => {
    if (isSelectedNow) {
      form.setFieldsValue({ send_date: new Date().toISOString() });
    }
    activeCampaign = true;
    form.submit();
  };

  const handleSave = () => {
    if (isSelectedNow) {
      form.setFieldsValue({ send_date: new Date().toISOString() });
    }
    activeCampaign = false;
    form.submit();
  };
  /** end submit form */

  const onSelectChannel = (item: any) => {
    setActivatedBtn(item);
  };

  const onChangeCampaignMessage = (e: any) => {
    setCampaignMessage(e.target.value);
  };

  /** xử lý thời gian gửi tin */
  useEffect(() => {
    let sendDate: string;
    if (isSelectedNow) {
      sendDate = new Date().toISOString();
    } else {
      sendDate = "";
    }
    form.setFieldsValue({ send_date: sendDate });
  }, [form, isSelectedNow]);

  const onOkSelectDate = (value: any) => {
    form.setFieldsValue({ send_date: value.toISOString() });
  };
  /** --- */

  /** chọn loại tin */
  const onSelectMessageType = useCallback(
    (value: any) => {
      const brand_name = form.getFieldValue("brand_name");
      if (brand_name) {
        const query = {
          type: value,
          brand_name: brand_name,
        };
        getMessageTemplate(query);
      }
      resetMessageTemplate();
    },
    [form, getMessageTemplate, resetMessageTemplate],
  );
  /** --- */

  /** chọn brand name */
  const onSelectBrandName = useCallback(
    (value: any) => {
      const message_type = form.getFieldValue("message_type");
      if (message_type) {
        const brandName = brandNameList.find((item) => item.Brandname === value);
        const query = {
          type: message_type,
          brand_name: brandName.Brandname,
        };
        getMessageTemplate(query);
      }
      resetMessageTemplate();
    },
    [brandNameList, form, getMessageTemplate, resetMessageTemplate],
  );
  /** --- */

  /** chọn mẫu tin nhắn */
  const onSelectMessageTemplate = (value: any) => {
    const messageTemplate = messageTemplateList.find(
      (item) => Number(item.TempId) === Number(value),
    );
    form?.setFieldsValue({ campaign_message: messageTemplate?.TempContent });
    setCampaignMessage(messageTemplate?.TempContent);
  };
  /** --- */

  /** handle Insert key word */
  const updateCursorPosition = (cursorPosition: any, text: any, textArea: any) => {
    cursorPosition = cursorPosition + text.length;
    textArea.selectionStart = cursorPosition;
    textArea.selectionEnd = cursorPosition;
    textArea.focus();
  };

  const addTextAtCursorPosition = (
    textArea: any,
    cursorPosition: any,
    text: any,
    fieldName: any,
  ) => {
    let front = textArea.value.substring(0, cursorPosition);
    let back = textArea.value.substring(cursorPosition, textArea.value.length);
    textArea.value = front + text + back;
    form.setFieldsValue({ [fieldName]: textArea.value });

    if (fieldName === "campaign_message") {
      setCampaignMessage(textArea.value);
    }
  };

  const addTextAtCaret = (textAreaId: any, text: any, fieldName: any) => {
    let textArea = document.getElementById(textAreaId);
    // @ts-ignore
    let cursorPosition = textArea?.selectionStart;
    addTextAtCursorPosition(textArea, cursorPosition, text, fieldName);
    updateCursorPosition(cursorPosition, text, textArea);
  };

  const handleInsertKeyword = (keyWordValue: string) => {
    addTextAtCaret("campaign_message_content_input", keyWordValue, "campaign_message");
  };
  /** end handle Insert key word */

  const handleSelectKeyWord = (keyWord: any) => {
    handleInsertKeyword(keyWord.value);
  };

  /** xử lý nhập file */
  const importFile = useCallback(() => {
    let conditions: Array<string> = [];
    KEYWORD_LIST.forEach((item: any) => {
      const position = campaignMessage?.search(item.value);
      if (position !== -1) {
        conditions.push(item.key);
      }
    });

    dispatch(
      getImportFileTemplateAction(conditions, (response) => {
        if (response) {
          setImportFileTemplate(response);
        }
        setIsVisibleImportFileModal(true);
      }),
    );
  }, [campaignMessage, dispatch]);

  const onOkImportFile = useCallback(() => {
    setIsVisibleImportFileModal(false);

    getContactList(campaignDetail?.id, {
      page: 1,
      limit: 30,
    });
  }, [campaignDetail?.id, getContactList]);

  const onCancelImportFile = () => {
    setIsVisibleImportFileModal(false);
  };
  /** --- */

  /** contact table */
  const columns: any = useMemo(() => {
    // const contactFields = campaignCustomerData?.items[campaignCustomerData?.items.length - 1]?.contact_fields;
    // const columnData = contactFields?.map((contact: any) => {
    //   const keyWord = KEYWORD_LIST.find(keyWord => keyWord.key === contact.field);
    //     return (
    //       {
    //         title: keyWord ? keyWord.name : "Nội dung",
    //         key: keyWord ? keyWord.key : "content",
    //         width: keyWord ? "200px" : "",
    //         render: (item: any) => (
    //           <div>
    //             <span style={{ textAlign: "center" }}>{item}</span>
    //           </div>
    //         ),
    //       }
    //     )
    //   }
    // )
    return [
      {
        title: "STT",
        align: "center",
        render: (value: any, item: any, index: number) => (
          <div>
            {(campaignCustomerData.metadata.page - 1) * campaignCustomerData.metadata.limit +
              index +
              1}
          </div>
        ),
        width: "70px",
      },
      {
        title: "SĐT khách hàng",
        key: "customer_phone_number",
        width: "150px",
        render: (item: any) => <span>{item.customer_phone_number}</span>,
      },
      {
        title: "Nội dung tin nhắn",
        key: "message_content",
        render: (item: any) => <span>{item.customer_message}</span>,
      },
    ];
  }, [campaignCustomerData.metadata.limit, campaignCustomerData.metadata.page]);

  const onPageChange = useCallback(
    (page, limit) => {
      const contactQuery = {
        ...queryContactSearch,
        page,
        limit,
      };
      setQueryContactSearch(contactQuery);
      getContactList(campaignDetail?.id, contactQuery);
    },
    [campaignDetail?.id, getContactList, queryContactSearch],
  );

  const onSearchContact = useCallback(() => {
    const contactQuery = {
      ...queryContactSearch,
      page: 1,
    };
    getContactList(campaignDetail?.id, contactQuery);
  }, [campaignDetail?.id, getContactList, queryContactSearch]);

  const onChangeContactInputSearch = (e: any) => {
    setQueryContactSearch({
      ...queryContactSearch,
      phone: e.target.value,
    });
  };
  /** end contact table */

  return (
    <CampaignCreateStyled>
      <ContentContainer
        title={`${isCreateCampaign ? "Tạo chiến dịch" : "Chỉnh sửa chiến dịch"}`}
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
            name: `${isCreateCampaign ? "Tạo chiến dịch" : "Chỉnh sửa chiến dịch"}`,
          },
        ]}
      >
        <Form
          form={form}
          ref={formRef}
          name="customer_add"
          onFinish={handleSubmit}
          onFinishFailed={({ errorFields }) => handleSubmitFail(errorFields)}
          layout="vertical"
        >
          <Card title={"THÔNG TIN CHIẾN DỊCH"}>
            <Row gutter={24} style={{ height: "100px", marginBottom: "20px" }}>
              <Col span={12}>
                <Form.Item
                  name="campaign_name"
                  label={"Tên chiến dịch"}
                  rules={[{ required: true, message: "Vui lòng nhập tên chiến dịch" }]}
                >
                  <Input
                    disabled={isLoading || (campaignDetail && !isEditInfo)}
                    maxLength={255}
                    placeholder="Nhập tên chiến dịch"
                    onBlur={(e) => form?.setFieldsValue({ campaign_name: e.target.value?.trim() })}
                  />
                </Form.Item>
              </Col>

              <Col span={11}>
                <Form.Item name="description" label={"Mô tả"}>
                  <Input
                    disabled={isLoading || (campaignDetail && !isEditInfo)}
                    maxLength={255}
                    placeholder="Nhập mô tả chiến dịch"
                    onBlur={(e) => form?.setFieldsValue({ description: e.target.value?.trim() })}
                  />
                </Form.Item>
              </Col>
            </Row>

            {renderCampaignInfoButton()}

            <Button
              hidden // tạm ẩn
              style={{ color: "#2A2A86" }}
              icon={<PlusOutlined style={{ color: "#2A2A86" }} />}
              onClick={() => showWarning("Chọn chiến dịch gủi tin tự động")}
            >
              Chọn chiến dịch gủi tự động
            </Button>
          </Card>

          {campaignDetail && !isEditInfo && (
            <>
              <Card title={"THIẾT LẬP TIN NHẮN"} className="message-setting">
                <Row gutter={24}>
                  <Col span={16}>
                    <div className="channel-list">
                      <strong style={{ marginRight: "20px" }}>Kênh gửi:</strong>
                      {CHANNEL_LIST.map((item: any) => (
                        <Button
                          key={item.value}
                          className={`channel-button ${
                            item.value === activatedBtn?.value
                              ? "active-button"
                              : "icon-active-button"
                          }`}
                          icon={item.icon && <img src={item.icon} alt={item.value} />}
                          onClick={() => onSelectChannel(item)}
                          disabled={isLoading || item.value !== "SMS"}
                        >
                          {item.name}
                        </Button>
                      ))}
                    </div>

                    {activatedBtn?.value === "SMS" && (
                      <Row gutter={24} className={"sms-setting"}>
                        <Col span={11}>
                          <Form.Item
                            label={"Loại tin"}
                            name="message_type"
                            rules={[{ required: true, message: "Vui lòng chọn loại tin" }]}
                          >
                            <Select
                              showSearch
                              allowClear
                              placeholder="Chọn loại tin"
                              onSelect={onSelectMessageType}
                              onClear={resetMessageTemplate}
                            >
                              {SMS_TYPE_LIST?.map((item: any) => (
                                <Option key={item.value} value={item.value}>
                                  {item.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col span={11}>
                          <Form.Item
                            label={"Brandname"}
                            name="brand_name"
                            rules={[{ required: true, message: "Vui lòng chọn Brandname" }]}
                          >
                            <Select
                              showSearch
                              allowClear
                              placeholder="Chọn Brandname"
                              onSelect={onSelectBrandName}
                              onClear={resetMessageTemplate}
                            >
                              {brandNameList?.map((item: any, index: number) => (
                                <Option key={index} value={item.Brandname}>
                                  {item.Brandname}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col span={11}>
                          <Form.Item
                            label={"Mẫu tin nhắn"}
                            name="message_template"
                            rules={[{ required: true, message: "Vui lòng chọn Mẫu tin nhắn" }]}
                          >
                            <Select
                              showSearch
                              allowClear
                              placeholder="Chọn Mẫu tin nhắn"
                              onSelect={onSelectMessageTemplate}
                            >
                              {messageTemplateList?.map((item: any, index: number) => (
                                <Option key={index} value={item.TempId}>
                                  {item.TempId}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}

                    <Form.Item
                      label={"Thời gian gửi tin"}
                      name="send_date"
                      rules={[{ required: true, message: "Vui lòng chọn thời gian gửi tin" }]}
                      className="send-date"
                    >
                      <Radio.Group
                        onChange={(e) => setIsSelectedNow(e.target.value)}
                        value={isSelectedNow}
                        className="radio-group"
                      >
                        <Space className="radio-option">
                          <Radio value={true} key="isSelected">
                            Gửi ngay
                          </Radio>
                          <Radio value={false} key="isSelected_Time">
                            Gửi vào lúc
                          </Radio>
                        </Space>
                      </Radio.Group>

                      {!isSelectedNow && (
                        <DatePicker showTime showNow={false} onOk={onOkSelectDate} />
                      )}
                    </Form.Item>

                    <Form.Item
                      name="campaign_message"
                      label={"Nội dung"}
                      style={{ marginTop: "20px" }}
                    >
                      <Input.TextArea
                        id={"campaign_message_content_input"}
                        disabled={isLoading}
                        onChange={onChangeCampaignMessage}
                        placeholder="Nhập nội dung"
                        onBlur={(e) =>
                          form?.setFieldsValue({ campaign_message: e.target.value?.trim() })
                        }
                        style={{ height: "120px" }}
                      />
                    </Form.Item>

                    <div style={{ marginBottom: "16px", fontWeight: 500 }}>Chọn từ khóa</div>
                    <Row gutter={24}>
                      {KEYWORD_LIST?.map((keyWord: any, index: number) => (
                        <Col key={index} span={8} className="key-word">
                          <Button
                            style={{ width: "100%", marginBottom: "16px" }}
                            onClick={() => handleSelectKeyWord(keyWord)}
                          >
                            {keyWord.name}
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </Col>

                  <div className={"message-preview"}>
                    <div className={"header"} style={{ padding: "4px 0 0 16px" }}>
                      <span>12:30</span>
                      <img src={wifiBatteryIcon} alt="" />
                    </div>
                    <div className={"header"} style={{ padding: "20px 16px" }}>
                      <div className={"back-group"}>
                        <ArrowLeftOutlined
                          style={{ marginRight: "10px" }}
                          className={"header-icon"}
                        />
                        <span style={{ fontSize: "16px" }}>YODY</span>
                      </div>
                      <MenuOutlined className={"header-icon"} />
                    </div>

                    <div className={"body"}>
                      {campaignMessage && (
                        <div className={"message-content"}>{campaignMessage}</div>
                      )}
                    </div>

                    <div className={"android-navigation"}>
                      <img src={androidNavBack} alt="" />
                      <img src={androidNavHome} alt="" />
                      <img src={androidNavMulti} alt="" />
                    </div>
                  </div>
                </Row>
              </Card>

              {(allowViewContact || allowCreateContact) && (
                <Card title={"THIẾT LẬP ĐỐI TƯỢNG GỬI TIN"} className={"campaign-contact"}>
                  {allowCreateContact && <Button onClick={importFile}>Nhập file</Button>}

                  {allowViewContact && (
                    <>
                      <div style={{ margin: "20px 0", fontSize: "16px" }}>
                        <b>Danh sách khách hàng áp dụng</b>
                      </div>

                      <div className={"search-contact"}>
                        <Input
                          disabled={isLoading}
                          allowClear
                          prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                          placeholder="Tên kiếm KH theo sđt"
                          onChange={onChangeContactInputSearch}
                          onPressEnter={onSearchContact}
                          className={"input-search"}
                        />

                        <Button type="primary" disabled={isLoading} onClick={onSearchContact}>
                          Lọc
                        </Button>
                      </div>

                      <CustomTable
                        bordered
                        isLoading={isLoading}
                        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
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
                        rowKey={(item: any) => item.key}
                      />
                    </>
                  )}
                </Card>
              )}
            </>
          )}

          <BottomBarContainer
            back={`${
              isCreateCampaign ? "Quay lại danh sách chiến dịch" : "Quay lại chi tiết chiến dịch"
            }`}
            backAction={() => {
              if (isCreateCampaign) {
                history.push(`${UrlConfig.MARKETING}/campaigns`);
              } else {
                history.push(`${UrlConfig.MARKETING}/campaigns/${params?.id}`);
              }
            }}
            rightComponent={
              campaignDetail &&
              !isEditInfo && (
                <>
                  <Button
                    onClick={() => handleSave()}
                    style={{
                      marginLeft: ".75rem",
                      marginRight: ".75rem",
                      borderColor: "#2a2a86",
                    }}
                    type="ghost"
                  >
                    Lưu
                  </Button>
                  <Button type="primary" onClick={() => handleSaveAndActive()}>
                    Lưu và kích hoạt
                  </Button>
                </>
              )
            }
          />
        </Form>
      </ContentContainer>

      {/* Import customer file */}
      {isVisibleImportFileModal && (
        <CampaignImportFile
          importFileTemplate={importFileTemplate}
          campaignDetail={campaignDetail}
          onCancel={onCancelImportFile}
          onOk={onOkImportFile}
        />
      )}
    </CampaignCreateStyled>
  );
};

export default CampaignCreateUpdate;
