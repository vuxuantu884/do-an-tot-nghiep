import {
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  PhoneOutlined,
  SearchOutlined,
  UserOutlined
} from "@ant-design/icons";
import { AutoComplete, Button, Card, Col, DatePicker, Form, FormInstance, Input, Row } from "antd";
import { default as imageDefault, default as imgDefault } from "assets/icon/img-default.svg";
import ContentContainer from "component/container/content.container";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { CustomerSearchSo, getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import {
  createWarrantyAction,
  getWarrantyReasonsAction
} from "domain/actions/warranty/warranty.action";
import purify from "dompurify";
import useFetchStores from "hook/useFetchStores";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerResponse } from "model/response/customer/customer.response";
import { WarrantyFormType, WarrantyItemTypeModel } from "model/warranty/warranty.model";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { getPrintFormByWarrantyIdsService } from "service/warranty/warranty.service";
import {
  findAvatar,
  findPrice,
  formatCurrencyInputValue,
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  isFetchApiSuccessful,
  replaceFormatString
} from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import HistoryPurchaseModal from "../HistoryPurchase/HistoryPurchase.modal";
import { StyledComponent } from "./index.styles";
// import { AiOutlinePlusCircle } from 'react-icons/ai';
// import useAuthorization from 'hook/useAuthorization';
// import { CustomerListPermission } from 'config/permissions/customer.permission';

type Props = {};

const initQueryCustomer: CustomerSearchQuery = {
  request: "",
  limit: 5,
  page: 1,
  gender: null,
  from_birthday: null,
  to_birthday: null,
  company: null,
  from_wedding_date: null,
  to_wedding_date: null,
  customer_type_ids: [],
  customer_group_ids: [],
  customer_level_id: undefined,
  responsible_staff_codes: null,
  search_type: "SIMPLE",
};

