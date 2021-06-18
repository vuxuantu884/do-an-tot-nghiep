import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { AccountSearchQuery } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import CustomFilter from "component/table/custom.filter";

type AccountFilterProps = {
  params: AccountSearchQuery;
  listDepartment?: Array<DepartmentResponse>;
  listPosition?: Array<PositionResponse>;
  listStatus?: Array<BaseBootstrapResponse>;
  listStore?: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: AccountSearchQuery) => void;
  onClearFilter?: () => void;
};

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
    <Card bordered={false}>
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Form.Item name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 200 }}
              placeholder="Tên/Mã nhân viên"
            />
          </Form.Item>
          <Form.Item name="store_ids">
            <Select
              showArrow
              allowClear
              placeholder="Cửa hàng"
              style={{
                width: 200,
              }}
            >
              {listStore?.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="department_ids">
            <Select
              allowClear
              showArrow
              placeholder="Bộ phận"
              style={{
                width: 200,
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
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter}>Thêm bộ lọc</Button>
          </Form.Item>
        </Form>
      </CustomFilter>
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
              <Form.Item name="from_date" label="Thời gian tạo từ">
                <DatePicker placeholder="20/01/2021" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="to_date" label="đến">
                <DatePicker placeholder="25/01/2021" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="position_ids" label="Vị trí">
                <Select showArrow placeholder="Vị trí">
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
              <Form.Item name="mobile" label="Số điện thoại">
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="status" label="Trạng thái">
                <Select showArrow placeholder="Trạng thái">
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
