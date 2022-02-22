import { Button, Form, Input, Select } from "antd";
import "assets/css/custom-filter.scss";
import search from "assets/img/search.svg";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { AppConfig } from "config/app.config";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { DistrictResponse } from "model/content/district.model";
import { SupplierQuery } from "model/core/supplier.model";
import { useCallback, useEffect, useState } from "react";
import BaseFilter from "./base.filter";
import CustomSelectOne from "./component/select-one.custom";
import {trimText} from "../../utils/AppUtils";

type SupplierFilterProps = {
  initValue: SupplierQuery;
  params: SupplierQuery;
  onFilter?: (values: SupplierQuery) => void;
  supplierStatus?: Array<BaseBootstrapResponse>;
  listSupplierType?: Array<BaseBootstrapResponse>;
  scorecard?: Array<BaseBootstrapResponse>;
  listDistrict?: Array<DistrictResponse>;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
};

const { Item } = Form;
const { Option } = Select;

const SupplierFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const {
    onFilter,
    params,
    initValue,
    listSupplierType,
    supplierStatus,
    scorecard,
    listDistrict,
    actions,
    onMenuClick,
  } = props;
  const [visible, setVisible] = useState(false);
  const [formAdvance] = Form.useForm();
  // const formRef = createRef<FormInstance>();

  const onFinish = useCallback(
    (values: SupplierQuery) => {
      onFilter && onFilter({...values, condition: trimText(values.condition)});
    },
    [onFilter]
  );
  const getStatusObjFromEnum= () => {
  const statusObj:any = {};
  if (supplierStatus) {
    supplierStatus.forEach(item => {
      statusObj[item.value] = item.name;
    });
  }
  return statusObj;
  }
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvance.submit();
  }, [formAdvance]);
  const onClearFilterAdvanceClick = useCallback(() => {
    formAdvance.setFieldsValue(initValue);
    setVisible(false);
    formAdvance.submit();
  }, [formAdvance, initValue]);
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
  useEffect(() => {
    if (visible) {
      formAdvance.resetFields();
    }

    formAdvance.setFieldsValue({
      district_id: params.district_id,
    });
  }, [formAdvance, listDistrict, params.district_id, visible]);

  return (
    <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Form.Item name="condition" style={{ flex: 1 }}>
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo tên, mã, số điện thoại nhà cung cấp"
            />
          </Form.Item>

          <Form.Item name="pics" style={{
                width: 200,
              }}>
          <AccountSearchPaging placeholder="Chọn Merchandiser" mode="multiple" fixedQuery={{department_ids: [AppConfig.WIN_DEPARTMENT]}}/>
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
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={396}
      >
        <Form
          form={formAdvance}
          onFinish={onFinish}
          //ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Item name="status" label="Trạng thái">
              <CustomSelectOne span={12} data={getStatusObjFromEnum()} />
          </Item>

          <Form.Item label="Thông tin liên hệ" name="contact">
            <Input placeholder="Tên/SDT người liên hệ" />
          </Form.Item>

          <Item label="Khu vực" name="district_id">
            <Select allowClear showSearch placeholder="Chọn khu vực" optionFilterProp="children">
              {listDistrict?.map((item) => (
                <Option key={item.id} value={item.id.toString()}>
                  {item.city_name} - {item.name}
                </Option>
              ))}
            </Select>
          </Item>

          <Item name="scorecard" label="Phân cấp">
            <Select placeholder="Chọn phân cấp" allowClear>
              {scorecard?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>

           <Form.Item name="type" label="Loại">
            <Select
              allowClear
              placeholder="Loại nhà cung cấp"
            >
              {listSupplierType?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* <Row gutter={50}>
            <Col span={12}>
              <Item name="from_created_date" label="Ngày tạo từ">
                <CustomDatepicker placeholder="Ngày tạo từ" />
              </Item>
            </Col>
            <Col span={12}>
              <Item label="Đến" name="to_created_date">
                <CustomDatepicker placeholder="Ngày tạo đến" />
              </Item>
            </Col>
          </Row> */}
        </Form>
      </BaseFilter>
    </div>
  );
};

export default SupplierFilter;
