import { Col, Form, Input, Modal, Radio, Row, Select } from "antd";
import { AppConfig } from "config/app.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import {SupplierCreateAction, SupplierSearchAction} from "domain/actions/core/supplier.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import {
  SupplierCreateRequest,
  SupplierResponse,
} from "model/core/supplier.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";

type SupplierAddModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (supplier: SupplierResponse) => void;
};
const { Item } = Form;
const { Option } = Select;

const SupplierAddModal: React.FC<SupplierAddModalProps> = (
  props: SupplierAddModalProps
) => {
  const dispatch = useDispatch();
  const [formSupplierAdd] = Form.useForm();
  const { visible, onCancel, onOk } = props;
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);

  const supplier_type = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type
  );
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const currentUserCode = useSelector(
    (state: RootReducerType) => state.userReducer?.account?.code
  );
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
        formSupplierAdd.setFieldsValue({
          pic_code: currentUserCode,
        });
      }
    },
    [currentUserCode, formSupplierAdd]
  );
  const createSupplierCallback = useCallback(
    (result: SupplierResponse) => {
      if (result !== null && result !== undefined) {
        showSuccess("Thêm mới dữ liệu thành công");
        onOk(result);
        formSupplierAdd.resetFields();
      }
    },
    [formSupplierAdd, onOk]
  );

  const onFinish = useCallback(
    (values: SupplierCreateRequest) => {
      values.contacts =[{email: "",
                        fax: "",
                        id: null,
                        is_default: true,
                        name: "",
                        phone: values.phone ?? null,
                        supplier_id: null,
                        website: ""}];
      dispatch(SupplierCreateAction(values, createSupplierCallback));
    },
    [createSupplierCallback, dispatch]
  );
  const onOkPress = useCallback(() => {
    formSupplierAdd.submit();
  }, [formSupplierAdd]);
  const handleCancel = () => {
    formSupplierAdd.resetFields();
    onCancel();
  };

  const validatePhone = (rule: any, value: any, callback: any): void => {
    if (value) {
      if (!RegUtil.PHONE.test(value)) {
        callback(`Số điện thoại không đúng định dạng`);
      } else {
        listSupplier.forEach((supplier: SupplierResponse) => {
          if (supplier?.phone === value) {
            callback(`Số điện thoại đã tồn tại`);
          }
          return
        })
        callback();
      }
    } else {
      callback();
    }
  };

  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" },
        setDataAccounts
      )
    );
    dispatch(SupplierSearchAction({limit: 200 },(response: PageResponse<SupplierResponse>)=> {
      if(response){
        setListSupplier(response.items)
      } else {
        setListSupplier([]);
      }
    }))
  }, [dispatch, setDataAccounts]);

  return (
    <Modal
      title="Thêm mới nhà cung cấp"
      visible={visible}
      centered
      okText="Thêm mới"
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={onOkPress}
      width={700}
      onCancel={handleCancel}
    >
      <Form
        form={formSupplierAdd}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          address: "",
          bank_brand: "",
          bank_name: "",
          bank_number: "",
          beneficiary_name: "",
          certifications: [],
          city_id: null,
          country_id: VietNamId,
          contact_name: "",
          debt_time: null,
          debt_time_unit: null,
          district_id: null,
          website: null,
          email: "",
          fax: "",
          goods: [],
          pic_code: null,
          moq: null,
          note: "",
          name: "",
          phone: "",
          scorecard: null,
          status: "active",
          tax_code: "",
          type: "",
        }}
        scrollToFirstError
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Item hidden name="status"></Item>
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
          <Col xs={24} lg={12}>
            <Item
              rules={[{ required: true, message: "Vui lòng chọn ngành hàng" }]}
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
          <Col xs={24} lg={12}>
            <Item label="Mã nhà cung cấp" name="code">
              <Input disabled placeholder="Mã nhà cung cấp" />
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên nhà cung cấp",
                },
                {
                  whitespace: true,
                  message: "Vui lòng nhập tên nhà cung cấp",
                },
              ]}
              name="name"
              label="Tên nhà cung cấp"
            >
              <Input placeholder="Nhập tên nhà cung cấp" maxLength={255} />
            </Item>
          </Col>

          <Col xs={24} lg={12}>
            <Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọ nhân viên phụ trách",
                },
              ]}
              name="pic_code"
              label="Nhân viên phụ trách"
            >
              <Select
                placeholder="Chọn nhân viên phụ trách"
                className="selector"
                allowClear
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
          <Col xs={24} lg={12}>
            <Item
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { validator: validatePhone },
              ]}
              name="phone"
              label="Số điện thoại"
            >
              <Input placeholder="Nhập số điện thoại" />
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item
              label="Mã số thuế"
              name="tax_code"
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
      </Form>
    </Modal>
  );
};

export default SupplierAddModal;
