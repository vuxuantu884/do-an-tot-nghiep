import { Button, Form, Input, Modal, Radio, Space } from "antd";
import CustomSelect from "component/custom/select.custom";
import useHandleFilterConfigs from "hook/useHandleFilterConfigs";
import React, { useCallback, useEffect, useState } from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  filterType: string,
  visible: boolean;
  onOk: (values: any) => void;
  setVisible: (isVisible: boolean) => void;
};

const FILTER_TYPE_CONSTANT = {
  NEW: 1,
  UPDATE: 2,
};

type FormValueType = {
  name: string | undefined;
  save_filter_type: number | undefined;
};

function FilterConfigModal(props: PropTypes) {
  const { visible, setVisible, onOk, filterType } = props;
  const [form] = Form.useForm();

  const initialFormValues: FormValueType = {
    name: undefined,
    save_filter_type: FILTER_TYPE_CONSTANT.NEW,
  };

  const [filterTypeRadio, setFilterTypeRadio] = useState<number>(1);

  const onChangeSaveFilterType = useCallback((e) => {
    setFilterTypeRadio(e.target.value);
  }, []);

  const { filterConfigs } = useHandleFilterConfigs(
    filterType,
    form,
  );

  // const getData = useCallback(() => {
  //   setLstFilterConfig(lstConfigFilter);
  // }, [lstConfigFilter]);

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
                  onChange={onChangeSaveFilterType}
                  value={filterTypeRadio}
                  className="display-block"
                >
                  <Space direction="vertical" className="display-block">
                    <Radio
                      value={FILTER_TYPE_CONSTANT.NEW}
                      className="display-block"
                    >
                      Lưu bộ lọc mới
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
                    </Radio>
                    <Radio
                      value={FILTER_TYPE_CONSTANT.UPDATE}
                      className="display-block"
                    >
                      Lưu vào bộ lọc đã có
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
                    </Radio>
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
