import { Checkbox, Col, Form, Input, InputNumber, Row, TreeSelect } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CustomModalFormModel } from "model/modal/modal.model";
import React, { useEffect, useState } from "react";
import * as CONSTANTS from "utils/Constants";
import { StyledComponent } from "./styles";
import TreeDepartment from "screens/settings/department/component/TreeDepartment";
import { strForSearch } from "utils/StringUtils";

type FormValuesType = {
  company_id: number;
  company: string;
  name: string;
  department_id: string;
  department: string;
  channel_id: number;
  is_active: boolean;
  is_default: boolean;
  reference_id?: number;
};

const FormOrderSource: React.FC<CustomModalFormModel> = (props: CustomModalFormModel) => {
  const DEFAULT_COMPANY = {
    company_id: CONSTANTS.DEFAULT_COMPANY.company_id,
    company: CONSTANTS.DEFAULT_COMPANY.company,
  };

  const { modalAction, formItem, form, visible, moreFormArguments } = props;

  const { listDepartments } = moreFormArguments;
  const [isVisibleFieldDefault, setIsVisibleFieldDefault] = useState(false);
  const [departmentsForSource, setDepartmentsForSource] = useState<Array<object>>([]);
  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValues: FormValuesType =
    !isCreateForm && formItem
      ? {
        channel_id: formItem.channel_id,
        company_id: formItem.company_id,
        company: DEFAULT_COMPANY.company,
        name: formItem.name,
        department_id: formItem.department_id,
        department: formItem.department,
        is_active: formItem.active,
        is_default: formItem.default,
        reference_id: formItem.reference_id,
      }
      : {
        channel_id: undefined,
        company_id: DEFAULT_COMPANY.company_id,
        company: DEFAULT_COMPANY.company,
        name: "",
        department_id: undefined,
        department: "",
        is_active: false,
        is_default: false,
        reference_id: undefined,
      };

  /**
   * when change company, set visible field Default
   */
  const handleChangeCheckFieldActive = (checkedValue: CheckboxChangeEvent) => {
    setIsVisibleFieldDefault(checkedValue.target.checked);
    if (!checkedValue.target.checked) {
      form.setFieldsValue({ is_default: false });
    }
  };

  useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  useEffect(() => {
    if (form.getFieldValue("is_active")) {
      setIsVisibleFieldDefault(true);
    } else {
      setIsVisibleFieldDefault(false);
    }
  }, [form, visible]);

  const filterDepartmentLevelThree = (newList: Array<Object>, list: Array<Object>) => {
    list.forEach((i: any) => {
      if (i.level === 3) newList.push(i);
      if (i.children.length > 0) filterDepartmentLevelThree(newList, i.children);
    });
  };

  useEffect(() => {
    if (listDepartments.length === 0) return;

    let newDepartments: Array<object> = [];

    filterDepartmentLevelThree(newDepartments, listDepartments);

    setDepartmentsForSource(newDepartments);
    // eslint-disable-next-line
  }, [listDepartments]);

  const getDepartmentName = (list: any, value: any): any => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === value) {
        return list[i].name;
      }

      if (list[i].children.length > 0) return getDepartmentName(list[i].children, value);
    }
  };

  return (
    <StyledComponent>
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValues}
      >
        <Form.Item name="channel_id" label="channel_id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="company_id" label="company_id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="company" label="company" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="department" hidden noStyle>
          <Input />
        </Form.Item>
        <Row gutter={30}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên nguồn đơn hàng"
              rules={[
                { required: true, message: "Vui lòng điền tên nguồn đơn hàng!" },
                { max: 255, message: "Không được nhập quá 255 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên nguồn đơn hàng" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={30}>
          <Col span={24}>
            <Form.Item
              name="department_id"
              label="Phòng ban"
              rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}
            >
              <TreeSelect
                placeholder="Chọn phòng ban"
                treeDefaultExpandAll
                className="selector"
                allowClear
                showSearch
                notFoundContent="Không tìm thấy phòng ban"
                treeNodeFilterProp='title'
                onChange={(value: any) => {
                  let name: string = getDepartmentName(departmentsForSource, value);
                  form.setFieldsValue({ department: name });
                }}
                filterTreeNode={(input: String, option: any) => {
                  if (option.value) {
                    return strForSearch(option.title).includes(strForSearch(input));
                  }

                  return false;
                }}
              >
                {departmentsForSource?.map((item: any, index: number) => (
                  <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
                ))}
              </TreeSelect>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              name="reference_id"
              label="Mã tham chiếu"
            >
              <InputNumber style={{ width: "100%" }} maxLength={10} placeholder="Nhập mã tham chiếu" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="is_active" valuePropName="checked" style={{ marginBottom: 10 }}>
          <Checkbox onChange={handleChangeCheckFieldActive}>
            Áp dụng cho đơn hàng
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="is_default"
          valuePropName="checked"
          style={{ marginBottom: 0 }}
          className={isVisibleFieldDefault ? "show" : "hidden"}
        >
          <Checkbox>Đặt làm mặc định</Checkbox>
        </Form.Item>
      </Form>
    </StyledComponent>
  );
};

export default FormOrderSource;
