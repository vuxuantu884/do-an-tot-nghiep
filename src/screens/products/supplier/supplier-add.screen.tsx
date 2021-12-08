import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import AccountSearchSelect from "component/custom/select-search/account-select";
import {AppConfig} from "config/app.config";
import {SuppliersPermissions} from "config/permissions/supplier.permisssion";
import UrlConfig from "config/url.config";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import {SupplierCreateAction} from "domain/actions/core/supplier.action";
import useAuthorization from "hook/useAuthorization";
import {CountryResponse} from "model/content/country.model";
import {DistrictResponse} from "model/content/district.model";
import {BankInfo, SupplierCreateRequest} from "model/core/supplier.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";
import RowDetail from "screens/settings/store/RowDetail";
import {VietNamId} from "utils/Constants";
import {RegUtil} from "utils/RegUtils";
import { showError } from "utils/ToastUtils";

const {Item} = Form;
const {Option} = Select;

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
  goods: [AppConfig.FASHION_INDUSTRY],
  person_in_charge: null,
  moq: null,
  note: "",
  name: "",
  phone: "",
  scorecard: null,
  status: "active",
  tax_code: "",
  type: "",
  bank_info: null
}; 

export  const DrawBankInfo = (prop: BankInfo)=>{
  return (
    <>
     <RowDetail title="Ngân hàng" value={prop.bank_name}></RowDetail>
     <RowDetail title="Chi nhánh" value={prop.bank_brand}></RowDetail>
     <RowDetail title="STK" value={prop.bank_number}></RowDetail>
     <RowDetail title="Chủ TK" value={prop.beneficiary_name}></RowDetail>
     <Divider></Divider>
    </>
  )
}

