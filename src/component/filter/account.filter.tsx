import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";
import search from "assets/img/search.svg";
import { FilterWrapper } from "component/container/filter.container";
import { MenuAction } from "component/table/ActionButton";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { AccountSearchQuery } from "model/account/account.model";
import { DepartmentView } from "model/account/department.model";
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
  listDepartment?: Array<DepartmentView>;
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
      console.log(values);
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
      <Form form={formRef} onFinish={onFinish} initialValues={{ ...params, from_date: parseStringToDate(params?.from_date?.toString()), to_date: parseStringToDate(params?.to_date?.toString()) }} layout="inline">
        <FilterWrapper>
          <Form.Item name="info" className="search" style={{ minWidth: 200 }}>
            <Input prefix={<img src={search} alt="" />} placeholder="Tên/Mã nhân viên" />
          </Form.Item>
          <Form.Item name="store_ids" style={{ minWidth: 220 }}>
            <TreeStore name="store_ids" listStore={listStore} form={formRef} />
          </Form.Item>
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
                        style={{ paddingLeft: +18 * single.level }}
                      ></span>
                      {single?.parent?.name && (
                        <span className="hideInDropdown">
                          {single?.parent?.name} -{" "}
                        </span>
                      )}
                      <span className={`${single.level === 0 && "itemParent"}`}>{single.name}</span>
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
        {/* </Form> */}
        <BaseFilter
          onClearFilter={handleClearFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={396}
        >
          <FilterAccountAdvancedStyles>
            {/* <Form onFinish={onFinish} form={formRef} initialValues={{...params,from_date: moment(params.from_date), to_date:moment(params.to_date) }}  layout="vertical"> */}
            <div className="ant-form ant-form-vertical">
            <Row gutter={50}>
              <Col span={24}>
                <Row className="filter-date">
                  <Form.Item name="from_date" label="Thời gian tạo từ" className="filter-date__from">
                    <DatePicker placeholder="20/01/2021" format="DD/MM/YYYY" />
                  </Form.Item>
                  <CgArrowRight />
                  <Form.Item name="to_date" label="Đến" className="filter-date__from">
                    <DatePicker placeholder="25/01/2021" format="DD/MM/YYYY" />
                  </Form.Item>
                </Row>
              </Col>
            </Row>
            <Row gutter={50}>
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
            <Row gutter={50}>
              <Col span={24}>
                <Form.Item name="mobile" label="Số điện thoại">
                  <Input placeholder="Số điện thoại" allowClear />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24}>
                <Form.Item name="status" label="Trạng thái">
                  <Select showArrow placeholder="Trạng thái" allowClear>
                    {listStatus?.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row></div>
            {/* </Form> */}
          </FilterAccountAdvancedStyles>
        </BaseFilter>
      </Form>
    </div>
  );
};

export default AccountFilter;
