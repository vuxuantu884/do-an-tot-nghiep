import {
  Button,
  Card,
  Col,
  Space,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  Switch,
  Divider,
  Collapse,
} from "antd";
import { AccountSearchAction } from "domain/actions/account/account.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { SupplierCreateAction } from "domain/actions/core/supplier.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { SupplierCreateRequest } from "model/core/supplier.model";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { AppConfig } from "config/AppConfig";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { RegUtil } from "utils/RegUtils";
import NumberInput from "component/custom/number-input.custom";
import { VietNamId } from "utils/Constants";

const { Item } = Form;
const { Option } = Select;

const DefaultCountry = VietNamId;
const initRequest: SupplierCreateRequest = {
  address: "",
  bank_brand: "",
  bank_name: "",
  bank_number: "",
  beneficiary_name: "",
  certifications: [],
  city_id: null,
  country_id: DefaultCountry,
  contact_name: "",
  debt_time: null,
  debt_time_unit: null,
  district_id: null,
  website: null,
  email: "",
  fax: "",
  goods: [],
  person_in_charge: null,
  moq: null,
  note: "",
  name: "",
  phone: "",
  scorecard: null,
  status: "active",
  tax_code: "",
  type: "",
};
const CreateSupplierScreen: React.FC = () => {
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [formSupplier] = Form.useForm();
  const history = useHistory();
  const supplier_type = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type
  );
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
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
  const currentUserCode = useSelector(
    (state: RootReducerType) => state.userReducer?.account?.code
  );

  //State
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  //EndState
  //Callback
  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse>|false) => {
      if(!data) {
        return false;
      }
      let listWinAccount = data.items;
      setAccounts(listWinAccount);
      let checkUser = listWinAccount.findIndex(
        (val) => val.code === currentUserCode
      );
      if (checkUser !== -1 && currentUserCode !== undefined) {
        formSupplier.setFieldsValue({
          person_in_charge: currentUserCode,
        });
      }
    },
    [currentUserCode, formSupplier]
  );

  const onChangeStatus = useCallback(
    (checked: boolean) => {
      setStatus(checked ? "active" : "inactive");
      formRef.current?.setFieldsValue({
        status: checked ? "active" : "inactive",
      });
    },
    [formRef]
  );

  const onSelectDistrict = useCallback(
    (value: number) => {
      
      let cityId = -1;
      listDistrict.forEach((item) => {
        if (item.id === value) {
          cityId = item.city_id;
        }
      });
      if (cityId !== -1) {
        formSupplier.setFieldsValue({
          city_id: cityId,
        });
      }
    },
    [formSupplier, listDistrict]
  );
  const onCreateSuccess = useCallback(() => {
    history.push(`${UrlConfig.SUPPLIERS}`);
  }, [history]);
  const onFinish = useCallback(
    (values: SupplierCreateRequest) => {
      
      dispatch(SupplierCreateAction(values, onCreateSuccess));
    },
    [dispatch, onCreateSuccess]
  );
  const onCancel = useCallback(() => history.goBack(), [history]);
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
  //end memo
  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT] },
        setDataAccounts
      )
    );
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(DefaultCountry, setListDistrict));
  }, [dispatch, setDataAccounts, setListDistrict]);
  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
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
        <Card
          title="Thông tin cơ bản"
          key="info"
          extra={
            <Space size={15}>
              <label className="text-default">Trạng thái</label>
              <Switch
                onChange={onChangeStatus}
                className="ant-switch-success"
                defaultChecked
              />
              <label
                className={status === "active" ? "text-success" : "text-error"}
              >
                {statusValue}
              </label>
              <Item noStyle name="status" hidden>
                <Input value={status} />
              </Item>
            </Space>
          }
        >
          <div className="padding-20">
            <Row>
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
                <Radio.Group>
                  {supplier_type?.map((item) => (
                    <Radio value={item.value} key={item.value}>
                      {item.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </Item>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item label="Mã nhà cung cấp" name="code">
                  <Input disabled placeholder="Mã nhà cung cấp" />
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
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
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  rules={[
                    { required: true, message: "Vui lòng chọn ngành hàng" },
                  ]}
                  name="goods"
                  label="Ngành hàng"
                >
                  <Select
                    mode="multiple"
                    className="selector"
                    placeholder="Chọn ngành hàng"
                    showArrow
                    // defaultValue="fashion"
                  >
                    {goods?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọ nhân viên phụ trách",
                    },
                  ]}
                  name="person_in_charge"
                  label="Nhân viên phụ trách"
                >
                  <Select
                    placeholder="Chọn nhân viên phụ trách"
                    className="selector"
                    // defaultValue={personInCharge}
                  >
                    {accounts.map((item) => (
                      <Option key={item.code} value={item.code}>
                        {item.full_name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
            <Divider orientation="left">Thông tin khác</Divider>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item label="Quốc gia" name="country_id">
                  <Select
                    disabled
                    className="selector"
                    placeholder="Chọn quốc gia"
                  >
                    {countries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="contact_name" label="Người liên hệ">
                  <Input placeholder="Nhập người liên hệ" maxLength={255} />
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item label="Khu vực" name="district_id">
                  <Select
                    showSearch
                    onSelect={onSelectDistrict}
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
                <Item hidden name="city_id">
                  <Input />
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: RegUtil.PHONE,
                      message: "Số điện thoại chưa đúng định dạng",
                    },
                  ]}
                  name="phone"
                  label="Số điện thoại"
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item label="Địa chỉ" name="address">
                  <Input placeholder="Nhập địa chỉ" maxLength={100} />
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  name="email"
                  label="Nhập email"
                  rules={[
                    {
                      pattern: RegUtil.EMAIL,
                      message: "Email chưa đúng định dạng",
                    },
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
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
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  name="tax_code"
                  label="Mã số thuế"
                  rules={[
                    {
                      pattern: RegUtil.NUMBERREG,
                      message: "Mã số thuế chỉ được phép nhập số",
                    },
                  ]}
                >
                  <Input placeholder="Nhập mã số thuế" maxLength={13} />
                </Item>
              </Col>
            </Row>
          </div>
        </Card>
        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
          <Collapse.Panel key="1" header="Chi tiết nhà cung cấp">
            <div className="padding-20">
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item label="Phân cấp nhà cung cấp" name="scorecard">
                    <Select
                      className="selector"
                      placeholder="Chọn phân cấp nhà cung cấp"
                    >
                      {scorecards?.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
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
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Chứng chỉ"
                    name="certifications"
                    help={
                      <div className="t-help">
                        Tối đa 1 files (doc, pdf, png, jpeg, jpg) và dung lượng
                        tối đa 3 MB
                      </div>
                    }
                  >
                    <Input multiple type="file" placeholder="Tên danh mục" />
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item label="Số lượng đặt hàng tối thiểu">
                    <Input.Group className="ip-group" compact>
                      <Item name="moq" noStyle>
                        {/* <Input
                          placeholder="Nhập số lượng"
                          style={{ width: "70%" }}
                          className="ip-text-group"
                          onFocus={(e) => e.target.select()}
                        /> */}
                        <NumberInput
                          placeholder="Nhập số lượng"
                          isFloat
                          style={{ width: "70%" }}
                        />
                      </Item>
                      <Item name="moq_unit" noStyle>
                        <Select
                          className="selector-group"
                          style={{ width: "30%" }}
                        >
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
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={16} md={24} sm={24}>
                  <Item label="Ghi chú" name="note">
                    <Input placeholder="Nhập ghi chú" maxLength={255} />
                  </Item>
                </Col>
              </Row>
            </div>
          </Collapse.Panel>
        </Collapse>
        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
          <Collapse.Panel key="1" header="Thông tin giá">
            <div className="padding-20">
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item label="Ngân hàng" name="bank_name">
                    <Input placeholder="Nhập ngân hàng" maxLength={255} />
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item name="bank_brand" label="Chi nhánh">
                    <Input placeholder="Nhập chi nhánh" maxLength={255} />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Số tài khoản"
                    name="bank_number"
                    rules={[
                      {
                        pattern: RegUtil.NUMBERREG,
                        message: "Số tài khoản chỉ chứa ký tự số",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập số tài khoản" maxLength={20} />
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item name="beneficiary_name" label="Chủ tài khoản">
                    <Input placeholder="Nhập chủ tài khoản" maxLength={255} />
                  </Item>
                </Col>
              </Row>
            </div>
          </Collapse.Panel>
        </Collapse>
        <div className="margin-top-10" style={{ textAlign: "right" }}>
          <Space size={12}>
            <Button type="default" onClick={onCancel}>
              Hủy
            </Button>
            <Button htmlType="submit" type="primary">
              Lưu
            </Button>
          </Space>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CreateSupplierScreen;
