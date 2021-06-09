import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { DepartmentResponse } from "model/response/accounts/department.response";
import { AccountSearchQuery } from "model/query/account.search.query";

type AccountFilterProps = {
  params: AccountSearchQuery;
  listDepartment?: Array<DepartmentResponse>;
  listPosition?: Array<DepartmentResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: AccountSearchQuery) => void;
  onClearFilter?: () => void;
};

const { Item } = Form;
const { Option } = Select;

const AccountFilter: React.FC<AccountFilterProps> = (
  props: AccountFilterProps
) => {
  const {
    params,
    listDepartment,
    listPosition,
    actions,
    onMenuClick,
    onClearFilter,
    onFilter,
  } = props;
  const [visible, setVisible] = useState(false);

  const formRef = createRef<FormInstance>();
  const onFinish = useCallback(
    (values: AccountSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <Card className="view-control" bordered={false}>
      <Form
        className="form-search"
        onFinish={onFinish}
        initialValues={params}
        layout="inline"
      >
        <ActionButton onMenuClick={onActionClick} menu={actions} />
        <div className="right-form">
          <Form.Item className="form-group form-group-with-search" name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 250 }}
              placeholder="Tên/Mã sản phẩm"
            />
          </Form.Item>
          <Form.Item
            className="form-group form-group-with-search"
            name="barcode"
          >
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 250 }}
              placeholder="Barcode"
            />
          </Form.Item>
          <Form.Item className="form-group form-group-with-search" name="brand">
            <Select 
              className="select-with-search"
              style={{
                width: 250,
              }}
            >
              <Select.Option value="">Thương hiệu</Select.Option>
              {listDepartment?.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="yody-search-button"
            >
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter} className="yody-filter-button">
              Thêm bộ lọc
            </Button>
          </Form.Item>
        </div>
      </Form>
      <BaseFilter
        onClearFilter={onClearFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
      >
        <Form
          onFinish={onFinish}
          ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                className="form-group form-group-with-search"
                name="from_inventory"
                label="Tồn kho từ"
              >
                <InputNumber style={{ width: "100%" }} placeholder="Từ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                className="form-group form-group-with-search"
                name="to_inventory"
                label="đến"
              >
                <InputNumber style={{ width: "100%" }} placeholder="Đến" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </Card>
  );
};

export default AccountFilter;
