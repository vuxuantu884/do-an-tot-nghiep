import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";
import search from "assets/img/search.svg";
import { FilterWrapper } from "component/container/filter.container";
import { MenuAction } from "component/table/ActionButton";
import TreeDepartment from "component/tree-node/tree-department";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { AccountSearchQuery } from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { StoreResponse } from "model/core/store.model";
import moment from "moment";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { CgArrowRight } from "react-icons/cg";
import { useDispatch } from "react-redux";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { FilterAccountAdvancedStyles } from "screens/settings/account/account.search.style";
import BaseFilter from "./base.filter";

type AccountFilterProps = {
  params: AccountSearchQuery;
  listDepartment?:  DepartmentResponse[] | undefined;
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
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const dispatch = useDispatch();

  const [formRef] = Form.useForm();
  const onFinish = useCallback(
    (values: AccountSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef?.submit();
  }, [formRef]);

  const handleClearFilter = () => {
    formRef?.setFieldsValue({
      from_date: undefined,
      to_date: undefined,
      position_ids: undefined,
      mobile: undefined,
      status: undefined,
    })
    onClearFilter?.();
  }

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const parseStringToDate = (date: string | undefined) => {
    return date ? moment(date) : undefined
  }

  useLayoutEffect(() => {
    if (visible) {
      formRef?.resetFields();
    }
  }, [formRef, visible]);

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((stores) => {
        setListStore(stores);
      })
    );
  }, [dispatch]);

  return (
    <div>
      <Form
        form={formRef}
        onFinish={onFinish}
        initialValues={{
          ...params,
          from_date: parseStringToDate(params?.from_date?.toString()),
          to_date: parseStringToDate(params?.to_date?.toString()),
        }}
        layout="inline">
        <FilterWrapper>
          <Form.Item name="info" className="search" style={{ minWidth: 200 }}>
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tên/Mã nhân viên"
            />
          </Form.Item>

          <Form.Item name="department_ids">
            <TreeDepartment listDepartment={listDepartment} style={{ width: 250}}/>
          </Form.Item>
          <Form.Item name="status" style={{ minWidth: 220 }}>
            <Select showArrow placeholder="Trạng thái" allowClear>
              {listStatus?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
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
            <Button onClick={openFilter} icon={<FilterOutlined />}>
              Thêm bộ lọc
            </Button>
          </Form.Item>
        </FilterWrapper>
        {/* </Form> */}
        <BaseFilter
          onClearFilter={handleClearFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={396}>
          <FilterAccountAdvancedStyles>
            <div className="ant-form ant-form-vertical">
              <Row gutter={50}>
                <Col span={24}>
                  <Row className="filter-date">
                    <Form.Item
                      name="from_date"
                      label="Thời gian tạo từ"
                      className="filter-date__from">
                      <DatePicker
                        placeholder="20/01/2021"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                    <CgArrowRight />
                    <Form.Item
                      name="to_date"
                      label="Đến"
                      className="filter-date__from">
                      <DatePicker
                        placeholder="25/01/2021"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item name="position_ids" label="Vị trí">
                    <Select showArrow placeholder="Vị trí" allowClear>
                      {listPosition?.map((item) => (
                        <Select.Option key={item.id} value={item.id.toString()}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item name="mobile" label="Số điện thoại">
                    <Input placeholder="Số điện thoại" allowClear />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item name="store_ids" label="Cửa hàng">
                    <TreeStore
                      name="store_ids"
                      listStore={listStore}
                      form={formRef}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* <Row>
                <Col span={24}>
                  <Form.Item label="Phân quyền chi tiết">
                    <Checkbox.Group className="group-checkbox-btn">
                      <Checkbox
                        value={true}
                        className="group-checkbox-btn__checkbox">
                        <div className="ant-btn">Có</div>
                      </Checkbox>
                      <Checkbox
                        value={false}
                        className="group-checkbox-btn__checkbox">
                        <div className="ant-btn">Không</div>
                      </Checkbox>
                    </Checkbox.Group>
                  </Form.Item>
                </Col>
              </Row> */}
            </div>
          </FilterAccountAdvancedStyles>
        </BaseFilter>
      </Form>
    </div>
  );
};

export default AccountFilter;
