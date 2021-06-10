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
import { StoreResponse } from "model/response/store.response";
import { BaseBootstrapResponse } from "model/response/bootstrap/BaseBootstrapResponse";

type AccountFilterProps = {
  params: AccountSearchQuery;
  listDepartment?: Array<DepartmentResponse>;
  listPosition?: Array<DepartmentResponse>;
  listStatus?:Array<BaseBootstrapResponse>;
  listStore?:Array<StoreResponse>;
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
    listStatus,
    listStore,
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
              placeholder="Tên/Mã nhân viên"
            />
          </Form.Item>
          <Form.Item
            className="form-group form-group-with-search"
            name="store_ids"
          >
            <Select
              showArrow
              className="select-with-search"
              placeholder="Cửa hàng"
              style={{
                width: 250,
              }}
            >
              {listStore?.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            className="form-group form-group-with-search"
            name="department_ids"
          >
            <Select
              showArrow
              className="select-with-search"
              placeholder="Bộ phận"
              style={{
                width: 250,
              }}
            >
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
                name="from_date"
                label="Thời gian tạo từ"
              >
                <DatePicker
                  className="r-5 w-100 ip-search"
                  placeholder="20/01/2021"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                className="form-group form-group-with-search"
                name="to_date"
                label="đến"
              >
                <DatePicker
                  className="r-5 w-100 ip-search"
                  placeholder="25/01/2021"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="position_ids"
                label="Vị trí"
              >
                <Select
                  showArrow
                  className="select-with-search"
                  placeholder="Vị trí"
                >
                  {listPosition?.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="mobile"
                label="Số điện thoại"
              >
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="status"
                label="Trạng thái"
              >
                <Select
                  showArrow
                  className="select-with-search"
                  placeholder="Trạng thái"
                >
                  {listStatus?.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </Card>
  );
};

export default AccountFilter;
