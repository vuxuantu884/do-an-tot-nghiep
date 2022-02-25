import { Card, Input, Form, Button, Row, Divider, Col, FormInstance, Checkbox } from "antd";

import { MailFilled } from "@ant-design/icons";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AiOutlineClose } from "react-icons/ai";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";
import SupplierItem from "./../supplier-item";
import { Link } from "react-router-dom";
import { PurchaseAddress } from "model/purchase-order/purchase-address.model";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { POStatus } from "utils/Constants";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { RegUtil } from "utils/RegUtils";
import UrlConfig from "config/url.config";
import _ from "lodash";
import loadable from "@loadable/component";
import POSupplierAddress from "./POSupplierAddress";
import { EmailWrap } from "./index.style";

const SupplierAddModal = loadable(
  () => import("screens/products/supplier/modal/supplier-add-modal.screen")
);
const EditAddressModal = loadable(() => import("../../modal/edit-address"));

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
const POSupplierForm: React.FC<POSupplierFormProps> = (props: POSupplierFormProps) => {
  const {
    formMain,
    listCountries,
    listDistrict,
    isEdit,
    showBillingAddress = true,
    hideExpand,
    stepStatus,
  } = props;
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [data, setData] = useState<Array<SupplierResponse>>([]);
  const dispatch = useDispatch();
  const [isSendInvoice, setIsSendInvoice] = useState(!!hideExpand);
  const [isVisibleAddressModal, setVisibleAddressModal] = useState(false);
  const [isVisibleSupplierAddModal, setVisibleSupplierAddModal] = useState(false);
  const onResult = useCallback((result: PageResponse<SupplierResponse>) => {
    setLoadingSearch(false);
    setData(result.items);
  }, []);
  const [addressChange, setAddressChange] = useState<PurchaseAddress>();
  const [addressChangeType, setAddressChangeType] = useState<string>("");
  const [isSelectSupplier, setIsSelectSupplier] = useState<boolean>(isEdit);

  const debouncedSearchSupplier = React.useMemo(
    () =>
      _.debounce((keyword: string) => {
        setLoadingSearch(true);
        dispatch(SupplierSearchAction({ condition: keyword.trim(), status: "active" }, onResult));
      }, 300),
    [dispatch, onResult]
  );

  const onChangeKeySearchSupplier = (keyword: string) => {
    debouncedSearchSupplier(keyword);
  };

  const showEditAddressModal = (addressInfo: PurchaseAddress, type: string) => {
    setAddressChangeType(type);
    setAddressChange(addressInfo);
    setVisibleAddressModal(true);
  };

  const transformSupplier = (supplier: SupplierResponse) => {
    let address = supplier.addresses.find((address) => address.is_default);
    let contact = supplier.contacts.find((contact) => contact.is_default);

    let supplierAddress: PurchaseAddress = {
      tax_code: supplier?.tax_code,
      name: contact?.name,
      email: contact?.email,
      phone: contact?.phone,
      country_id: address?.country_id,
      country: address?.country,
      city_id: address?.city_id,
      city: address?.city,
      district_id: address?.district_id,
      district: address?.district,
      full_address: address?.address,
    };

    return supplierAddress;
  };

  const onSelect = (value: string) => {
    let index = data.findIndex((item) => item.id === +value);
    let supplier = data[index];
    const supplierAddress = transformSupplier(supplier);

    formMain.setFieldsValue({
      supplier_id: value,
      supplier: data[index].name,
      billing_address: supplierAddress,
      supplier_address: supplierAddress,
      phone: supplier.phone,
    });
    setIsSelectSupplier(true);
  };

  const removeSupplier = () => {
    formMain.setFieldsValue({
      supplier_id: undefined,
      supplier: null,
      billing_address: null,
      supplier_address: null,
      phone: null,
    });
    setIsSelectSupplier(false);
  };
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

  const cancelAddressModal = () => {
    setVisibleAddressModal(false);
  };
  const cancelSupplierAddModal = () => {
    setVisibleSupplierAddModal(false);
  };
  const onSubmitSupplierAddModal = (supplierItem: SupplierResponse) => {
    const supplierAddress = transformSupplier(supplierItem);

    formMain.setFieldsValue({
      supplier_id: supplierItem.id,
      supplier: supplierItem.name,
      billing_address: supplierAddress,
      supplier_address: supplierAddress,
      phone: supplierItem.phone,
    });
    setIsSelectSupplier(true);
    setVisibleSupplierAddModal(false);
  };

  const onSubmitAddressModal = (addressUpdate: PurchaseAddress) => {
    formMain.setFieldsValue({
      [addressChangeType]: addressUpdate,
    });

    setVisibleAddressModal(false);
  };

  const toggleSendInvoice = () => {
    setIsSendInvoice(!isSendInvoice);
  };

  return (
    <div className="supplier">
      <Card
        className="po-form"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN NHÀ CUNG CẤP</span>
          </div>
        }>
        <div>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.supplier_id !== curValues.supplier_id
            }
            className="margin-bottom-0">
            {({ getFieldValue }) => {
              let supplier_id = getFieldValue("supplier_id");
              let status = getFieldValue("status");
              let supplier = getFieldValue("supplier");
              let billing_address = getFieldValue("billing_address");
              let supplier_address = getFieldValue("supplier_address");

              return supplier_id ? (
                <div>
                  <Row align="middle">
                    <Link
                      to={`${UrlConfig.SUPPLIERS}/${supplier_id}`}
                      className="primary"
                      target="_blank"
                      style={{ fontSize: "16px", marginRight: 10 }}>
                      {supplier}
                    </Link>
                    {!isEdit && status === POStatus.DRAFT && (
                      <Button type="link" onClick={removeSupplier} icon={<AiOutlineClose />} />
                    )}
                  </Row>
                  <Divider />
                  {isSelectSupplier && showBillingAddress && (
                    <>
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
                      <POSupplierAddress
                        getFieldValue={getFieldValue}
                        field="billing_address"
                        onEdit={() => showEditAddressModal(billing_address, "billing_address")}
                      />
                      <Divider />
                      <div className="margin-top-bottom-10">
                        <Row>
                          <Checkbox
                            className="checkbox-style"
                            checked={isSendInvoice}
                            onChange={toggleSendInvoice}>
                            Gửi hóa đơn
                          </Checkbox>
                        </Row>
                      </div>
                      {isSendInvoice && (
                        <>
                          <Divider />
                          <POSupplierAddress
                            getFieldValue={getFieldValue}
                            field="supplier_address"
                            onEdit={() =>
                              showEditAddressModal(supplier_address, "supplier_address")
                            }
                          />
                          <Divider />
                          {isEdit ||
                          stepStatus === POStatus.COMPLETED ||
                          stepStatus === POStatus.FINISHED ? (
                            <EmailWrap>
                              <MailFilled />
                              <span className="label">
                                Email gửi hóa đơn:  {billing_address.email}
                              </span>
                            </EmailWrap>
                          ) : (
                            <EmailWrap>
                              <Row>
                                <Col span={12}>
                                  <Form.Item
                                    name={["billing_address", "email"]}
                                    label={
                                      <label>
                                        <MailFilled />
                                        <span className="label"> Email gửi hóa đơn</span>
                                      </label>
                                    }
                                    rules={[
                                      {
                                        required: true,
                                        pattern: RegUtil.EMAIL,
                                        message: "Vui lòng nhập đúng định dạng email",
                                      },
                                    ]}>
                                    <Input placeholder="Nhập email gửi hóa đơn" maxLength={255} />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </EmailWrap>
                          )}
                        </>
                      )}
                    </>
                  )}
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
                    ]}>
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
                  </Form.Item>
                </div>
              );
            }}
          </Form.Item>
        </div>
      </Card>

      <EditAddressModal
        visible={isVisibleAddressModal}
        listCountry={listCountries}
        listDistrict={listDistrict}
        onCancel={cancelAddressModal}
        onOk={onSubmitAddressModal}
        addressInfo={addressChange}
      />
      <SupplierAddModal
        visible={isVisibleSupplierAddModal}
        onCancel={cancelSupplierAddModal}
        onOk={onSubmitSupplierAddModal}
      />
    </div>
  );
};

export default POSupplierForm;
