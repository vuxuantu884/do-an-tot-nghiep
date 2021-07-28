import { Checkbox, Dropdown, Form, Input, Menu, Modal } from "antd";
import { actionFetchListOrderSourceCompanies } from "domain/actions/settings/order-sources.action";
import { OrderSourceCompanyModel, OrderSourceModel } from "model/response/order/order-source.response";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

type ModalAddOrderSourceType = {
  visible?: boolean;
  onCreate: (value: OrderSourceModel) => void;
  onCancel: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
};

type stateType = {
  settings: {
    orderSources: {
      listCompanies: OrderSourceCompanyModel[];
    }
  }
}

const ModalAddOrderSource: React.FC<ModalAddOrderSourceType> = (
  props: ModalAddOrderSourceType
) => {
  const { visible, onCreate, onCancel } = props;
  const [form] = Form.useForm();
  const initialFormValue: OrderSourceModel = {
    company: "",
    name: "",
    is_active: false,
    is_default: false,
  };
  const dispatch = useDispatch();
  const listOrderCompany = useSelector((state: stateType) => {
    return state.settings.orderSources.listCompanies;
  });

  useEffect(() => {
    if(!listOrderCompany.length) {
      console.log('aaa')
      dispatch(actionFetchListOrderSourceCompanies())
    }
  }, [dispatch, listOrderCompany.length])

  return (
    <Modal
      width="600px"
      className="modal-confirm"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title="Thêm nguồn đơn hàng"
      onOk={() => {
        form
          .validateFields()
          .then((values: OrderSourceModel) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValue}
      >
        {listOrderCompany?.length && (
          <Form.Item
            name="company"
            label="Doanh nghiệp"
            rules={[
              { required: true, message: "Vui lòng chọn doanh nghiệp !" }
            ]}
          >
            {/* <Dropdown trigger={["click"]} placement="bottomCenter" overlay={
              <Menu>
                {
                  listOrderCompany.map((singleCompany, index) => (
                    <Menu.Item  key={index}>{singleCompany.name}</Menu.Item>
                  ))
                }
              </Menu>
            }>
            </Dropdown> */}
          </Form.Item>

        )}
        <Form.Item
          name="name"
          label="Tên nguồn đơn hàng"
          rules={[
            { required: true, message: "Vui lòng điền tên nguồn đơn hàng !" },
            { max: 10, message: "Tên nguồn đơn hàng tối đa 10 kí tự" },
          ]}
        >
          <Input
            placeholder="Nhập tên nguồn đơn hàng"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="is_active" valuePropName="checked" style={{marginBottom: 10}}>
          <Checkbox>Áp dụng cho đơn hàng</Checkbox>
        </Form.Item>
        <Form.Item name="is_default" valuePropName="checked" style={{marginBottom: 10}}>
          <Checkbox>Đặt làm mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddOrderSource;
