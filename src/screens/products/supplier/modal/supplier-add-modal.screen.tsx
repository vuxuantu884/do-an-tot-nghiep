import { Col, Form, Input, Modal, Radio, Row, Select } from "antd";
import { AppConfig } from "config/app.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import {SupplierCreateAction, SupplierSearchAction} from "domain/actions/core/supplier.action";
import { AccountResponse } from "model/account/account.model";
import { BaseMetadata, PageResponse } from "model/base/base-metadata.response";
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
import {validatePhoneSupplier} from "../../../../utils/supplier";
import BaseSelectMerchans from "../../../../component/base/BaseSelect/BaseSelectMerchans";
import {useFetchMerchans} from "../../../../hook/useFetchMerchans";

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
  const [metadata, setMetadata] = useState<BaseMetadata>({
    limit: 10,
    page: 1,
    total: 0
  });

  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const {fetchMerchans, merchans, isLoadingMerchans} = useFetchMerchans()

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
      setMetadata(data.metadata)
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
  const createSupplierCallback = (result: SupplierResponse) => {
    if (result) {
      showSuccess("Thêm mới dữ liệu thành công");
      onOk(result);
      formSupplierAdd.resetFields();
    }
  }

  const onFinish = (values: SupplierCreateRequest) => {
      values.contacts =[{email: "",
                        fax: "",
                        id: null,
                        is_default: true,
                        name: "",
                        phone: values.phone ?? null,
                        supplier_id: null,
                        website: ""}];
    dispatch(SupplierCreateAction(values, createSupplierCallback));
  }

  const onChangeGoods = (values: any) => {
    formSupplierAdd.setFieldsValue({ goods: values })
  }

  const handleCancel = () => {
    formSupplierAdd.resetFields();
    onCancel();
  };

  const validatePhone = (rule: any, value: any, callback: any): void => {
    validatePhoneSupplier({
      value,
      callback,
      phoneList: listSupplier
    })
  };

  const fetchAccount = (values: any) => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT], status: "active", limit: metadata.limit, page: metadata.page, ...values },
        setDataAccounts
      )
    );
  }

  useEffect(() => {
    if(goods) {
      formSupplierAdd.setFieldsValue({ goods: ['fashion'] })
    }
  }, [goods, formSupplierAdd])

  useEffect(() => {
    fetchAccount({ condition: "", page: metadata.page })
    dispatch(SupplierSearchAction({limit: 200 },(response: PageResponse<SupplierResponse>)=> {
      if(response){
        setListSupplier(response.items)
      } else {
        setListSupplier([]);
      }
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, setDataAccounts]);

  return (
    <Modal
      title="Thêm mới nhà cung cấp"
      visible={visible}
      centered
      okText="Thêm mới"
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={formSupplierAdd.submit}
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
                onChange={onChangeGoods}
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
                  message: "Vui lòng chọn Merchandiser",
                },
              ]}
              name="pic_code"
              label="Merchandiser"
            >
              <BaseSelectMerchans
                merchans={merchans}
                fetchMerchans={fetchMerchans}
                isLoadingMerchans={isLoadingMerchans}
              />
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
