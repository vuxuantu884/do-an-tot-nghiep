import {
  Button,
  Checkbox,
  Form,
  FormInstance,
  Input,
  Modal,
  Select,
} from "antd";
import { actionFetchListOrderSourceCompanies } from "domain/actions/settings/order-sources.action";
import { modalActionType } from "model/modal/modal.model";
import {
  OrderSourceCompanyModel,
  OrderSourceModel,
} from "model/response/order/order-source.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ModalDeleteConfirm from "../ModalDeleteConfirm";
import { StyledComponent } from "./styles";

type ModalOrderSourceType = {
  visible?: boolean;
  onCreate: (value: OrderSourceModel) => void;
  onEdit: (id: number, value: OrderSourceModel) => void;
  onDelete: (value: OrderSourceModel) => void;
  onCancel: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
  modalAction?: modalActionType;
  modalSingleOrderSource: OrderSourceModel | null;
};

type ModalFormType = {
  channel_id: number;
  company_id?: number;
  id?: number;
  name?: string;
  is_active?: boolean;
  is_default?: boolean;
};

/**
 * now default company_id: 1, company: "YODY"
 * channel_id = 4, channel = Admin
 * hidden 2 fields company_id and company
 */
const ModalOrderSource: React.FC<ModalOrderSourceType> = (
  props: ModalOrderSourceType
) => {
  const {
    visible,
    onCreate,
    onDelete,
    onEdit,
    onCancel,
    modalAction,
    modalSingleOrderSource,
  } = props;
  const isCreateForm = modalAction === "create";
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const [form] = Form.useForm();
  const initialFormValue: ModalFormType =
    !isCreateForm && modalSingleOrderSource
      ? {
          channel_id: 4,
          company_id: modalSingleOrderSource.id,
          id: modalSingleOrderSource.id,
          name: modalSingleOrderSource.name,
          is_active: modalSingleOrderSource.is_active,
          is_default: modalSingleOrderSource.is_default,
        }
      : {
          channel_id: 4,
          company_id: undefined,
          id: undefined,
          name: "",
          is_active: false,
          is_default: false,
        };
  const dispatch = useDispatch();

  const [listOrderCompanies, setListOrderCompanies] = useState<
    OrderSourceCompanyModel[]
  >([]);

  const formAction = {
    exit: (form: FormInstance<any>) => {
      form.resetFields();
      onCancel();
    },
    create: (form: FormInstance<any>) => {
      form
        .validateFields()
        .then((values: OrderSourceModel) => {
          form.resetFields();
          onCreate(values);
        })
        .catch((info) => {
          console.log("Validate Failed:", info);
        });
    },
    delete: (values: OrderSourceModel) => {
      onDelete(values);
    },
    edit: (form: FormInstance<any>) => {
      if (modalSingleOrderSource) {
        form
          .validateFields()
          .then((values: OrderSourceModel) => {
            form.resetFields();
            onEdit(modalSingleOrderSource.id, values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }
    },
  };

  const renderModalFooter = (form: FormInstance<any>) => {
    const content = () => {
      if (isCreateForm) {
        return (
          <div className="footer footer__create">
            <Button
              key="exit"
              type="default"
              onClick={() => formAction.exit(form)}
            >
              Thoát
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={() => formAction.create(form)}
            >
              Thêm
            </Button>
          </div>
        );
      }
      return (
        <div className="footer footer__edit">
          <div className="footer__left">
            <Button
              key="delete"
              type="primary"
              danger
              onClick={() => setIsShowConfirmDelete(true)}
            >
              Xóa
            </Button>
          </div>
          <div className="footer__right">
            <Button
              key="exit"
              type="default"
              onClick={() => formAction.exit(form)}
            >
              Thoát
            </Button>
            <Button
              key="save"
              type="primary"
              onClick={() => formAction.edit(form)}
            >
              Lưu
            </Button>
          </div>
        </div>
      );
    };
    return <StyledComponent>{content()}</StyledComponent>;
  };

  const renderConfirmDeleteSubtitle = () => {
    if (modalSingleOrderSource) {
      return (
        <React.Fragment>
          Bạn có chắc chắn muốn xóa "
          <strong>{modalSingleOrderSource.name}</strong>" ?
        </React.Fragment>
      );
    }
  };

  useEffect(() => {
    // if(modalAction !== 'edit') {
    /**
     * when dispatch action, call function (handleData) to handle data
     */
    dispatch(
      actionFetchListOrderSourceCompanies((data: OrderSourceCompanyModel[]) => {
        setListOrderCompanies(data);
      })
    );
    // }
  }, [dispatch, modalAction]);

  useEffect(() => {
    form.resetFields();
  }, [form, modalSingleOrderSource]);

  return (
    <Modal
      width="600px"
      className="modal-confirm"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title="Thêm nguồn đơn hàng"
      footer={renderModalFooter(form)}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <StyledComponent>
        <Form
          form={form}
          name="control-hooks"
          layout="vertical"
          initialValues={initialFormValue}
        >
          <Form.Item name="channel_id" label="channel_id" hidden>
            <Input
              type="number"
              placeholder="channel_id"
              style={{ width: "100%" }}
            />
          </Form.Item>
          {listOrderCompanies?.length && (
            <Form.Item
              name="company_id"
              label="Doanh nghiệp"
              rules={[
                { required: true, message: "Vui lòng chọn doanh nghiệp !" },
              ]}
            >
              <Select
                placeholder="Chọn doanh nghiệp"
                // onChange={this.onGenderChange}
                allowClear
              >
                {listOrderCompanies &&
                  listOrderCompanies.map((singleOrderCompany) => {
                    return (
                      <Select.Option
                        value={singleOrderCompany.id}
                        key={singleOrderCompany.id}
                      >
                        {singleOrderCompany.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Tên nguồn đơn hàng"
            rules={[
              { required: true, message: "Vui lòng điền tên nguồn đơn hàng !" },
              { max: 500, message: "Không được nhập quá 500 ký tự" },
            ]}
          >
            <Input
              placeholder="Nhập tên nguồn đơn hàng"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="is_active"
            valuePropName="checked"
            style={{ marginBottom: 10 }}
          >
            <Checkbox>Áp dụng cho đơn hàng</Checkbox>
          </Form.Item>
          <Form.Item
            name="is_default"
            valuePropName="checked"
            style={{ marginBottom: 10 }}
          >
            <Checkbox>Đặt làm mặc định</Checkbox>
          </Form.Item>
        </Form>
        {modalSingleOrderSource && (
          <ModalDeleteConfirm
            visible={isShowConfirmDelete}
            onOk={() => formAction.delete(modalSingleOrderSource)}
            onCancel={() => setIsShowConfirmDelete(false)}
            title="Xác nhận"
            subTitle={renderConfirmDeleteSubtitle()}
          />
        )}
      </StyledComponent>
    </Modal>
  );
};

export default ModalOrderSource;
