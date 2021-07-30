import { Checkbox, Col, Form, Input, Modal, Row, Select } from "antd";
import { modalActionType } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { FulfillmentModel } from "model/response/fulfillment.response";
import { OrderSourceModel } from "model/response/order/order-source.response";
import { useSelector } from "react-redux";

type ModalAddOrderSourceType = {
  visible?: boolean;
  onCreate: (value: FulfillmentModel) => void;
  onCancel: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
  modalAction?: modalActionType;
  modalSingleOrderSource: FulfillmentModel | null;
};

type ModalFormType = {
  company_id: number;
  company: string;
  sub_status?: string;
  status?: string;
  is_active?: boolean;
  note?: string;
};

/**
 * now default company_id: 1, company: "YODY"
 * hidden 2 fields company_id and company
 */
const ModalOrderServiceSubStatus: React.FC<ModalAddOrderSourceType> = (
  props: ModalAddOrderSourceType
) => {
  const { visible, onCreate, onCancel } = props;
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_STATUS = bootstrapReducer.data?.order_main_status;
  const [form] = Form.useForm();
  const initialFormValue: ModalFormType = {
    company_id: 1,
    company: "YODY",
    sub_status: "",
    status: undefined,
    is_active: false,
    note: "",
  };

  return (
    <Modal
      width="600px"
      className="modal-confirm"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title="Thêm trạng thái xử lý đơn hàng"
      onOk={() => {
        form
          .validateFields()
          .then((values: FulfillmentModel) => {
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
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item name="company_id" label="company_id" hidden>
              <Input
                type="number"
                placeholder="company_id"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item name="company" label="company" hidden>
              <Input placeholder="company" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="sub_status"
              label="Tên trạng thái"
              rules={[
                {
                  required: true,
                  message: "Vui lòng điền tên nguồn đơn hàng !",
                },
                { max: 500, message: "Không được nhập quá 500 ký tự" },
              ]}
            >
              <Input
                placeholder="Nhập tên trạng thái"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái đơn hàng"
              rules={[
                { required: true, message: "Vui lòng chọn trạng thái !" },
              ]}
            >
              <Select
                placeholder="Chọn trạng thái"
                // onChange={this.onGenderChange}
                allowClear
              >
                {LIST_STATUS &&
                  LIST_STATUS.map((singleStatus) => {
                    return (
                      <Select.Option
                        value={singleStatus.value}
                        key={singleStatus.value}
                      >
                        {singleStatus.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item
              name="is_active"
              valuePropName="checked"
              style={{ marginBottom: 10 }}
            >
              <Checkbox>Áp dụng </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="note"
              label="Ghi chú"
              rules={[{ max: 500, message: "Không được nhập quá 500 ký tự" }]}
            >
              <Input.TextArea rows={10} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalOrderServiceSubStatus;
