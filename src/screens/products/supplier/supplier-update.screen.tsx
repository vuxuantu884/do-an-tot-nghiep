import {PlusOutlined} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  FormInstance,
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
import ModalConfirm, {ModalConfirmProps} from "component/modal/ModalConfirm";
import {AppConfig} from "config/app.config";
import {SuppliersPermissions} from "config/permissions/supplier.permisssion";
import UrlConfig from "config/url.config";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import {
  SupplierDetailAction,
  SupplierUpdateAction,
} from "domain/actions/core/supplier.action";
import useAuthorization from "hook/useAuthorization";
import {CountryResponse} from "model/content/country.model";
import {DistrictResponse} from "model/content/district.model";
import {
  BankInfo,
  SupplierDetail,
  SupplierResponse,
  SupplierUpdateRequest,
} from "model/core/supplier.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import React, {createRef, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useParams} from "react-router";
import RowDetail from "screens/settings/store/RowDetail";
import {convertSupplierResponseToDetail} from "utils/AppUtils";
import {CompareObject} from "utils/CompareObject";
import {RegUtil} from "utils/RegUtils";
import {showError, showSuccess} from "utils/ToastUtils";

const {Item} = Form;
const {Option} = Select;
type SupplierParam = {
  id: string;
};

const DefaultCountry = 233;

export const DrawBankInfo = (prop: BankInfo) => {
  return (
    <>
      <RowDetail title="Ngân hàng" value={prop.bank_name}></RowDetail>
      <RowDetail title="Chi nhánh" value={prop.bank_brand}></RowDetail>
      <RowDetail title="STK" value={prop.bank_number}></RowDetail>
      <RowDetail title="Chủ TK" value={prop.beneficiary_name}></RowDetail>
      <Divider></Divider>
    </>
  );
};

const UpdateSupplierScreen: React.FC = () => {
  const {id} = useParams<SupplierParam>();
  let idNumber = parseInt(id);
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const history = useHistory();
  const [isError, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const isFirstLoad = useRef(true);
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
  //State
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [status, setStatus] = useState<string>();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  const [lstBankInfo, setLstBankInfo] = useState<Array<BankInfo>>([]);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bank_brand: null,
    bank_number: null,
    beneficiary_name: null,
    bank_name: null,
  });

  //phân quyền
  const [allowUpdateSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.UPDATE],
    not: false,
  });

  //EndState
  //Callback

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
        formRef.current?.setFieldsValue({
          city_id: cityId,
        });
      }
    },
    [formRef, listDistrict]
  );
  const onUpdateSuccess = useCallback(() => {
    setLoading(false);
    history.push("/suppliers");
    showSuccess("Sửa nhà cung cấp thành công");
  }, [history]);
  const onFinish = useCallback(
    (values: SupplierUpdateRequest) => {
      setLoading(true);
      dispatch(SupplierUpdateAction(idNumber, values, onUpdateSuccess));
    },
    [dispatch, idNumber, onUpdateSuccess]
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

  const setSupplierDetail = useCallback((data: SupplierResponse | false) => {
    setLoadingData(false);
    if (!data) {
      setError(true);
    } else {
      let detail = convertSupplierResponseToDetail(data);
      setSupplier(detail);
    }
  }, []);

  const backAction = () => {
    if (!CompareObject(formRef.current?.getFieldsValue(), supplier)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({visible: false});
        },
        onOk: () => {
          setModalConfirm({visible: false});
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
      });
    } else {
      history.goBack();
    }
  };

  const validateBank = useCallback((): boolean => {
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
  }, [bankInfo]);

  const addBank = useCallback(() => {
    if (validateBank()) {
      let lst: Array<BankInfo> = [];
      lst = [...lstBankInfo];
      lst.push({...bankInfo});
      setLstBankInfo([...lst]);

      setBankInfo({
        bank_brand: null,
        bank_number: null,
        beneficiary_name: null,
        bank_name: null,
      });
      formRef.current?.setFieldsValue({
        bank_brand: null,
        bank_number: null,
        beneficiary_name: null,
        bank_name: null,
      });
    }
  }, [bankInfo, validateBank, lstBankInfo, formRef]);

  //end memo
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(CountryGetAllAction(setCountries));
      dispatch(DistrictGetByCountryAction(DefaultCountry, setListDistrict));
      if (!Number.isNaN(idNumber)) {
        dispatch(SupplierDetailAction(idNumber, setSupplierDetail));
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, idNumber, setListDistrict, setSupplierDetail]);
  return (
    <ContentContainer
      isLoading={loadingData}
      isError={isError}
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: "/",
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
          name: "Sửa nhà cung cấp",
        },
      ]}
    >
      {supplier !== null && (
        <Form
          ref={formRef}
          layout="vertical"
          onFinish={onFinish}
          initialValues={supplier}
          scrollToFirstError
        >
          <Form.Item hidden noStyle name="version">
            <Input />
          </Form.Item>
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
                    <label
                      className={status === "active" ? "text-success" : "text-error"}
                    >
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
                      defaultValue={supplier.person_in_charge}
                      queryAccount={{
                        department_ids: [AppConfig.WIN_DEPARTMENT],
                        status: "active",
                      }}
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
                      name="address"
                    >
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
                {lstBankInfo?.map((e) => {
                  return (
                    <DrawBankInfo
                      bank_brand={e.bank_name}
                      bank_number={e.bank_number}
                      beneficiary_name={e.beneficiary_name}
                      bank_name={e.bank_name}
                    />
                  );
                })}
                {lstBankInfo && lstBankInfo.length > 0 && (
                  <Divider style={{color: "#40a9ff"}} orientation="left">
                    Thêm ngân hàng
                  </Divider>
                )}
                <Row>
                  <Col span={24}>
                    <Item label="Ngân hàng" name="bank_name">
                      <Input
                        value={bankInfo.bank_name ?? undefined}
                        placeholder="Nhập ngân hàng"
                        onChange={(e) => {
                          setBankInfo({...bankInfo, bank_name: e.target.value});
                        }}
                        maxLength={255}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Item name="bank_brand" label="Chi nhánh">
                      <Input
                        value={bankInfo?.bank_brand ?? undefined}
                        placeholder="Nhập chi nhánh"
                        onChange={(e) => {
                          setBankInfo({...bankInfo, bank_brand: e.target.value});
                        }}
                        maxLength={255}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Item label="Số tài khoản" name="bank_number">
                      <Input
                        value={bankInfo?.bank_number ?? undefined}
                        placeholder="Nhập số tài khoản"
                        onChange={(e) => {
                          setBankInfo({...bankInfo, bank_number: e.target.value});
                        }}
                        maxLength={20}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Item name="beneficiary_name" label="Chủ tài khoản">
                      <Input
                        value={bankInfo?.beneficiary_name ?? undefined}
                        placeholder="Nhập chủ tài khoản"
                        onChange={(e) => {
                          setBankInfo({...bankInfo, beneficiary_name: e.target.value});
                        }}
                        maxLength={255}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Button
                      icon={<PlusOutlined />}
                      ghost
                      type="primary"
                      onClick={addBank}
                    >
                      Thêm ngân hàng
                    </Button>
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
          <BottomBarContainer
            back="Quay lại danh sách"
            backAction={backAction}
            rightComponent={
              allowUpdateSup && (
                <Button loading={loading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              )
            }
          />
        </Form>
      )}

      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default UpdateSupplierScreen;
