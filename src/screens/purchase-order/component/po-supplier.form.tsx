import {
  Space,
  Card,
  Input,
  Form,
  Button,
  Avatar,
  Row,
  Divider,
  Col,
  FormInstance,
  Checkbox,
} from "antd";

import {
  EnvironmentFilled,
  PhoneFilled,
  PhoneOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import React, { useCallback, useMemo, useState, Fragment } from "react";
import { useDispatch } from "react-redux";
import { AiOutlineClose } from "react-icons/ai";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";
import SupplierItem from "./supplier-item";
import avatarDefault from "assets/icon/user.svg";
import addressIcon from "assets/img/user-pin.svg";
import noteCustomer from "assets/img/note-customer.svg";
import { Link } from "react-router-dom";
import { PurchaseAddress } from "model/purchase-order/purchase-address.model";
import EditAddressModal from "../modal/edit-address";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { AddressType, POStatus } from "utils/Constants";
import SupplierAddModal from "screens/products/supplier/modal/supplier-add-modal.screen";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { RegUtil } from "utils/RegUtils";
import UrlConfig from "config/url.config";
import _ from "lodash";

type POSupplierFormProps = {
  listCountries: Array<CountryResponse>;
  listDistrict: Array<DistrictResponse>;
  formMain: FormInstance;
  isEdit: boolean;
  showBillingAddress: boolean;
  showSupplierAddress: boolean;
  hideExpand?: boolean;
  stepStatus?: string;
};
const POSupplierForm: React.FC<POSupplierFormProps> = (
  props: POSupplierFormProps
) => {
  const {
    formMain,
    listCountries,
    listDistrict,
    isEdit,
    showBillingAddress,
    showSupplierAddress,
    hideExpand,
    stepStatus,
  } = props;
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [data, setData] = useState<Array<SupplierResponse>>([]);
  const dispatch = useDispatch();
  const [visibleSupplierAddress, setVisibleSupplierAddress] = useState(
    hideExpand ? true : false
  );
  const [isVisibleAddressModal, setVisibleAddressModal] = useState(false);
  const [isVisibleSupplierAddModal, setVisibleSupplierAddModal] =
    useState(false);
  const onResult = useCallback((result: PageResponse<SupplierResponse>) => {
    setLoadingSearch(false);
    setData(result.items);
  }, []);
  const [addressChange, setAddressChange] = useState<PurchaseAddress>();
  const [addressChangeType, setAddressChangeType] = useState<string>("");
  const [isSelectSupplier, setIsSelectSupplier] = useState<boolean>(isEdit);


  const debouncedSearchSupplier = React.useMemo(() =>
    _.debounce((keyword: string) => {
      setLoadingSearch(true);
      dispatch(
        SupplierSearchAction({ condition: keyword.trim(), status: "active" }, onResult)
      );
    }, 300),
    [dispatch, onResult]
  )

  const onChangeKeySearchSupplier = useCallback(
    (keyword: string) => {
      debouncedSearchSupplier(keyword)
    },
    [debouncedSearchSupplier]
  )

  const ShowEditAddressModal = useCallback(
    (addressInfo: PurchaseAddress, type: string) => {
      setAddressChangeType(type);
      setAddressChange(addressInfo);
      setVisibleAddressModal(true);
    },
    []
  );

  const onSelect = useCallback(
    (value: string) => {
      let index = data.findIndex((item) => item.id.toString() === value);
      var supplier = data[index];
      let indexAddress = supplier.addresses.findIndex(address => address.is_default);
      let indexContact = supplier.contacts.findIndex(contact => contact.is_default);
      let supplierAddress: PurchaseAddress = {
        tax_code:  supplier.tax_code,
        name: indexContact !== -1 ? supplier.contacts[indexContact].name : '',
        email: indexContact !== -1 ? supplier.contacts[indexContact].email : '',
        phone: indexContact !== -1 ? supplier.contacts[indexContact].phone : '',
        country_id: indexAddress !== -1 ? supplier.addresses[indexAddress].country_id : undefined,
        country: indexAddress !== -1 ? supplier.addresses[indexAddress].country : '',
        city_id: indexAddress !== -1 ? supplier.addresses[indexAddress].city_id : undefined,
        city: indexAddress !== -1 ? supplier.addresses[indexAddress].city : '',
        district_id: indexAddress !== -1 ? supplier.addresses[indexAddress].district_id : undefined,
        district: indexAddress !== -1 ? supplier.addresses[indexAddress].district : '',
        full_address: indexAddress !== -1 ? supplier.addresses[indexAddress].address : '',
      };
      formMain.setFieldsValue({
        supplier_id: value,
        supplier: data[index].name,
        billing_address: supplierAddress,
        supplier_address: supplierAddress,
        phone: supplier.phone,
      });
      setIsSelectSupplier(true);
    },
    [data, formMain]
  );
  const removeSupplier = useCallback(() => {
    formMain.setFieldsValue({
      supplier_id: undefined,
      supplier: null,
      billing_address: null,
      supplier_address: null,
      phone: null,
    });
    setIsSelectSupplier(false);
  }, [formMain]);
  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: SupplierResponse, index: number) => {
      options.push({
        label: <SupplierItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });

    return options;
  }, [data]);

  const CancelAddressModal = useCallback(() => {
    setVisibleAddressModal(false);
  }, []);
  const CancelSupplierAddModal = useCallback(() => {
    setVisibleSupplierAddModal(false);
  }, []);
  const OkSupplierAddModal = useCallback(
    (supplierItem: SupplierResponse) => {
      let indexAddress = supplierItem.addresses.findIndex(address => address.is_default);
      let indexContact = supplierItem.contacts.findIndex(contact => contact.is_default);
      let supplierAddress: PurchaseAddress = {
        tax_code: supplierItem.tax_code,
        name: indexContact !== -1 ? supplierItem.contacts[indexContact].name : '',
        email: indexContact !== -1 ? supplierItem.contacts[indexContact].email : '',
        phone: indexContact !== -1 ? supplierItem.contacts[indexContact].phone : '',
        country_id: indexAddress !== -1 ? supplierItem.addresses[indexAddress].country_id : undefined,
        country: indexAddress !== -1 ? supplierItem.addresses[indexAddress].country : '',
        city_id: indexAddress !== -1 ? supplierItem.addresses[indexAddress].city_id : undefined,
        city: indexAddress !== -1 ? supplierItem.addresses[indexAddress].city : '',
        district_id: indexAddress !== -1 ? supplierItem.addresses[indexAddress].district_id : undefined,
        district: indexAddress !== -1 ? supplierItem.addresses[indexAddress].district : '',
        full_address: indexAddress !== -1 ? supplierItem.addresses[indexAddress].address : '',
      };
      formMain.setFieldsValue({
        supplier_id: supplierItem.id,
        supplier: supplierItem.name,
        billing_address: supplierAddress,
        supplier_address: supplierAddress,
        phone: supplierItem.phone,
      });
      setIsSelectSupplier(true);
      setVisibleSupplierAddModal(false);
    },
    [formMain]
  );

  const OkAddressModal = useCallback(
    (addressUpdate: PurchaseAddress, addressType: string) => {
      if (addressType === AddressType.SUPPLIERADDRESS) {
        formMain.setFieldsValue({
          supplier_address: addressUpdate,
        });
      }
      if (addressType === AddressType.BILLADDRESS) {
        formMain.setFieldsValue({
          billing_address: addressUpdate,
        });
      }
      setVisibleAddressModal(false);
    },
    [formMain]
  );

  const changeVisibleSupplierAddress = () => {
    setVisibleSupplierAddress(!visibleSupplierAddress);
  };
  return (
    <div className="supplier">
      <Card
        className="po-form"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN NHÀ CUNG CẤP</span>
          </div>
        }
      >
        <div>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.supplier_id !== curValues.supplier_id
            }
            className="margin-bottom-0"
          >
            {({ getFieldValue }) => {
              let supplier_id = getFieldValue("supplier_id");
              let phone = getFieldValue("phone");
              let status: string = getFieldValue("status");
              let supplier: string = getFieldValue("supplier");
              return supplier_id ? (
                <div>
                  <Row
                    align="middle"
                    justify="space-between"
                  >
                    <Space>
                      <Avatar src={avatarDefault} />
                      <Link
                        to={`${UrlConfig.SUPPLIERS}/${supplier_id}`}
                        className="primary"
                        target="_blank"
                        style={{ fontSize: "16px" }}
                      >
                        {supplier}
                      </Link>
                      {!isEdit && status === POStatus.DRAFT && (
                        <Button
                          className="icon-information-delete"
                          onClick={removeSupplier}
                          icon={<AiOutlineClose />}
                        />
                      )}
                      <PhoneOutlined />
                      <label>{phone}</label>
                    </Space>
                  </Row>
                  <Divider
                    style={{ padding: 0, marginTop: 10, marginBottom: 0 }}
                  />
                </div>
              ) : (
                <div>
                  <Form.Item
                    name="supplier_item"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn nhà cung cấp",
                      },
                    ]}
                  >
                    <CustomAutoComplete
                      loading={loadingSearch}
                      dropdownClassName="supplier"
                      placeholder="Tìm kiếm nhà cung cấp"
                      onSearch={onChangeKeySearchSupplier}
                      dropdownMatchSelectWidth={456}
                      style={{ width: "100%" }}
                      showAdd={true}
                      onClickAddNew={() => setVisibleSupplierAddModal(true)}
                      textAdd="Thêm mới nhà cung cấp"
                      onSelect={onSelect}
                      options={renderResult}
                    />
                    {/* <div className="ant-form-item-explain ant-form-item-explain-error">
                    <div role="alert">Vui lòng chọn Merchandiser</div>
                  </div>  */}
                  </Form.Item>
                </div>
              );
            }}
          </Form.Item>
        </div>
        {isSelectSupplier === true && (
          <div>
            <Form.Item hidden name="supplier_id">
              <Input />
            </Form.Item>
            <Form.Item hidden name="supplier">
              <Input />
            </Form.Item>
            <Form.Item hidden name="phone">
              <Input />
            </Form.Item>
            <Form.Item hidden name="billing_address">
              <Input />
            </Form.Item>
            <Form.Item hidden name="supplier_address">
              <Input />
            </Form.Item>

            <div>
              {showBillingAddress && (
                <Row gutter={24}>
                  <Col
                    xs={24}
                    lg={12}
                    style={{
                      borderRight: "1px solid #E5E5E5",
                    }}
                    className="font-weight-500 customer-info-left"
                  >
                    <Form.Item
                      className="margin-bottom-0"
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.supplier_id !== null &&
                        curValues.supplier_id !== null &&
                        prevValues.supplier_id !== undefined &&
                        curValues.supplier_id !== undefined
                      }
                    >
                      {({ getFieldValue }) => {
                        let supplier_id = getFieldValue("supplier_id");
                        let billing_address: PurchaseAddress =
                          getFieldValue("billing_address");

                        return supplier_id ? (
                          <div className="padding-top-20">
                            <div className="title-address">
                              Địa chỉ nhận hóa đơn :
                            </div>
                            <Row className="customer-row-info">
                              <span style={{ fontWeight: 500 }}>
                                <img
                                  src={addressIcon}
                                  alt=""
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                  }}
                                />{" "}
                                {billing_address.name !== null
                                  ? billing_address.name
                                  : "---"}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <span>
                                <PhoneFilled />{" "}
                                {billing_address.phone !== ""
                                  ? billing_address.phone
                                  : "---"}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <span>
                                <EnvironmentFilled />{" "}
                                {billing_address.full_address !== ""
                                  ? billing_address.full_address
                                  : "---"}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <span>
                                {billing_address.country !== ""
                                  ? billing_address.country
                                  : ""}
                                {billing_address.city !== null
                                  ? " - " + billing_address.city
                                  : ""}
                                {billing_address.district !== null
                                  ? " - " + billing_address.district
                                  : ""}
                                {billing_address.ward !== null &&
                                  billing_address.ward !== undefined
                                  ? " - " + billing_address.ward
                                  : ""}
                              </span>
                            </Row>
                            <Row>
                              <Button
                                icon={<PlusOutlined />}
                                type="link"
                                style={{
                                  padding: 0,
                                  color: "#5d5d8a",
                                  margin: 0,
                                  fontWeight: 400,
                                  fontSize: '14px',
                                }}
                                onClick={() =>
                                  ShowEditAddressModal(
                                    billing_address,
                                    AddressType.BILLADDRESS
                                  )
                                }
                              >
                                Thay đổi địa chỉ nhận hóa đơn
                              </Button>
                            </Row>
                          </div>
                        ) : null;
                      }}
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    lg={12}
                    className="font-weight-500"
                    style={{ paddingLeft: "34px", marginTop: "14px" }}
                  >
                    {isEdit || (stepStatus === POStatus.COMPLETED || stepStatus === POStatus.FINISHED) ? (
                      <div>
                        <Form.Item
                          shouldUpdate={(prevValues, curValues) =>
                            prevValues.billing_address !==
                            curValues.billing_address
                          }
                          label={
                            <label className="title-address">
                              <img
                                src={noteCustomer}
                                alt=""
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  marginRight: "10px",
                                }}
                              />
                              Email gửi hóa đơn
                            </label>
                          }
                        >
                          {({ getFieldValue }) => {
                            let billing_address: PurchaseAddress =
                              getFieldValue("billing_address");
                            return (
                              <div
                                style={{
                                  color: "#666666",
                                  fontWeight: 400,
                                  fontSize: 14,
                                }}
                              >
                                {billing_address?.email}
                              </div>
                            );
                          }}
                        </Form.Item>
                      </div>
                    ) : (
                      <Form.Item
                        name={["billing_address", "email"]}
                        label={
                          <label className="title-address">
                            <img
                              src={noteCustomer}
                              alt=""
                              style={{
                                width: "20px",
                                height: "20px",
                                marginRight: "10px",
                              }}
                            />
                            Email gửi hóa đơn
                          </label>
                        }
                        rules={[
                          {
                            pattern: RegUtil.EMAIL,
                            message: "Vui lòng nhập đúng định dạng email",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Điền email"
                          maxLength={255}
                          style={{ marginTop: "10px" }}
                        />
                      </Form.Item>
                    )}
                    {isEdit || (stepStatus === POStatus.COMPLETED || stepStatus === POStatus.FINISHED) ? (
                      <div>
                        <Form.Item hidden name="supplier_note" noStyle>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={
                            <label className="title-address">
                              <img
                                src={noteCustomer}
                                alt=""
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  marginRight: "10px",
                                }}
                              />
                              Ghi chú của nhà cung cấp
                            </label>
                          }
                          shouldUpdate={(prevValue, currentValue) =>
                            prevValue.supplier_note !==
                            currentValue.supplier_note
                          }
                        >
                          {({ getFieldValue }) => {
                            let supplier_note = getFieldValue("supplier_note");
                            return (
                              <div
                                style={{
                                  color: "#666666",
                                  fontWeight: 400,
                                  fontSize: 14,
                                }}
                              >
                                {supplier_note !== ""
                                  ? supplier_note
                                  : "Không có ghi chú"}
                              </div>
                            );
                          }}
                        </Form.Item>
                      </div>
                    ) : (
                      <Form.Item
                        name="supplier_note"
                        label={
                          <label className="title-address">
                            <img
                              src={noteCustomer}
                              alt=""
                              style={{
                                width: "20px",
                                height: "20px",
                                marginRight: "10px",
                              }}
                            />
                            Ghi chú của nhà cung cấp
                          </label>
                        }
                      >
                        <Input.TextArea
                          placeholder="Điền ghi chú"
                          rows={4}
                          maxLength={500}
                          style={{ marginTop: "10px" }}
                        />
                      </Form.Item>
                    )}
                  </Col>
                </Row>
              )}
              {!hideExpand && (
                <Fragment>
                  <Divider style={{ padding: 0, margin: 0 }} />
                  <div className="margin-top-bottom-10">
                    <Row>
                      <Checkbox
                        className="checkbox-style"
                        checked={visibleSupplierAddress}
                        onChange={changeVisibleSupplierAddress}
                      >
                        Thêm thông tin xuất hàng
                      </Checkbox>
                    </Row>
                  </div>
                </Fragment>
              )}
              {showSupplierAddress && visibleSupplierAddress && (
                <Row gutter={24}>
                  <Col
                    xs={24}
                    lg={12}
                    style={{
                      paddingTop: "14px",
                    }}
                    className="font-weight-500"
                  >
                    <Form.Item
                      className="margin-bottom-0"
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.supplier_id !== null &&
                        curValues.supplier_id !== null &&
                        prevValues.supplier_id !== undefined &&
                        curValues.supplier_id !== undefined
                      }
                    >
                      {({ getFieldValue }) => {
                        let supplier_id = getFieldValue("supplier_id");
                        let supplier_address: PurchaseAddress =
                          getFieldValue("supplier_address");

                        return supplier_id && (
                          <div>
                            <div className="title-address">
                              Địa chỉ xuất hàng :
                            </div>
                            <Row className="customer-row-info">
                              <span style={{ fontWeight: 500 }}>
                                <img
                                  src={addressIcon}
                                  alt=""
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                  }}
                                />{" "}
                                {supplier_address.name !== null
                                  ? supplier_address.name
                                  : "--"}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <span>
                                <PhoneFilled />{" "}
                                {supplier_address.phone !== ""
                                  ? supplier_address.phone
                                  : "---"}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <span>
                                <EnvironmentFilled />{" "}
                                {supplier_address.full_address !== ""
                                  ? supplier_address.full_address
                                  : "---"}
                              </span>
                            </Row>
                            <Row className="customer-row-info">
                              <span>
                                {supplier_address.country !== ""
                                  ? supplier_address.country
                                  : ""}
                                {supplier_address.city !== null
                                  ? " - " + supplier_address.city
                                  : ""}
                                {supplier_address.district !== null
                                  ? " - " + supplier_address.district
                                  : ""}
                                {supplier_address.ward !== null &&
                                  supplier_address.ward !== undefined
                                  ? " - " + supplier_address.ward
                                  : ""}
                              </span>
                            </Row>
                            <Button
                              icon={<PlusOutlined />}
                              type="link"
                              style={{
                                padding: 0,
                                color: "#5d5d8a",
                                margin: 0,
                                fontWeight: 400,
                                fontSize: '14px',
                              }}
                              onClick={() =>
                                ShowEditAddressModal(
                                  supplier_address,
                                  AddressType.SUPPLIERADDRESS
                                )
                              }
                            >
                              Thay đổi địa chỉ xuất hàng
                            </Button>
                          </div>
                        );
                      }}
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </div>
          </div>
        )}
      </Card>

      <EditAddressModal
        visible={isVisibleAddressModal}
        listCountry={listCountries}
        listDistrict={listDistrict}
        onCancel={CancelAddressModal}
        onOk={OkAddressModal}
        addressInfo={addressChange}
        addressType={addressChangeType}
      />
      <SupplierAddModal
        visible={isVisibleSupplierAddModal}
        onCancel={CancelSupplierAddModal}
        onOk={OkSupplierAddModal}
      />
    </div>
  );
};

export default POSupplierForm;
