import { Checkbox, Form, Input, Modal, Select } from "antd";
import { actionFetchListOrderSourceCompanies } from "domain/actions/settings/order-sources.action";
import { OrderSourceCompanyModel, OrderSourceModel } from "model/response/order/order-source.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

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

  const [listOrderCompanies, setListOrderCompanies] = useState<OrderSourceCompanyModel[]>([]);


  useEffect(() => {
    /**
    * when dispatch action, call function (handleData) to handle data
    */
    dispatch(actionFetchListOrderSourceCompanies(
      (data: OrderSourceCompanyModel[])=> {
        setListOrderCompanies(data);
      }
    ))
  }, [dispatch])

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
        {listOrderCompanies?.length && (
          <Form.Item
            name="company"
            label="Doanh nghiệp"
            rules={[
              { required: true, message: "Vui lòng chọn doanh nghiệp !" }
            ]}
          >
            <Select
              placeholder="Select a option and change input text above"
              // onChange={this.onGenderChange}
              allowClear
            >
              {listOrderCompanies && (
                listOrderCompanies.map((singleOrderCompany) => {
                  return (
                    <Select.Option value={singleOrderCompany.company} key={singleOrderCompany.id}>{singleOrderCompany.name}</Select.Option>
                  )
                })
              )}
            </Select>
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