const CreateSupplierScreen: React.FC = () => {
  const dispatch = useDispatch();
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
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  const [lstBankInfo, setLstBankInfo] = useState<Array<BankInfo>>([]);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bank_brand: null,
    bank_number: null,
    beneficiary_name: null,
    bank_name: null
  });

  const [allowCreateSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.CREATE],
    not: false,
  }); 

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

  const onCreateSuccess = useCallback(
    (data) => {
      if (!data) return;

      history.push(`${UrlConfig.SUPPLIERS}`);
    },
    [history]
  );
  const onFinish = useCallback(
    (values: SupplierCreateRequest) => {
      if (lstBankInfo && lstBankInfo.length > 0) {
        values.bank_info = [...lstBankInfo];
      }
      dispatch(SupplierCreateAction(values, onCreateSuccess));
    },
    [dispatch, onCreateSuccess, lstBankInfo]
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

  const validateBank= useCallback((): boolean =>{
    if (!bankInfo.bank_name) {
      showError("Vui lòng nhập ngân hàng");
      return false;
    }
    if (!bankInfo.bank_number) {
      showError("Vui lòng nhập số tài khoản");
      return false;
    }
    if (!RegUtil.NUMBERREG.test(bankInfo.bank_number)) { 
      showError("Số tài khoản chỉ chứa ký tự số");
      return false;
    }
    if (!bankInfo.beneficiary_name) {
      showError("Vui lòng nhập chủ tài khoản");
      return false;
    }

    return true;
  },[bankInfo])

  const addBank = useCallback(
    ()=>{
      if (validateBank()) {
        let lst: Array<BankInfo> =[];
        lst =[...lstBankInfo];
        lst.push({...bankInfo});
        setLstBankInfo([...lst]);

        setBankInfo({
          bank_brand: null,
          bank_number: null,
          beneficiary_name: null,
          bank_name: null
        });
        formSupplier.setFieldsValue({
          bank_brand: null,
          bank_number: null,
          beneficiary_name: null,
          bank_name: null
        });
      }
    },[bankInfo,validateBank, lstBankInfo, formSupplier]
  );

  //end memo
  useEffect(() => {
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(DefaultCountry, setListDistrict));
  }, [dispatch, setListDistrict]);
  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: "Tổng quan",
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
                  <Radio.Group>
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
                <Item
                  rules={[{required: true, message: "Vui lòng chọn ngành hàng"}]}
                  name="goods"
                  label="Ngành hàng"
                >
                  <Select
                    mode="multiple"
                    className="selector"
                    placeholder="Chọn ngành hàng"
                    showArrow
                  >
                    {goods?.map((item) => (
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
                <Item
                  rules={[
                    {required: true, message: "Vui lòng nhập số điện thoại"},
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
              <Col span={12}>
                <AccountSearchSelect
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn nhân viên phụ trách",
                    },
                  ]}
                  name="person_in_charge"
                  label="Nhân viên phụ trách"
                  placeholder="Chọn nhân viên phụ trách"
                  queryAccount={{
                    department_ids: [AppConfig.WIN_DEPARTMENT],
                    status: "active",
                  }}
                  defaultValue={currentUserCode}
                />
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
                  name="address">
                  <Input placeholder="Nhập địa chỉ" maxLength={100} />
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={12}>
                <Item label="Quốc gia" name="country_id">
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
            </Row>
            <Row gutter={50}>
               <Col span={12}>
                 <Item name="contact_name" label="Người liên hệ">
                   <Input placeholder="Nhập người liên hệ" maxLength={255} />
                 </Item>
               </Col> 
               <Col span={12}>
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
              <Col span={12}>
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
              <Col span={12}>
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
            </Card>
          </Col>
          <Col span={8}>
             <Card title="Thông tin thanh toán">
               {
                 lstBankInfo?.map((e)=>{
                   return <DrawBankInfo 
                    bank_brand={e.bank_name} 
                    bank_number={e.bank_number} 
                    beneficiary_name={e.beneficiary_name} bank_name={e.bank_name} />
                 })
               }
               {(lstBankInfo && lstBankInfo.length > 0) &&  <Divider style={{color: '#40a9ff'}} orientation="left">Thêm ngân hàng</Divider>}
              <Row>
                <Col span={24}>
                  <Item label="Ngân hàng" name="bank_name">
                    <Input value={bankInfo.bank_name ?? undefined} placeholder="Nhập ngân hàng" onChange={(e)=>{
                      setBankInfo({...bankInfo,
                        bank_name: e.target.value})
                    }} maxLength={255} />
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Item name="bank_brand" label="Chi nhánh">
                    <Input value={bankInfo?.bank_brand ?? undefined} placeholder="Nhập chi nhánh" onChange={(e)=>{
                      setBankInfo({...bankInfo,
                        bank_brand: e.target.value})
                    }} maxLength={255} />
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Item
                    label="Số tài khoản"
                    name="bank_number" 
                  >
                    <Input value={bankInfo?.bank_number ?? undefined} placeholder="Nhập số tài khoản" onChange={(e)=>{
                      setBankInfo({...bankInfo,
                        bank_number: e.target.value})
                    }} maxLength={20} />
                  </Item>
                </Col> 
              </Row>
              <Row> 
                <Col span={24}>
                  <Item name="beneficiary_name" label="Chủ tài khoản">
                    <Input value={bankInfo?.beneficiary_name ?? undefined} placeholder="Nhập chủ tài khoản" onChange={(e)=>{
                      setBankInfo({...bankInfo,
                        beneficiary_name: e.target.value})
                    }} maxLength={255} />
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Button icon={<PlusOutlined/>} ghost type="primary" onClick={addBank}>Thêm ngân hàng</Button>
                </Col>
              </Row>
             </Card>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={16}>
            <Card title="Chi tiết nhà cung cấp">
            <Row gutter={50}>
              <Col span={12}>
                <Item label="Phân cấp nhà cung cấp" name="scorecard">
                  <Select className="selector" placeholder="Chọn phân cấp nhà cung cấp">
                    {scorecards?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col> 
              {/* <Col span={12}>
                <Item
                  label="Chứng chỉ"
                  name="certifications"
                  help={
                    <div className="t-help">
                      Tối đa 1 files (doc, pdf, png, jpeg, jpg) và dung lượng tối đa 3
                      MB
                    </div>
                  }
                >
                  <Input multiple type="file" placeholder="Tên danh mục" />
                </Item>
              </Col> */}
              <Col span={12}>
                <Item label="Số lượng đặt hàng tối thiểu">
                  <Input.Group className="ip-group" compact>
                    <Item name="moq" noStyle>
                      <NumberInput
                        placeholder="Nhập số lượng"
                        isFloat
                        style={{width: "70%"}}
                      />
                    </Item>
                    <Item name="moq_unit" noStyle>
                      <Select className="selector-group" style={{width: "30%"}}>
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
                        style={{width: "70%"}}
                        placeholder="Nhập thời gian công nợ"
                      />
                    </Item>
                    <Item name="debt_time_unit" noStyle>
                      <Select
                        className="selector-group"
                        defaultActiveFirstOption
                        style={{width: "30%"}}
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
              <Col span={12}>
                <Item label="Ghi chú" name="note">
                  <Input placeholder="Nhập ghi chú" maxLength={255} />
                </Item>
              </Col>
            </Row>
            
          </Card>
          </Col>
        </Row>   
        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
        </Collapse>
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
