import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select, TreeSelect,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import React, { createRef, useCallback, useEffect,  useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { StoreQuery, StoreTypeRequest } from "model/core/store.model";
import CustomFilter from "component/table/custom.filter";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { StoreRankResponse } from "model/core/store-rank.model";
import { GroupResponse } from "model/content/group.model";
import NumberInput from "component/custom/number-input.custom";
import "assets/css/custom-filter.scss";
import { DepartmentResponse } from "model/account/department.model";
import ButtonSetting from "component/table/ButtonSetting";
import CustomSelect from "component/custom/select.custom";
import TreeDepartment from "screens/settings/department/component/TreeDepartment";

type StoreFilterProps = {
  initValue: StoreQuery;
  params: StoreQuery;
  onFilter?: (values: StoreQuery) => void;
  onClearFilter?: () => void;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
  storeStatusList?: Array<BaseBootstrapResponse>;
  storeRanks?: Array<StoreRankResponse>;
  groups?: Array<GroupResponse>;
  type?: Array<StoreTypeRequest>;
  listDepartment?: Array<DepartmentResponse>;
  onClickOpen?: () => void;
};

const { Item } = Form;
const { Option } = Select;
const StoreFilter: React.FC<StoreFilterProps> = (props: StoreFilterProps) => {
  const {
    onFilter,
    params,
    actions,
    onMenuClick,
    storeStatusList,
    storeRanks,
    initValue,
    type,
    listDepartment,
    onClickOpen
  } = props;
  const [visible, setVisible] = useState(false);

  const formRef = createRef<FormInstance>();
  const onFinish = useCallback(
    (values: StoreQuery) => {
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
  const onClearFilterAdvanceClick = useCallback(() => {
    formRef.current?.setFieldsValue(initValue);
    formRef.current?.submit();
  }, [formRef, initValue]);
  useEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form
          className="form-search"
          onFinish={onFinish}
          initialValues={{
            ...params,
            department_id: params.department_id ? Number(params.department_id) : null
          }}
          layout="inline"
        >
          <Form.Item name="info" className="input-search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tên/ Mã cửa hàng/ Sđt"
            />
          </Form.Item>
          <Form.Item name="department_id" style={{ maxWidth: 310, minWidth:250 }}>
            <TreeSelect
              placeholder="Chọn trực thuộc"
              treeDefaultExpandAll
              className="selector"
              allowClear
              showSearch
              treeNodeFilterProp='title'
            >
              {listDepartment?.map((item, index) => (
                <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
              ))}
            </TreeSelect>
          </Form.Item>
          <Form.Item name="status">
            <CustomSelect
            allowClear
            showArrow
            style={{ width: 180 }}
            placeholder="Chọn trạng thái">
              {storeStatusList?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </CustomSelect>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter}>Thêm bộ lọc</Button>
          </Form.Item>
          <Item>
              <ButtonSetting onClick={onClickOpen} />
            </Item>
        </Form>
      </CustomFilter>
      <BaseFilter
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={396}
      >
        <Form
          onFinish={onFinish}
          ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Item name="rank" label="Phân cấp">
            <Select placeholder="Chọn phân cấp">
              <Option value="">Chọn phân cấp</Option>
              {storeRanks?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.code}
                </Option>
              ))}
            </Select>
          </Item>
          <Item name="type" label="Phân loại">
            <Select placeholder="Chọn loại cửa hàng">
              <Option value="">Chọn tất cả</Option>
              {type?.map((item, index) => (
                <Option key={index} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>
          <Item name="hotline" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Item>
          <Row gutter={24}>
            <Col span={12}>
              <Item name="from_begin_date" label="Ngày mở cừa từ">
                <DatePicker style={{width: '100%'}} placeholder="Ngày mở cửa từ" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name="to_begin_date" label="Đến">
                <DatePicker style={{width: '100%'}} placeholder="Đến" />
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Item name="from_square" label="Diện tích từ">
                <NumberInput placeholder="Diện tích từ" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name="to_square" label="Đến">
                <NumberInput placeholder="Đến" />
              </Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </div>
  );
};

export default StoreFilter;
