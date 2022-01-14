import { Button, Card, Col, Form, Input, Radio, Row, Select, Space, Switch } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import SelectPaging from "component/custom/SelectPaging";
import { AppConfig } from "config/app.config";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";
import UrlConfig from "config/url.config";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { SupplierCreateAction, SupplierSearchAction } from "domain/actions/core/supplier.action";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { SupplierCreateRequest, SupplierResponse } from "model/core/supplier.model";
import { CollectionQuery, CollectionResponse } from "model/product/collection.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { getCollectionRequestAction } from "domain/actions/product/collection.action";
import CustomSelect from "component/custom/select.custom";
import _ from 'lodash';
import { searchAccountApi } from "service/accounts/account.service";
import { callApiNative } from "utils/ApiUtils";

const { Item } = Form;
const { Option } = Select;

const DefaultCountry = VietNamId;
const initRequest: SupplierCreateRequest = {
  bank_brand: "",
  bank_name: "",
  bank_number: "",
  beneficiary_name: "",
  certifications: [],
  debt_time: null,
  debt_time_unit: null,
  goods: [AppConfig.FASHION_INDUSTRY],
  person_in_charge: null,
  moq: null,
  note: "",
  name: "",
  scorecard: null,
  status: "active",
  tax_code: "",
  type: "",
  addresses: [
    {
      id: null,
      address: "",
      city_id: null,
      country_id: DefaultCountry,
      district_id: null,
      is_default: true,
      supplier_id: null,
    },
  ],
  contacts: [
    {
      id: null,
      name: "",
      email: "",
      fax: "",
      is_default: true,
      phone: "",
      website: "",
      supplier_id: null,
    },
  ],
  payments: [
    {
      id: null,
      name: "",
      beneficiary: "",
      brand: "",
      number: "",
      supplier_id: null,
    },
  ],
};

const CreateSupplierScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [formSupplier] = Form.useForm();
  const history = useHistory();
  const supplier_type = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type
  );
  const scorecards = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.scorecard
  );
  const date_unit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.date_unit
  );
  const moq_unit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.moq_unit
  );
  const supplier_status = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_status
  );
  // const account = useSelector(
  //   (state: RootReducerType) => state.userReducer?.account
  // );

  const [accounts, setAccounts] = React.useState<PageResponse<AccountResponse>>({
    items: [],
    metadata: {
      limit: 20,
      page: 1,
      total: 0,
    },
  });

  //State
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  const [type, setType] = useState(initRequest.type);
  const [allowCreateSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.CREATE],
    not: false,
  });
  const [data, setData] = useState<PageResponse<CollectionResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);

  const params: CollectionQuery = useParams() as CollectionQuery;

  const onChangeStatus = useCallback(
    (checked: boolean) => {
      setStatus(checked ? "active" : "inactive");
      formSupplier.setFieldsValue({
        status: checked ? "active" : "inactive",
      });
    },
    [formSupplier]
  );

  const onSelectDistrict = useCallback(
    (name: number, value: number) => {
      let cityId = -1;
      listDistrict.forEach((item) => {
        if (item.id === value) {
          cityId = item.city_id;
        }
      });
      if (cityId !== -1) {
        let addresses = formSupplier.getFieldValue("addresses");
        addresses[name].city_id = cityId;
        formSupplier.setFieldsValue({
          addresses: [...addresses],
        });
      }
    },
    [formSupplier, listDistrict]
  );

  const onCreateSuccess = useCallback(
    (data) => {
      if (!data) return;

      history.push(`${UrlConfig.SUPPLIERS}`);
    },
    [history]
  );
  const onFinish = useCallback(
    (values: SupplierCreateRequest) => {
      dispatch(SupplierCreateAction(values, onCreateSuccess));
    },
    [dispatch, onCreateSuccess]
  );
  //End callback
  //Memo
  const statusValue = useMemo(() => {
    if (!supplier_status) {
      return "";
    }
    let index = supplier_status.findIndex((item) => item.value === status);
    if (index !== -1) {
      return supplier_status[index].name;
    }
    return "";
  }, [status, supplier_status]);
  const getAccounts = useCallback(
    async (search: string, page: number) => {
      const response: PageResponse<AccountResponse> 
      = await callApiNative({isShowLoading:false}, dispatch, searchAccountApi, { info: search, department_ids: [AppConfig.WIN_DEPARTMENT], page: page });
      setAccounts(response || { items: [], metadata: {}});
    },
    [dispatch]
  );
  //end memo

  const onGetSuccess = useCallback((results: PageResponse<CollectionResponse>) => {
    if (results && results.items) {
      setData(results);
    }
  }, []);

  const validatePhone = (rule: any, value: any, callback: any): void => {
    if (value) {
      if (!RegUtil.PHONE.test(value)) {
        callback(`Số điện thoại không đúng định dạng`);
      } else {
        listSupplier.forEach((supplier: SupplierResponse) => {
          supplier?.contacts.forEach(contact => {
            if (contact?.phone === value) {
              callback(`Số điện thoại đã tồn tại`);
            }
          })
        })
        callback();
      }
    } else {
      callback();
    }
  };

  useEffect(() => {
    dispatch(getCollectionRequestAction(params, onGetSuccess));
    dispatch(SupplierSearchAction({limit: 200 },(response: PageResponse<SupplierResponse>)=> {
      if(response){
      setListSupplier(response.items)
    } else {
      setListSupplier([]);
    }
    }))
  }, [dispatch, onGetSuccess, params]);

  useEffect(() => {
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(DefaultCountry, setListDistrict));
    getAccounts("", 1);
  }, [dispatch, getAccounts, setListDistrict]);
  useEffect(() => {
    if (formSupplier && date_unit) {
      formSupplier.setFieldsValue({
        debt_time_unit: date_unit[0].value,
      });
    }
  }, [date_unit, formSupplier]);
  useEffect(() => {
    if (formSupplier && moq_unit) {
      formSupplier.setFieldsValue({
        moq_unit: moq_unit[0].value,
      });
    }
  }, [formSupplier, moq_unit]);
  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhà cung cấp",
          path: `${UrlConfig.SUPPLIERS}`,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <Form
        form={formSupplier}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initRequest}
        scrollToFirstError
      >
        <Row gutter={20}>
          <Col span={16}>
            <Card
              title="Thông tin cơ bản"
              key="info"
              extra={
                <Space size={15}>
                  <label className="text-default">Trạng thái</label>
                  <Switch
                    onChange={onChangeStatus}
                    className="ant-switch-success"
                    checked={status === "active"}
                  />
                  <label className={status === "active" ? "text-success" : "text-error"}>
                    {statusValue}
                  </label>
                  <Item noStyle name="status" hidden>
                    <Input />
                  </Item>
                </Space>
              }
            >
              <Row gutter={50}>
                <Col span={12}>
                  <Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại nhà cung cấp",
                      },
                    ]}
                    label="Loại nhà cung cấp"
                    name="type"
                  >
                    <Radio.Group
                      onChange={(e) => {
                        setType(e.target.value);
                      }}
                    >
                      {supplier_type?.map((item) => (
                        <Radio value={item.value} key={item.value}>
                          {item.name}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Item>
                </Col>
                <Col span={12}>
                  <Item label="Mã nhà cung cấp" name="code">
                    <Input disabled placeholder="Mã nhà cung cấp" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={12}>
                  <Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên nhà cung cấp",
                      },
                    ]}
                    name="name"
                    label="Tên nhà cung cấp"
                  >
                    <Input placeholder="Nhập tên nhà cung cấp" maxLength={255} />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item label="Phân cấp nhà cung cấp" name="scorecard">
                    <Select allowClear placeholder="Chọn phân cấp nhà cung cấp">
                      {scorecards?.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={12}>
                  <Form.Item
                    label="Nhân viên phụ trách"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn nhân viên phụ trách",
                      },
                    ]}
                    name="pic_code"
                  >
                    <SelectPaging
                      allowClear
                      placeholder="Nhân viên phụ trách"
                      searchPlaceholder={"Tìm kiếm nhân viên phụ trách"}
                      metadata={accounts.metadata}
                      onPageChange={(key, page) => {
                        getAccounts(key, page);
                      }}
                      onSearch={_.debounce((key) => {
                        getAccounts(key, 1);
                      }, 300)}
                    >
                      {accounts.items.map((value, index) => (
                        <SelectPaging.Option key={value.id} value={value.code}>
                          {value.code + " - " + value.full_name}
                        </SelectPaging.Option>
                      ))}
                    </SelectPaging>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="tax_code"
                    label="Mã số thuế"
                    rules={[
                      {
                        pattern: RegUtil.NUMBERREG,
                        message: "Mã số thuế chỉ được phép nhập số",
                      },
                      {
                        required: type === "enterprise",
                        message: "Nhà cung cấp là doanh nghiệp phải nhập mã số thuế",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập mã số thuế" maxLength={13} />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại" },
                      {
                        validator: validatePhone,
                      }
                    ]}
                  >
                    <Input
                      placeholder="Nhập số điện thoại"
                      maxLength={255}
                    />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="group_product"
                    label="Nhóm hàng"
                  >
                    <CustomSelect
                      showSearch
                      showArrow 
                      optionFilterProp="children"
                      placeholder="Chọn nhóm hàng"
                    >
                      {data?.items.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
            </Card>
            <Card title="Địa chỉ nhà cung cấp">
              <Form.List name="addresses">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                      <React.Fragment key={key}>
                        <Row gutter={50}>
                          <Col span={12}>
                            <Item
                              rules={[
                                {
                                  required: true,
                                  message: "Quốc gia không được để trống",
                                },
                              ]}
                              label="Quốc gia"
                              name={[name, "country_id"]}
                            >
                              <Select className="selector" placeholder="Chọn quốc gia">
                                {countries?.map((item) => (
                                  <Option key={item.id} value={item.id}>
                                    {item.name}
                                  </Option>
                                ))}
                              </Select>
                            </Item>
                          </Col>
                          <Col span={12}>
                            <Item label="Khu vực" name={[name, "district_id"]}>
                              <Select
                                showSearch
                                onSelect={(value: number) =>
                                  onSelectDistrict(name, value)
                                }
                                className="selector"
                                placeholder="Chọn khu vực"
                                optionFilterProp="children"
                              >
                                {listDistrict?.map((item) => (
                                  <Option key={item.id} value={item.id}>
                                    {item.city_name} - {item.name}
                                  </Option>
                                ))}
                              </Select>
                            </Item>
                            <Item hidden name={[name, "city_id"]}>
                              <Input />
                            </Item>
                          </Col>
                        </Row>
                        <Row gutter={50}>
                          <Col span={24}>
                            <Item
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập địa chỉ",
                                },
                              ]}
                              label="Địa chỉ"
                              name={[name, "address"]}
                            >
                              <Input placeholder="Nhập địa chỉ" maxLength={100} />
                            </Item>
                          </Col>
                        </Row>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </Form.List>
            </Card>
            <Card title="Chi tiết nhà cung cấp">
              <Row gutter={50}>
                <Col span={12}>
                  <Item label="Số lượng đặt hàng tối thiểu">
                    <Input.Group className="ip-group" compact>
                      <Item name="moq" noStyle>
                        <NumberInput
                          placeholder="Nhập số lượng"
                          isFloat
                          style={{ width: "70%" }}
                        />
                      </Item>
                      <Item name="moq_unit" noStyle>
                        <Select className="selector-group" style={{ width: "30%" }}>
                          {moq_unit?.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      </Item>
                    </Input.Group>
                  </Item>
                </Col>
                <Col span={12}>
                  <Item label="Thời gian công nợ">
                    <Input.Group className="ip-group" compact>
                      <Item name="debt_time" noStyle>
                        {/* <Input
                        placeholder="Nhập thời gian công nợ"
                        style={{ width: "70%" }}
                        className="ip-text-group"
                        onFocus={(e) => e.target.select()}
                      /> */}
                        <NumberInput
                          isFloat
                          style={{ width: "70%" }}
                          placeholder="Nhập thời gian công nợ"
                        />
                      </Item>
                      <Item name="debt_time_unit" noStyle>
                        <Select
                          className="selector-group"
                          defaultActiveFirstOption
                          style={{ width: "30%" }}
                        >
                          {date_unit?.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      </Item>
                    </Input.Group>
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24}>
                  <Item label="Ghi chú" name="note">
                    <Input.TextArea
                      style={{ height: 105 }}
                      placeholder="Nhập ghi chú"
                      maxLength={500}
                    />
                  </Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Thông tin liên hệ">
              <Form.List name="contacts">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                      <React.Fragment key={key}>
                        <Row>
                          <Col span={24}>
                            <Item name={[name, "name"]} label="Tên người liên hệ">
                              <Input
                                placeholder="Nhập tên người liên hệ"
                                maxLength={255}
                              />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item
                              name={[name, "position"]}
                              label="Chức vụ"
                            >
                              <Input
                                placeholder="Nhập chức vụ"
                                maxLength={255}
                              />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item
                              name={[name, "phone"]}
                              label="Số điện thoại"
                              rules={[
                                { required: true, message: "Vui lòng nhập số điện thoại" },
                                {
                                  validator: validatePhone,
                                }
                              ]}
                            >
                              <Input
                                placeholder="Nhập số điện thoại liên hệ"
                                maxLength={255}
                              />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item name={[name, "fax"]} label="Fax">
                              <Input
                                placeholder="Nhập số fax liên hệ"
                                maxLength={255}
                              />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item name={[name, "email"]} label="Email">
                              <Input placeholder="Nhập email" maxLength={255} />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item
                              label="Website"
                              name="website"
                              rules={[
                                {
                                  pattern: RegUtil.WEBSITE_URL,
                                  message: "Website chưa đúng định dạng",
                                },
                              ]}
                            >
                              <Input placeholder="Nhập website" maxLength={255} />
                            </Item>
                          </Col>
                        </Row>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </Form.List>
            </Card>
            <Card title="Thông tin thanh toán">
              <Form.List name="payments">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                      <React.Fragment key={key}>
                        <Row>
                          <Col span={24}>
                            <Item label="Ngân hàng" name={[name, "name"]}>
                              <Input maxLength={255} />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item name={[name, "brand"]} label="Chi nhánh">
                              <Input maxLength={255} />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item label="Số tài khoản" name={[name, "number"]}>
                              <Input placeholder="Nhập số tài khoản" maxLength={255} />
                            </Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Item name={[name, "beneficiary"]} label="Người thụ hưởng">
                              <Input placeholder="Nhập chủ tài khoản" maxLength={255} />
                            </Item>
                          </Col>
                        </Row>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>
        <BottomBarContainer
          back="Quay lại danh sách"
          rightComponent={
            allowCreateSup && (
              <Button htmlType="submit" type="primary">
                Tạo nhà cung cấp
              </Button>
            )
          }
        />
      </Form>
    </ContentContainer>
  );
};

export default CreateSupplierScreen;
