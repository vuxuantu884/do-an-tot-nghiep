import {
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Row,
  Col,
  Form,
  Input,
  Divider,
  Button,
  FormInstance,
  Modal,InputNumber
} from "antd";
import {
  CreateContact,
  DeleteContact,
  UpdateContact,
} from "domain/actions/customer/customer.action";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { showSuccess } from "utils/ToastUtils";
const { confirm } = Modal;
interface ContactFormProps {
  field?: any;
  remove?: (index: number | number[]) => void;
  index?: number;
  form?: FormInstance<any>;
  isEdit?: boolean;
  reload?: () => void;
  title: string;
}

const ContactForm = ({
  field,
  remove,
  index,
  form,
  isEdit,
  reload,
  title,
}: ContactFormProps) => {
  const params: any = useParams();
  const dispatch = useDispatch();
  const setResultCreate = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Thêm mới liên hệ thành công");
        if (reload) {
          reload();
        }
      }
    },
    [reload]
  );

  const setResultUpdate = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Cập nhật liên hệ thành công");
        if (reload) {
          reload();
        }
      }
    },
    [reload]
  );

  const setResultDelete = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Xóa liên hệ thành công");
        if (reload) {
          reload();
        }
      }
    },
    [reload]
  );

  const handleSave = () => {
    const values: Array<any> = form?.getFieldValue("contacts");
    const value = values.find((_, index) => index === field.key);
    if (value.id !== 0) {
      dispatch(UpdateContact(value.id, params.id, value, setResultUpdate));
    } else {
      dispatch(CreateContact(params.id, value, setResultCreate));
    }
  };
  const handleRemove = (callback: any, field: any) => {
    const values: Array<any> = form?.getFieldValue("contacts");
    const value = values.find((_, index) => index === field.key);
    if (value && value.id !== 0) {
      confirm({
        title: (
          <h4>
            Bạn có chắc chắn xóa địa chỉ liên hệ{" "}
            <span style={{ color: "blue" }}>{value.name}</span> này không?
          </h4>
        ),
        icon: <ExclamationCircleOutlined />,
        content: "",
        okText: "Có",
        okType: "danger",
        cancelText: "Không",
        onOk() {
          dispatch(DeleteContact(value.id, params.id, setResultDelete));
        },
        onCancel() {},
      });
    } else {
      callback(field.name);
    }
  };
  return (
    <Row gutter={30} style={{ padding: "0 15px" }}>
      <Col span={24}>
        <Divider orientation="left">Liên hệ {index}</Divider>
      </Col>
      <Col span={24}>
        <Form.Item
          {...field}
          label={<b>Họ và tên:</b>}
          name={[field.name, "name"]}
        >
          <Input maxLength={255} placeholder="Tên người liên hệ" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          {...field}
          label={<b>Số điện thoại:</b>}
          name={[field.name, "phone"]}
          rules={[
            {
              type: "number",
              min: 0,
              max: 999999999999999,
              message: "Không đúng định dạng số điện thoại",
            },
            {
              required: true,
              message: "Vui lòng nhập số điện thoại",
            },
          ]}
        >
          <InputNumber
                      style={{ borderRadius: 5, width: "100%" }}
                      minLength={9}
                      maxLength={15}
                      placeholder="Nhập số điện thoại"
                    />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          {...field}
          label={<b>Email:</b>}
          name={[field.name, "email"]}
          // rules={[
          //   {
          //     required: true,
          //     message: "Vui lòng nhập thư điện tử",
          //   },
          // ]}
        >
          <Input maxLength={255} placeholder="Thư điện tử" />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          {...field}
          name={[field.name, "company_name"]}
          label={<b>Tên đơn vị:</b>}
        >
          <Input maxLength={255} placeholder="Nhập tên liên hệ" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "website"]} label={<b>Website:</b>}>
          <Input maxLength={255} placeholder="Website" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          {...field}
          label={<b>Mã số thuế:</b>}
          name={[field.name, "tax_code"]}
        >
          <Input maxLength={255} placeholder="Mã số thuế" />
        </Form.Item>
      </Col>

      <Col span={24} style={{ padding: "0 1rem" }}>
        <Row gutter={8}>
          {/* <Col span={4}>
            <Form.Item {...field} label="Tiêu đề" name={[field.name, "title"]}>
              <Input placeholder="Tiêu đề" />
            </Form.Item>
          </Col>
           */}

          <Col span={24}>
            <Form.Item {...field} label={<b>Ghi chú:</b>} name={[field.name, "note"]}>
              <Input.TextArea maxLength={500} placeholder="Ghi chú" />
            </Form.Item>
          </Col>
          {isEdit && (
            <Col
              span={1}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Button
                title="Lưu"
                type="text"
                icon={<SaveOutlined />}
                onClick={handleSave}
              ></Button>
            </Col>
          )}
        </Row>
      </Col>
      <Form.Item>
        <Button
          type="link"
          size={"small"}
          icon={<MinusCircleOutlined />}
          onClick={() => handleRemove(remove, field)}
        >
          Xóa {title.toLowerCase()}
        </Button>
      </Form.Item>
    </Row>
  );
};

// ContactForm.propTypes = {
//   field: PropTypes.object.isRequired,
//   remove: PropTypes.func.isRequired,
//   index: PropTypes.number.isRequired,
// };

export default ContactForm;
