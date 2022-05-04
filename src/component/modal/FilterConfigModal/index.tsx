import { Button, Form, Input, Modal, Radio, Space } from "antd";
import CustomSelect from "component/custom/select.custom";
import { FilterConfig } from "model/other";
import React, { useCallback, useEffect, useState } from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  visible: boolean;
  onOk: (values: any) => void;
  setVisible: (isVisible: boolean) => void;
  filterConfigs: FilterConfig[];
};

const FILTER_TYPE_CONSTANT = {
  NEW: 1,
  UPDATE: 2,
};

type FormValueType = {
  id: string | undefined;
  name: string | undefined;
  save_filter_type: number | undefined;
};

function FilterConfigModal(props: PropTypes) {
  const { visible, setVisible, onOk, filterConfigs } = props;
  const [form] = Form.useForm();

  const initialFormValues: FormValueType = {
    id: undefined,
    name: undefined,
    save_filter_type: FILTER_TYPE_CONSTANT.NEW,
  };

  const [filterTypeRadio, setFilterTypeRadio] = useState<number>(1);

  const onChangeSaveFilterType = useCallback((e) => {
    setFilterTypeRadio(e.target.value);
    form.setFieldsValue({
      save_filter_type: e.target.value
    })
  }, [form]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [form, visible]);

  const renderModalFooter = () => {
    const content = () => {
      return (
        <div className="footer">
          <div className="footer__left"></div>
          <div className="footer__right">
            <Button key="exit" type="default" onClick={() => setVisible(false)}>
              Đóng
            </Button>
            <Button
              key="save"
              type="primary"
              onClick={() => {
                form.validateFields().then(() => {
                  const values = form.getFieldsValue();
                  if(values.save_filter_type === FILTER_TYPE_CONSTANT.NEW) {
                    values.id = undefined;
                  }
                  onOk(values);
                });
              }}
            >
              Lưu
            </Button>
          </div>
        </div>
      );
    };
    return <StyledComponent>{content()}</StyledComponent>;
  };

  return (
    <StyledComponent>
      <Modal
        width="680px"
        className="modal-confirm"
        visible={visible}
        okText="Lưu lại"
        cancelText="Thoát"
        title="Lưu bộ lọc"
        footer={renderModalFooter()}
        onCancel={() => setVisible(false)}
      >
        <StyledComponent>
          <Form
            form={form}
            name="control-hooks"
            layout="vertical"
            initialValues={initialFormValues}
          >
            <div>
              <Form.Item name="save_filter_type">
                <Radio.Group
                  value={filterTypeRadio}
                  className="display-block"
                >
                  <Space direction="vertical" className="display-block">
                    <Radio
                      value={FILTER_TYPE_CONSTANT.NEW}
                      className="display-block"
                      onChange={onChangeSaveFilterType}
                    >
                      Lưu bộ lọc mới
                    </Radio>
                    <Form.Item
                      name="name"
                      rules={[
                        {
                          required:
                            filterTypeRadio === FILTER_TYPE_CONSTANT.NEW
                              ? true
                              : false,
                          message: "Bạn chưa nhập tên bộ lọc mới",
                        },
                        {
                          max: 50,
                          message: "Tên bộ lọc mới không vượt quá 50 ký tự",
                        },
                      ]}
                    >
                      <Input
                        className="item-radio-option"
                        placeholder="Nhập tên bộ lọc mới"
                      />
                    </Form.Item>
                    <Radio
                      value={FILTER_TYPE_CONSTANT.UPDATE}
                      className="display-block"
                      onChange={onChangeSaveFilterType}
                    >
                      Lưu vào bộ lọc đã có
                    </Radio>
                    <div className="item-radio-option">
                      <Form.Item
                        name="id"
                        rules={[
                          {
                            required:
                            filterTypeRadio === FILTER_TYPE_CONSTANT.UPDATE
                                ? true
                                : false,
                            message: "Bạn chưa chọn tên bộ lọc",
                          },
                        ]}
                      >
                        <CustomSelect
                          showArrow
                          allowClear
                          showSearch
                          placeholder="Chọn tên bộ lọc"
                          notFoundContent="Không tìm thấy kết quả"
                          style={{
                            width: "100%",
                          }}
                          optionFilterProp="children"
                          getPopupContainer={(trigger) => trigger.parentNode}
                          maxTagCount="responsive"
                        >
                          {filterConfigs?.map((item) => (
                            <CustomSelect.Option
                              key={item.id}
                              value={item.id.toString()}
                            >
                              {item.name}
                            </CustomSelect.Option>
                          ))}
                        </CustomSelect>
                      </Form.Item>
                    </div>
                  </Space>
                </Radio.Group>
                <div
                  className={`${
                    filterTypeRadio === FILTER_TYPE_CONSTANT.UPDATE && "red"
                  } text-info`}
                >
                  Bộ lọc được lưu sẽ hiển thị ở dạng nút chọn trong Popup{" "}
                  <b>“Thêm bộ lọc”</b>
                </div>
              </Form.Item>
            </div>
          </Form>
        </StyledComponent>
      </Modal>
    </StyledComponent>
  );
}

export default FilterConfigModal;
