import { Button, Form, Input, Select } from "antd";
import { MenuAction } from "component/table/ActionButton";
import React, { useCallback, useEffect } from "react";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import "assets/css/custom-filter.scss";
import { DepartmentResponse } from "model/account/department.model";
import ButtonSetting from "component/table/ButtonSetting";
import CustomSelect from "component/custom/select.custom";
import TreeDepartment from "component/tree-node/tree-department";
import "./index.scss";

const departmentStatus = [
  { value: "active", name: "Đang hoạt động" },
  { value: "inactive", name: "Ngừng hoạt động" },
];

type DepartmentFilterProps = {
  initValue: any;
  params: any;
  onFilter?: (values: any) => void;
  onClearFilter?: () => void;
  onMenuClick?: (index: number) => void;
  actions?: Array<MenuAction>;
  listDepartment?: Array<DepartmentResponse>;
  onClickOpen?: () => void;
};

const { Item } = Form;
const { Option } = Select;
const DepartmentFilter: React.FC<DepartmentFilterProps> = (props: DepartmentFilterProps) => {
  const { onFilter, params, onMenuClick, listDepartment, onClickOpen } = props;
  const [formAvd] = Form.useForm();

  const onFinish = useCallback(
    (values: any) => {
      if (values.content && values.content.trim().length < 3) {
        return;
      }
      onFilter && onFilter(values);
    },
    [onFilter],
  );

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  useEffect(() => {
    const filter = {
      ...params,
    };

    formAvd.setFieldsValue(filter);
  }, [formAvd, params]);

  const validateContent = (rule: any, value: any, callback: any): void => {
    if (!value) {
      callback();
      return;
    }
    if (value.length > 2) {
      callback();
      return;
    }
    callback(`Tìm kiếm từ 3 ký tự.`);
  };

  return (
    <div className="custom-filter-department">
      <CustomFilter onMenuClick={onActionClick}>
        <Form
          className="form-search"
          onFinish={onFinish}
          initialValues={{
            ...params,
            department_ids: Array.isArray(params.department_ids)
              ? params.department_ids
              : typeof params.department_ids === "string"
              ? [params.department_ids]
              : [],
          }}
        >
          <Form.Item
            name="content"
            className="input-search filter"
            rules={[
              {
                validator: validateContent,
              },
            ]}
          >
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Mã phòng ban, tên phòng ban, số điện thoại"
            />
          </Form.Item>
          <Form.Item
            className="filter"
            name="department_ids"
            style={{ maxWidth: 310, minWidth: 250 }}
          >
            <TreeDepartment
              placeholder="Phòng ban trực thuộc"
              listDepartment={listDepartment}
              style={{ width: 300 }}
              treeCheckable={false}
            />
          </Form.Item>
          <Form.Item name="status" className="filter">
            <CustomSelect allowClear showArrow style={{ width: 180 }} placeholder="Trạng thái">
              {departmentStatus?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </CustomSelect>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="filter">
              Lọc
            </Button>
          </Form.Item>
          <Item>
            <ButtonSetting onClick={onClickOpen} />
          </Item>
        </Form>
      </CustomFilter>
    </div>
  );
};

export default DepartmentFilter;