function CreateWarranty(props: Props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [warrantyForm] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [searchCustomer, setSearchCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);
  const [hadCustomer, setHadCustomer] = useState(false);
  const [customerID, setCustomerID] = useState<number | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [visibleHistory, setVisibleHistory] = useState(false);

  const stores = useFetchStores();

  const [warrantyItems, setWarrantyItems] = useState<Array<any>>([]);
  // const [noneItems, setNoneItems] = useState(false);
  const [searchProducts, setSearchProducts] = useState(false);
  const [keySearchVariant, setKeySearchVariant] = useState("");
  const [resultSearchVariant, setResultSearchVariant] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [printContent, setPrintContent] = useState("");
  const printerContentHtml = () => {
    return `<div class='printerContent'>${printContent}<div>`;
  };
  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
    onAfterPrint: () => {
      history.push(`${UrlConfig.WARRANTY}`);
    },
  });

  // const [allowCreateCustomer] = useAuthorization({
  //   acceptPermissions: [CustomerListPermission.customers_create],
  //   not: false,
  // });

  const renderSearchVariant = (item: VariantResponse) => {
    let avatar = findAvatar(item.variant_images);
    return (
      <Row>
        <Col
          span={4}
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            padding: "4px 6px",
          }}
        >
          <img
            src={avatar === "" ? imgDefault : avatar}
            alt="anh"
            placeholder={imgDefault}
            style={{ width: "50%", borderRadius: 5 }}
          />
        </Col>
        <Col span={14}>
          <div style={{ padding: "5px 0" }}>
            <span
              className="searchDropdown__productTitle"
              style={{ color: "#37394D" }}
              title={item.name}
            >
              {item.name}
            </span>
            <div style={{ color: "#95A1AC" }}>{item.sku}</div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: "right", padding: "0 20px" }}>
            <div style={{ display: "inline-block", textAlign: "right" }}>
              <Col style={{ color: "#222222" }}>
                {`${findPrice(item.variant_prices, AppConfig.currency)} `}
                <span
                  style={{
                    color: "#737373",
                    textDecoration: "underline",
                    textDecorationColor: "#737373",
                  }}
                >
                  đ
                </span>
              </Col>
              <div style={{ color: "#737373" }}>
                Có thể bán:
                <span
                  style={{
                    color:
                      (item.available === null ? 0 : item.available) > 0
                        ? "#2A2A86"
                        : "rgba(226, 67, 67, 1)",
                  }}
                >
                  {` ${item.available === null ? 0 : item.available}`}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    );
  };

  const onChangeProductSearch = useCallback(
    async (value: string) => {
      setKeySearchVariant(value);

      if (value.length >= 3) {
        setSearchProducts(true);
      } else {
        setSearchProducts(false);
      }
      const handleSearchProduct = () => {
        if (value.trim()) {
          (async () => {
            try {
              await dispatch(
                searchVariantsOrderRequestAction(
                  { info: value },
                  (data) => {
                    setResultSearchVariant(data);
                    setSearchProducts(false);
                  },
                  () => {
                    setSearchProducts(false);
                  }
                )
              );
            } catch {
              setSearchProducts(false);
            }
          })();
        } else {
          setSearchProducts(false);
        }
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRefProduct, () =>
        handleSearchProduct()
      );
    },
    [dispatch]
  );
  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearchVariant]);

  const [reasons, setReasons] = useState<Array<any>>([]);
  const autoCompleteRefCustomer = useRef<any>(null);
  const autoCompleteRefProduct = useRef<any>(null);

  const initialFormValueWarranty = {
    customer_id: "",
    customer: "",
    customer_mobile: "",
    customer_address: "",
    store_id: null,
    assignee_code: null,
    appointment_date: null,
    delivery_method: null,
  };

  const CustomerRenderSearchResult = (item: CustomerResponse) => {
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100" style={{ lineHeight: "35px" }}>
          <img src={imageDefault} alt="anh" placeholder={imageDefault} className="logo-customer" />
          <div className="rs-info w-100">
            <span style={{ display: "flex" }}>
              {item.full_name}{" "}
              <i
                className="icon-dot"
                style={{
                  fontSize: "4px",
                  margin: "16px 10px 10px 10px",
                  color: "#737373",
                }}
              ></i>{" "}
              <span style={{ color: "#737373" }}>{item.phone}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };
  const customerConvertResultSearch = useMemo(() => {
    let options: any[] = [];
    if (resultSearch.length > 0) {
      resultSearch.forEach((item: CustomerResponse, index: number) => {
        options.push({
          label: CustomerRenderSearchResult(item),
          value: item.id ? item.id.toString() : "",
        });
      });
    }
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, resultSearch]);
  const customerChangeSearch = useCallback(
    (value) => {
      setKeySearchCustomer(value);
      if (value.length >= 3) {
        setSearchCustomer(true);
      } else {
        setSearchCustomer(false);
      }
      initQueryCustomer.request = value.trim();
      const handleSearch = () => {
        dispatch(
          CustomerSearchSo(initQueryCustomer, (response) => {
            setResultSearch(response);
          })
        );
        setSearchCustomer(false);
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRefCustomer, () => handleSearch());
    },
    [dispatch]
  );

  const searchCustomerSelect = useCallback(
    (value, o) => {
      let index: number = -1;
      index = resultSearch.findIndex(
        (customerResponse: CustomerResponse) =>
          customerResponse.id && customerResponse.id.toString() === value
      );
      if (index !== -1) {
        dispatch(
          getCustomerDetailAction(resultSearch[index].id, (data: CustomerResponse | null) => {
            if (data) {
              setCustomerID(data.id);
              setHadCustomer(true);
              warrantyForm.setFieldsValue({
                customer_id: data.id,
                customer: data.full_name,
                customer_mobile: data.phone,
                customer_address: data.full_address
                  ? data.full_address
                  : warrantyForm.getFieldValue("type") === WarrantyFormType.STORE
                  ? "Nhận tại cửa hàng"
                  : "",
              });
            }
          })
        );
        setKeySearchCustomer("");
      }
    },
    [dispatch, resultSearch, warrantyForm]
  );

  const disabledDate = (current: any) => {
    // Can not select days before today and today
    return current && current < moment().subtract(1, 'days');
  };

  const addItemsWarranty = useCallback(
    (item: any) => {
      let newWarrantyItems = [
        ...warrantyItems,
        {
          ...item,
          type: null,
          reason_id: null,
          price: 0,
          customer_fee: 0,
        },
      ];
      if (newWarrantyItems.length > 10) {
        showWarning("Phiếu bảo hành chỉ tối đa 10 sản phẩm");
      } else {
        newWarrantyItems = newWarrantyItems.map((i, index) => {
          return {
            ...i,
            index,
          };
        });
        setWarrantyItems(newWarrantyItems);
      }
    },
    [warrantyItems]
  );

  const onSearchVariantSelect = useCallback(
    (value) => {
      setKeySearchVariant("");
      // eslint-disable-next-line eqeqeq
      const indexSearch = resultSearchVariant.items.findIndex((s) => s.id == value);
      const item = resultSearchVariant.items[indexSearch];
      const itemWarranty = {
        sku: item.sku,
        variant_id: item.id,
        product_id: item.product.id,
        variant: item.name,
        variant_barcode: item.barcode,
        product_type: item.product.product_type,
        product_code: item.product.code,
      };
      addItemsWarranty(itemWarranty);
    },
    [addItemsWarranty, resultSearchVariant.items]
  );
  const deleteItemsWarranty = useCallback(
    (item: any) => {
      let newWarrantyItems = [...warrantyItems];
      newWarrantyItems.splice(item.index, 1);
      newWarrantyItems = newWarrantyItems.map((i, index) => {
        return {
          ...i,
          index,
        };
      });
      setWarrantyItems(newWarrantyItems);
    },
    [warrantyItems]
  );

  const onChangeItem = useCallback(
    (value, field, index) => {
      const newWarrantyItem = {
        ...warrantyItems[index],
        [field]: value,
      };
      const newWarrantyItems = [...warrantyItems];
      newWarrantyItems.splice(index, 1, newWarrantyItem);
      setWarrantyItems(newWarrantyItems);
    },
    [warrantyItems]
  );

  const columnsWarrantyItems: Array<ICustomTableColumType<any>> = React.useMemo(
    () => [
      {
        title: "Tên sản phẩm",
        key: "name",
        render: (item) => {
          return (
            <div className="inner">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
              >
                {item.sku}
              </Link>
              <br />
              <div className="productNameText" title={item.variant}>
                {item.variant}
              </div>
            </div>
          );
        },
        visible: true,
        width: 200,
      },
      {
        title: "Trạng thái",
        key: "type",
        render: (value: string, record: any) => {
          return (
            <CustomSelect
              allowClear
              optionFilterProp="children"
              showSearch
              showArrow
              notFoundContent="Không tìm thấy kết quả"
              placeholder="Loại bảo hành"
              getPopupContainer={(trigger) => trigger.parentNode}
              maxTagCount="responsive"
              value={record.type}
              onChange={(value) => onChangeItem(value, "type", record.index)}
              style={{ width: "100%" }}
              className={record.type ? "" : "non-select"}
            >
              <CustomSelect.Option
                key={"WARRANTY"}
                value={WarrantyItemTypeModel.WARRANTY}
                disabled={!record.finished_on}
              >
                Bảo hành
              </CustomSelect.Option>
              <CustomSelect.Option key={"REPAIR"} value={WarrantyItemTypeModel.REPAIR}>
                Sửa chữa
              </CustomSelect.Option>
            </CustomSelect>
          );
        },
        visible: true,
        width: 150,
      },
      {
        title: "Lý do",
        key: "reasons",
        render: (value: string, record: any) => {
          return (
            <CustomSelect
              allowClear
              optionFilterProp="children"
              showSearch
              showArrow
              notFoundContent="Không tìm thấy kết quả"
              placeholder="Lý do"
              getPopupContainer={(trigger) => trigger.parentNode}
              maxTagCount="responsive"
              value={record.reason_id}
              onChange={(value) => onChangeItem(value, "reason_id", record.index)}
              style={{ width: "100%" }}
              className={record.reason_id ? "" : "non-select"}
            >
              {/* <Option value="">Hình thức vận chuyển</Option> */}
              {reasons.map((reason) => (
                <CustomSelect.Option key={reason.id} value={reason.id}>
                  {reason.name}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          );
        },
        visible: true,
        width: 150,
      },
      {
        title: "Ngày mua",
        key: "purchase_date",
        render: (value: string, record: any) => {
          return record.finished_on ? (
            <div>{moment(record.finalized_on).format(DATE_FORMAT.fullDate)}</div>
          ) : (
            ""
          );
        },
        visible: true,
        align: "center",
        width: 130,
      },
      {
        title: "Ghi chú",
        key: "note",
        render: (value: string, record: any) => {
          return (
            <Input.TextArea
              placeholder="Ghi chú"
              value={record.note}
              onChange={(e) => onChangeItem(e.target.value, "note", record.index)}
            />
          );
        },
        visible: true,
        width: 150,
      },
      {
        title: "Phí thực tế",
        key: "price",
        render: (value: string, record: any) => {
          return (
            <NumberInput
              format={(a: string) => {
                return formatCurrencyInputValue(a);
              }}
              replace={(a: string) => replaceFormatString(a)}
              maxLength={8}
              minLength={0}
              onChange={(value) => onChangeItem(value, "price", record.index)}
            />
          );
        },
        visible: true,
        width: 120,
      },
      {
        title: "Phí báo khách",
        key: "customer_fee",
        render: (value: string, record: any) => {
          return (
            <NumberInput
              format={(a: string) => {
                return formatCurrencyInputValue(a);
              }}
              replace={(a: string) => replaceFormatString(a)}
              maxLength={8}
              minLength={0}
              onChange={(value) => onChangeItem(value, "customer_fee", record.index)}
            />
          );
        },
        visible: true,
        width: 120,
      },

      {
        // title: "Phí báo khách",
        key: "actions",
        render: (value: string, record: any) => {
          return (
            <Button
              onClick={() => deleteItemsWarranty(record)}
              style={{ color: "#E24343", marginBottom: 10 }}
              icon={<DeleteOutlined />}
              type="link"
              size="large"
            />
          );
        },
        visible: true,
        align: "center",
        width: 80,
      },
    ],
    [deleteItemsWarranty, onChangeItem, reasons]
  );

  const handleCreateCallback = (data: any) => {
    console.log("data", data);
    getPrintFormByWarrantyIdsService(data.id, "warranty").then((response) => {
      if (isFetchApiSuccessful(response)) {
        //xóa thẻ p thừa
        let textResponse = response.data[0].html_content;
        let result = textResponse.replaceAll("<p></p>", "");
        setPrintContent(result);
        handlePrint();
      } else {
        handleFetchApiError(response, "Lấy mẫu in", dispatch);
      }
    });
  };

  const handleSubmit = (values: any) => {
    if (warrantyItems.length) {
      let typeOK = true;
      let reasonIdOK = true;
      warrantyItems.forEach((item) => {
        !item.type && (typeOK = false);
        !item.reason_id && (reasonIdOK = false);
      });
      !typeOK && showError("Chọn trạng thái bảo hành");
      !reasonIdOK && showError("Chọn lý do bảo hành");
      if (typeOK && reasonIdOK) {
        const body = {
          ...values,
          line_items: warrantyItems.map((i) => {
            return {
              ...i,
              purchase_date: i.finished_on ? i.finished_on : null,
              expenses: [
                {
                  reason_id: i.reason_id,
                },
              ],
            };
          }),
        };
        console.log(body);
        setCreateLoading(true);
        dispatch(
          createWarrantyAction(body, (data: any) => {
            if (data) {
              showSuccess("Thêm mới bảo hành thành công");
              handleCreateCallback(data);
            }
            setCreateLoading(false);
          })
        );
      }
    } else {
      showError("Chọn sản phẩm bảo hành");
    }
  };

  useEffect(() => {
    dispatch(
      searchAccountPublicAction({ limit: 30 }, (data) => {
        setAccounts(data.items);
        setAccountData(data.items);
      })
    );
    dispatch(
      getWarrantyReasonsAction((data) =>
        setReasons(data.filter((reason) => reason.status === "ACTIVE"))
      )
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      <ContentContainer
        // isLoading={loadingData}
        title="Thêm mới phiếu bảo hành"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: `${UrlConfig.HOME}`,
          },
          {
            name: "Danh sách bảo hành",
            path: `${UrlConfig.WARRANTY}`,
          },
          {
            name: "Tạo mới",
          },
        ]}
      >
        <Form
          form={warrantyForm}
          ref={formRef}
          name="create_warranty"
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={initialFormValueWarranty}
        >
          <Row gutter={20}>
            <Col md={12}>
              <Card
                title="Khách hàng"
                style={{ height: 340 }}
                extra={
                  <>
                    {hadCustomer && (
                      <>
                        <Button
                          type="link"
                          onClick={() => setVisibleHistory(true)}
                          style={{ marginRight: 10, color: "#2A2A86" }}
                        >
                          Lịch sử mua hàng
                        </Button>
                        <CloseOutlined
                          onClick={() => {
                            setHadCustomer(false);
                            setWarrantyItems([]);
                          }}
                          style={{ marginRight: 5 }}
                        />
                      </>
                    )}

                    {/* {!hadCustomer && allowCreateCustomer && <>
                      <Tooltip title={"Thêm mới khách hàng"}>
                        <Link to={`${UrlConfig.CUSTOMER}/create`} target="_blank">
                          <Button
                            icon={<AiOutlinePlusCircle size={24} />}
                            type="link"
                          />
                        </Link>
                      </Tooltip>
                    </>} */}
                  </>
                }
              >
                {!hadCustomer && (
                  <AutoComplete
                    notFoundContent={
                      keySearchCustomer.length >= 3 ? "Không tìm thấy khách hàng" : undefined
                    }
                    id="search_customer"
                    value={keySearchCustomer}
                    ref={autoCompleteRefCustomer}
                    onSelect={searchCustomerSelect}
                    dropdownClassName="search-layout-customer dropdown-search-header"
                    dropdownMatchSelectWidth={456}
                    style={{ width: "100%" }}
                    onSearch={customerChangeSearch}
                    options={customerConvertResultSearch}
                    defaultActiveFirstOption
                  >
                    <Input
                      placeholder="Tìm khách hàng"
                      prefix={
                        searchCustomer ? (
                          <LoadingOutlined style={{ color: "#2a2a86" }} />
                        ) : (
                          <SearchOutlined style={{ color: "#ABB4BD" }} />
                        )
                      }
                    />
                  </AutoComplete>
                )}
                {hadCustomer && (
                  <>
                    <Form.Item name="customer_id" hidden></Form.Item>
                    <Form.Item name="customer">
                      <Input
                        readOnly
                        placeholder="Nhập tên người nhận *"
                        prefix={<UserOutlined style={{ color: "#71767B" }} />}
                      />
                    </Form.Item>
                    <Form.Item
                      name="customer_mobile"
                      rules={[
                        { required: true, message: "Nhập số điện thoại" },
                        {
                          pattern: RegUtil.PHONE,
                          message: "Số điện thoại chưa đúng định dạng",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Số điện thoại *"
                        prefix={<PhoneOutlined style={{ color: "#71767B" }} />}
                      />
                    </Form.Item>
                    <Form.Item
                      name="customer_address"
                      rules={[{ required: true, message: "Nhập địa chỉ" }]}
                    >
                      <Input
                        placeholder="Địa chỉ *"
                        prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                      />
                    </Form.Item>
                  </>
                )}
              </Card>
            </Col>
            <Col md={12}>
              <Card title="Thông tin bảo hành" style={{ height: 340 }}>
                <Form.Item
                  name="store_id"
                  rules={[{ required: true, message: "Chọn cửa hàng tiếp nhận bảo hành" }]}
                >
                  <CustomSelect
                    // mode="multiple"
                    showArrow
                    allowClear
                    showSearch
                    placeholder="Cửa hàng *"
                    notFoundContent="Không tìm thấy kết quả"
                    style={{
                      width: "100%",
                    }}
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {stores?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Form.Item>
                <Form.Item
                  name="assignee_code"
                  rules={[{ required: true, message: "Chọn nhân viên tiếp nhận bảo hành" }]}
                >
                  <AccountCustomSearchSelect
                    placeholder="Tìm theo họ tên hoặc mã nhân viên *"
                    dataToSelect={accountData}
                    setDataToSelect={setAccountData}
                    initDataToSelect={accounts}
                    // mode="multiple"
                    getPopupContainer={(trigger: any) => trigger.parentNode}
                    maxTagCount="responsive"
                  />
                </Form.Item>
                <Form.Item
                  name="appointment_date"
                  rules={[{ required: true, message: "Nhập ngày hẹn trả *" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Ngày hẹn trả"
                    format={"DD/MM/YYYY"}
                    disabledDate={disabledDate}
                    suffixIcon={<CalendarOutlined style={{ color: "#71767B", float: "left" }} />}
                    onMouseLeave={() => {
                      const elm = document.getElementById("create_warranty_appointment_date");
                      const newDate = elm?.getAttribute("value")
                        ? moment(elm?.getAttribute("value"), "DD/MM/YYYY")
                        : undefined;
                      if (newDate) {
                        formRef.current?.setFields([
                          {
                            name: "appointment_date",
                            value: newDate,
                            errors:
                              newDate < moment().subtract(1, 'days')
                                ? ["Ngày hẹn trả không được bé hơn ngày hiện tại"]
                                : [],
                          },
                        ]);
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="type"
                  rules={[{ required: true, message: "Chọn hình thức trả khách" }]}
                >
                  <CustomSelect
                    allowClear
                    optionFilterProp="children"
                    showSearch
                    showArrow
                    notFoundContent="Không tìm thấy kết quả"
                    placeholder="Hình thức trả khách *"
                    style={{ width: "100%" }}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    maxTagCount="responsive"
                    onSelect={(value: string) => {
                      if (
                        value === WarrantyFormType.STORE &&
                        warrantyForm.getFieldValue("customer_address") === ""
                      ) {
                        warrantyForm.setFieldsValue({
                          customer_address: "Nhận tại cửa hàng",
                        });
                      }
                    }}
                  >
                    <CustomSelect.Option key={"SHIPPING"} value={WarrantyFormType.SHIPPING}>
                      Giao trả hàng tận nhà khách
                    </CustomSelect.Option>
                    <CustomSelect.Option key={"STORE"} value={WarrantyFormType.STORE}>
                      Khách đến cửa hàng lấy
                    </CustomSelect.Option>
                  </CustomSelect>
                </Form.Item>
              </Card>
            </Col>
          </Row>
          <Row gutter={40}>
            <HistoryPurchaseModal
              visible={visibleHistory}
              customerID={customerID}
              onOk={() => setVisibleHistory(false)}
              onClick={(item) => addItemsWarranty(item)}
            />
            <Col md={24}>
              <Card
                title="Sản phẩm bảo hành"
                extra={[
                  <AutoComplete
                    notFoundContent={
                      keySearchVariant.length >= 3 ? "Không tìm thấy sản phẩm" : undefined
                    }
                    id="search_product"
                    value={keySearchVariant}
                    ref={autoCompleteRefProduct}
                    onSelect={onSearchVariantSelect}
                    dropdownClassName="search-layout dropdown-search-header"
                    dropdownMatchSelectWidth={456}
                    className="w-100"
                    onSearch={onChangeProductSearch}
                    options={convertResultSearchVariant}
                    maxLength={255}
                    defaultActiveFirstOption
                    dropdownRender={(menu) => <div>{menu}</div>}
                  >
                    <Input
                      size="middle"
                      className="yody-search"
                      placeholder="Tìm sản phẩm"
                      prefix={
                        searchProducts ? (
                          <LoadingOutlined style={{ color: "#2a2a86" }} />
                        ) : (
                          <SearchOutlined style={{ color: "#ABB4BD" }} />
                        )
                      }
                      style={{ width: 500 }}
                    />
                  </AutoComplete>,
                ]}
              >
                <CustomTable
                  bordered
                  // scroll={{ x: 1400 }}
                  sticky={{ offsetScroll: 10, offsetHeader: 55 }}
                  pagination={false}
                  dataSource={warrantyItems}
                  columns={columnsWarrantyItems}
                  rowKey={(item: any) => item.index}
                />
              </Card>
            </Col>
          </Row>
          <div style={{ display: "none" }}>
            <div className="printContent333" ref={printElementRef}>
              <div
                dangerouslySetInnerHTML={{
                  // __html: renderHtml(printerContentHtml()),
                  __html: purify.sanitize(printerContentHtml()),
                }}
              ></div>
            </div>
          </div>
          <div className="bottomBar">
            <Row>
              <Col offset={12} md={12} style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <Button
                    style={{ padding: "0 25px", marginRight: 20, fontWeight: 400 }}
                    onClick={() => history.push(`${UrlConfig.WARRANTY}`)}
                  >
                    Huỷ
                  </Button>
                  <Button
                    style={{ padding: "0 25px", fontWeight: 400 }}
                    type="primary"
                    htmlType="submit"
                    disabled={!hadCustomer || createLoading}
                    loading={createLoading}
                  >
                    Lưu và in
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </Form>
      </ContentContainer>
    </StyledComponent>
  );
}

export default CreateWarranty;
