import {FilterOutlined} from "@ant-design/icons";
import {Button, Col, DatePicker, Form, FormInstance, Input, Row, Select} from "antd";
import search from "assets/img/search.svg";
import {FilterWrapper} from "component/container/filter.container";
import StoreSearchSelect from "component/custom/select-search/store-select";
import {MenuAction} from "component/table/ActionButton";
import {AccountSearchQuery} from "model/account/account.model";
import {DepartmentResponse} from "model/account/department.model";
import {PositionResponse} from "model/account/position.model";
import {BaseBootstrapResponse} from "model/content/bootstrap.model";
import {StoreResponse} from "model/core/store.model";
import {createRef, useCallback, useLayoutEffect, useState} from "react";
import BaseFilter from "./base.filter";

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

const AccountFilter: React.FC<AccountFilterProps> = (props: AccountFilterProps) => {
  const {
    params,
    listDepartment,
    listPosition,
    listStatus,
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

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
      <Form onFinish={onFinish} initialValues={params} layout="inline">
        <FilterWrapper>
          <Form.Item name="info" className="search" style={{minWidth: 200}}>
            <Input prefix={<img src={search} alt="" />} placeholder="Tên/Mã nhân viên" />
          </Form.Item>
          <StoreSearchSelect name="store_ids" label="" style={{width: 250}}/>
          <Form.Item name="department_ids">
            <Select
              showSearch
              allowClear
              showArrow
              placeholder="Chọn bộ phận"
              optionFilterProp="title"  
              style={{
                width: 250,
              }}
            >
             {listDepartment &&
                  listDepartment.map((single: any) => {
                    return (
                      <Select.Option value={single.id} key={single.id} title={single.name}>
                        <span
                          className="hideInSelect"
                          style={{paddingLeft: +18 * single.level}}
                        ></span>
                        {single?.parent?.name && (
                          <span className="hideInDropdown">
                            {single?.parent?.name} -{" "}
                          </span>
                        )}
                        <span  className={`${single.level === 0 && "itemParent"}`}>{single.name}</span>
                      </Select.Option>
                    );
                  })}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter} icon={<FilterOutlined />}>
              Thêm bộ lọc
            </Button>
          </Form.Item>
        </FilterWrapper>
      </Form>
      <BaseFilter
        onClearFilter={onClearFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={396}
      >
        <Form onFinish={onFinish} ref={formRef} initialValues={params} layout="vertical">
          <Row gutter={50}>
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
          <Row gutter={50}>
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
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item name="mobile" label="Số điện thoại">
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
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
    </div>
  );
};

export default AccountFilter;
