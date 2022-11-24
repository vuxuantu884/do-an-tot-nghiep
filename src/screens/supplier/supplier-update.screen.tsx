import {
  Button,
  Card,
  Col,
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
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";
import UrlConfig from "config/url.config";
import {
  SupplierDetailAction,
  SupplierSearchAction,
  SupplierUpdateAction,
} from "domain/actions/core/supplier.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse, SupplierUpdateRequest } from "model/core/supplier.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { CompareObject } from "utils/CompareObject";
import { showSuccess } from "utils/ToastUtils";
import CountryPhoneInput, { ConfigProvider } from "antd-country-phone-input";
import en from "world_countries_lists/data/countries/en/world.json";
import "antd-country-phone-input/dist/index.css";
import BaseSelectPaging from "component/base/BaseSelect/BaseSelectPaging";
import { CollectionQuery, CollectionResponse } from "model/product/collection.model";
import { validatePhoneSupplier } from "utils/supplier";
import { getCollectionRequestAction } from "domain/actions/product/collection.action";
import BaseSelect from "component/base/BaseSelect/BaseSelect";

const { Item } = Form;
const { Option } = Select;
type SupplierParam = {
  id: string;
};

const supplierCategories = [
  { value: "material", name: "Chất liệu" },
  { value: "gift", name: "Quà tặng" },
  { value: "good", name: "Thành phẩm" },
];

const UpdateSupplierScreen: React.FC = () => {
  const { id } = useParams<SupplierParam>();
  const params: CollectionQuery = useParams() as CollectionQuery;

  let idNumber = parseInt(id);
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const history = useHistory();
  const [isError, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const isFirstLoad = useRef(true);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [isSearchingGroupProducts, setIsSearchingGroupProducts] = React.useState(false);

  const supplier_type = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type,
  );
  const scorecards = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.scorecard,
  );
  const date_unit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.date_unit);
  const moq_unit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.moq_unit);
  const supplier_status = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_status,
  );

  //State
  const [status, setStatus] = useState<string>();
  const [supplier, setSupplier] = useState<SupplierResponse | null>(null);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [groupProducts, setGroupProducts] = useState<PageResponse<CollectionResponse>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [type, setType] = useState("personal");

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
    [formRef],
  );

  const onUpdateSuccess = (response: SupplierResponse | false) => {
    if (response) {
      history.push(`${UrlConfig.SUPPLIERS}/${id}}`);
      showSuccess("Sửa nhà cung cấp thành công");
    }
    setLoading(false);
  };

  const onFinish = (values: SupplierUpdateRequest) => {
    const newValues = {
      ...values,
      phone: JSON.stringify(values.phone),
    };

    setLoading(true);
    dispatch(SupplierUpdateAction(idNumber, newValues, onUpdateSuccess));
  };
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
      const newData = { ...data };
      newData.phone =
        newData.phone[0] !== "{"
          ? {
              phone: newData.phone.slice(1, newData.phone.length),
              short: "vn",
              code: 84,
            }
          : JSON.parse(newData.phone);
      setSupplier(newData);
      setStatus(data.status);
    }
  }, []);

  const backAction = () => {
    if (!CompareObject(formRef.current?.getFieldsValue(), supplier)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({ visible: false });
        },
        onOk: () => {
          setModalConfirm({ visible: false });
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
      });
    } else {
      history.goBack();
    }
  };

  const validatePhone = (_: any, value: any, callback: any): void => {
    validatePhoneSupplier({
      value,
      callback,
      phoneCurrent: supplier?.phone,
      phoneList: listSupplier,
      type: "NATIONAL",
    });
  };

  const onGetSuccess = (results: PageResponse<CollectionResponse>) => {
    if (results && results.items) {
      setGroupProducts(results);
      setIsSearchingGroupProducts(false);
    }
  };

  const onSearchGroupProducts = (values: any) => {
    setIsSearchingGroupProducts(true);
    dispatch(
      getCollectionRequestAction(
        { ...params, ...values, limit: groupProducts.metadata.limit },
        onGetSuccess,
      ),
    );
  };

  //end memo
  useEffect(() => {
    if (isFirstLoad.current) {
      setLoadingData(true);
      if (!Number.isNaN(idNumber)) {
        dispatch(SupplierDetailAction(idNumber, setSupplierDetail));
        dispatch(getCollectionRequestAction(params, onGetSuccess));
      }
    }
    isFirstLoad.current = false;
    dispatch(
      SupplierSearchAction({ limit: 200 }, (response: PageResponse<SupplierResponse>) => {
        if (response) {
          setListSupplier(response.items);
        } else {
          setListSupplier([]);
        }
      }),
    );
  }, [dispatch, idNumber, setSupplierDetail, params]);

  const getFlag = (short: string) => {
    const data = require(`world_countries_lists/data/flags/24x24/${short.toLowerCase()}.png`);
    // for dumi
    if (typeof data === "string") {
      return data;
    }
    // for CRA
    return data.default;
  };

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
          name: "Nhà cung cấp",
          path: `${UrlConfig.SUPPLIERS}`,
        },
        {
          name: supplier ? supplier.code : "",
          path: `${UrlConfig.SUPPLIERS}/${supplier?.id}`,
        },
        {
          name: "Sửa thông tin",
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
          <Form.Item hidden noStyle name="id">
            <Input />
          </Form.Item>
          <Form.Item hidden noStyle name="code">
            <Input />
          </Form.Item>
          <Form.Item hidden noStyle name="version">
            <Input />
          </Form.Item>
          <Form.Item hidden noStyle name="addresses">
            <Input />
          </Form.Item>
          <Form.Item hidden noStyle name="contacts">
            <Input />
          </Form.Item>
          <Form.Item hidden noStyle name="payments">
            <Input />
          </Form.Item>
          <Row>
            <Col span={18}>
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
                    <Item
                      label="Danh mục nhà cung cấp"
                      name="supplier_category"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn danh mục nhà cung cấp",
                        },
                      ]}
                    >
                      <BaseSelect
                        placeholder="Chọn danh mục nhà cung cấp"
                        data={supplierCategories}
                        renderItem={(item) => (
                          <Option key={item.name} value={item.value}>
                            {item.name}
                          </Option>
                        )}
                      />
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
                      normalize={(value) => (value || "").toUpperCase()}
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
                    <ConfigProvider
                      locale={en}
                      areaMapper={(area: any) => {
                        return {
                          ...area,
                          emoji: (
                            <img
                              alt="flag"
                              style={{ width: 18, height: 18, verticalAlign: "sub" }}
                              src={getFlag(area.short)}
                            />
                          ),
                        };
                      }}
                    >
                      <Form.Item
                        className="supplier"
                        label="SĐT nhà cung cấp"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập SĐT nhà cung cấp",
                          },
                          {
                            validator: validatePhone,
                          },
                        ]}
                        name="phone"
                      >
                        <CountryPhoneInput placeholder="Nhập SĐT nhà cung cấp" />
                      </Form.Item>
                    </ConfigProvider>
                  </Col>
                  <Col span={12}>
                    <Item
                      name="tax_code"
                      label="Mã số thuế"
                      rules={[
                        {
                          required: type === "enterprise",
                          message: "Nhà cung cấp là doanh nghiệp phải nhập mã số thuế",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập mã số thuế" maxLength={100} />
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={12}>
                    <Form.Item
                      label="Merchandiser"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn Merchandiser",
                        },
                      ]}
                      name="pic_code"
                    >
                      <AccountSearchPaging placeholder="Chọn Merchandiser" />
                    </Form.Item>
                  </Col>
                  {/*TODO: Waiting response api*/}
                  <Col span={12}>
                    <Item name="collection_ids" label="Nhóm hàng">
                      <BaseSelectPaging
                        mode="multiple"
                        metadata={groupProducts?.metadata}
                        fetchData={onSearchGroupProducts}
                        data={groupProducts?.items || []}
                        renderItem={(item) => (
                          <Option value={item.id} key={item.id}>
                            {item.name}
                          </Option>
                        )}
                        defaultValue={supplier?.collection_ids}
                        placeholder="Nhập nhóm hàng"
                        loading={isSearchingGroupProducts}
                      />
                    </Item>
                  </Col>
                </Row>
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
