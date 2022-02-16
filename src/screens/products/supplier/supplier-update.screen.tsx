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
  SupplierUpdateAction
} from "domain/actions/core/supplier.action";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import {
  SupplierResponse,
  SupplierUpdateRequest
} from "model/core/supplier.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { CompareObject } from "utils/CompareObject";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import {getCollectionRequestAction} from "../../../domain/actions/product/collection.action";
import {CollectionQuery, CollectionResponse} from "../../../model/product/collection.model";

const { Item } = Form;
const { Option } = Select;
type SupplierParam = {
  id: string;
};

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
  //State
  const [status, setStatus] = useState<string>();
  const [supplier, setSupplier] = useState<SupplierResponse | null>(null);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [groupProducts, setGroupProducts] = useState<PageResponse<CollectionResponse> | null>( null)

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
    [formRef]
  );

  const onUpdateSuccess = (response: SupplierResponse|false) => {
    if(response){
    history.push(`${UrlConfig.SUPPLIERS}/${id}}`);
    showSuccess("Sửa nhà cung cấp thành công");
    }
    setLoading(false);
  };

  const onGetSuccess = (results: PageResponse<CollectionResponse>) => {
    if (results && results.items) {
      setGroupProducts(results);
    }
  }

  const onFinish = (values: SupplierUpdateRequest) => {
    const newValues = {...values, phone: values.phone || supplier?.phone || ''}
    setLoading(true);
    dispatch(SupplierUpdateAction(idNumber, values, onUpdateSuccess));
    dispatch(SupplierUpdateAction(idNumber, newValues, onUpdateSuccess))
  }
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
      setSupplier(data);
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

  //end memo
  useEffect(() => {
    if (isFirstLoad.current) {
      setLoadingData(true);
      if (!Number.isNaN(idNumber)) {
        dispatch(SupplierDetailAction(idNumber, setSupplierDetail));
        dispatch(getCollectionRequestAction(params, onGetSuccess))
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, idNumber, setSupplierDetail]);
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
          path: `${UrlConfig.SUPPLIERS}/${supplier?.id}`
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
                </Row>
                <Row gutter={50}>
                  <Col span={12}>
                    <Form.Item
                      label="Số điện thoại"
                      rules={[
                        {
                          pattern: RegUtil.PHONE,
                          message: 'Số điện thoại không đúng định dạng'
                        },
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại",
                        },
                      ]}
                      name="phone"
                    >
                      <Input placeholder="Nhập tên nhà cung cấp" maxLength={255} />
                    </Form.Item>
                  </Col>
                  {/*TODO: Waiting response api*/}
                  {/*<Col span={12}>*/}
                  {/*  <Item*/}
                  {/*    name="group_product"*/}
                  {/*    label="Nhóm hàng"*/}
                  {/*  >*/}
                  {/*    <Select allowClear placeholder="Chọn nhóm hàng">*/}
                  {/*      {groupProducts && groupProducts?.items.map((item) => (*/}
                  {/*        <Option key={item.id} value={item.id}>*/}
                  {/*          {item.name}*/}
                  {/*        </Option>*/}
                  {/*      ))}*/}
                  {/*    </Select>*/}
                  {/*  </Item>*/}
                  {/*</Col>*/}
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
