import { Button, Row, Col, Form, Input, Collapse } from "antd";

import { MenuAction } from "component/table/ActionButton";
import { ReactNode, useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import CustomRangepicker from "component/filter/component/range-picker.custom";
import CustomSelect from "component/custom/select.custom";
import { AccountResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { SwapRightOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

type PurchaseOrderFilterProps = {
  params: PurchaseOrderQuery;
  listSupplierAccount?: Array<AccountResponse>;
  listRdAccount?: Array<AccountResponse>;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: PurchaseOrderQuery) => void;
  onClearFilter?: () => void;
};

const { Item } = Form;

const listPOStatus = [
  {
    key: "draft",
    value: "Nháp",
  },
  {
    key: "finalized",
    value: "Đã xác nhận",
  },
  {
    key: "completed",
    value: "Đã hoàn thành",
  },
  {
    key: "finished",
    value: "Đã kết thúc",
  },
  {
    key: "cancelled",
    value: "Đã hủy",
  },
];

const PurchaseOrderFilter: React.FC<PurchaseOrderFilterProps> = (
  props: PurchaseOrderFilterProps
) => {
  const {
    params,
    actions,
    listSupplierAccount,
    listRdAccount,
    listStore,
    onMenuClick,
    onClearFilter,
    onFilter,
  } = props;
  const [visible, setVisible] = useState(false);

  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();
  const onBaseFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      debugger;
      let data = formBaseFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formBaseFilter, onFilter]
  );
  const onAdvanceFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      debugger;
      let data = formAdvanceFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formAdvanceFilter, onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    formAdvanceFilter.resetFields();
    setVisible(false);
  }, [formAdvanceFilter]);
  const onResetFilter = useCallback(() => {
    debugger;
    formAdvanceFilter.setFieldsValue({ supplier_id: undefined });
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
  useLayoutEffect(() => {
    // if (visible) {
    //   formBaseFilter.resetFields();
    //   formAdvanceFilter.resetFields();
    // }
    // return () => {
    //   formBaseFilter.resetFields();
    //   formAdvanceFilter.resetFields();
    // };
  }, [formAdvanceFilter, formBaseFilter, visible]);

  return (
    <div className="purchase-order-form">
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          debugger;
          const { formBaseFilter, formAdvanceFilter } = forms;
          let baseValues = formBaseFilter.getFieldsValue();
          let advanceValues = formAdvanceFilter?.getFieldsValue();
          formBaseFilter.setFieldsValue({ ...baseValues, ...advanceValues });

          formAdvanceFilter?.setFieldsValue({
            ...baseValues,
            ...advanceValues,
          });
        }}
      >
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            form={formBaseFilter}
            name="formBaseFilter"
            onFinish={onBaseFinish}
            initialValues={params}
            layout="inline"
          >
            <Item name="code">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 400 }}
                placeholder="Tìm kiếm theo ID đơn mua, tên số điện thoại ncc"
              />
            </Item>
            <Item name="code">
              <CustomSelect
                placeholder="Trạng thái đơn hàng"
                notFoundContent="Không tìm thấy kết quả"
              >
                <CustomSelect.Option value="">
                  Trạng thái đơn hàng
                </CustomSelect.Option>
              </CustomSelect>
            </Item>
            <Item name="code">
              <CustomSelect
                placeholder="Nhập kho"
                notFoundContent="Không tìm thấy kết quả"
              >
                <CustomSelect.Option value="">Nhập kho</CustomSelect.Option>
              </CustomSelect>
            </Item>
            <Item name="code">
              <CustomSelect
                placeholder="Thanh toán"
                notFoundContent="Không tìm thấy kết quả"
              >
                <CustomSelect.Option value="">Thanh toán</CustomSelect.Option>
              </CustomSelect>
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button onClick={openFilter}>Thêm bộ lọc</Button>
            </Item>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
        >
          <Form
            form={formAdvanceFilter}
            name="formAdvanceFilter"
            onFinish={onAdvanceFinish}
            initialValues={params}
            layout="vertical"
          >
            <Collapse>
              <Panel header="Ngày tạo đơn" key="1">
                <CustomRangepicker />
              </Panel>
              <Panel header="Ngày duyệt đơn" key="2">
                <CustomRangepicker />
              </Panel>
              <Panel header="Ngày hoàn tất đơn" key="3">
                <CustomRangepicker />
              </Panel>
              <Panel header="Ngày hủy đơn" key="4">
                <CustomRangepicker />
              </Panel>
              <Panel header="Trạng thái đơn" key="5">
                <CustomSelect
                  placeholder="Chọn 1 hoặc nhiều trạng thái"
                  mode="multiple"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {listPOStatus?.map((poStatus, index) => (
                    <CustomSelect.Option key={index} value={poStatus.value}>
                      {poStatus.value}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Panel>
              <Panel header="Nhập kho" key="6">
                <CustomSelect
                  placeholder="Chọn 1 hoặc nhiều trạng thái"
                  mode="multiple"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {listPOStatus?.map((poStatus, index) => (
                    <CustomSelect.Option key={index} value={poStatus.value}>
                      {poStatus.value}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Panel>
              <Panel header="Thanh toán" key="7">
                <CustomSelect
                  placeholder="Chọn 1 hoặc nhiều trạng thái"
                  mode="multiple"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {listPOStatus?.map((poStatus, index) => (
                    <CustomSelect.Option key={index} value={poStatus.value}>
                      {poStatus.value}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Panel>
              <Panel header="Merchandiser" key="8">
                <CustomSelect
                  placeholder="Chọn 1 hoặc nhiều merchandiser"
                  mode="multiple"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                  maxTagCount="responsive"
                >
                  {listSupplierAccount?.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id}>
                      {item.full_name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Panel>
              <Panel header="QC" key="9">
                <CustomSelect
                  placeholder="Chọn 1 hoặc nhiều qc"
                  mode="multiple"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                  maxTagCount="responsive"
                >
                  {listRdAccount?.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id}>
                      {item.full_name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Panel>
              <Panel header="Tổng tiền" key="10">
                <Row
                  style={{ border: "1px #E5E5E5 solid", borderRadius: "5px" }}
                >
                  <Col span="11">
                    <Input placeholder="Từ" bordered={false} />
                  </Col>
                  <Col
                    span="2"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <SwapRightOutlined style={{ color: "#71767B" }} />
                  </Col>
                  <Col span="11">
                    <Input placeholder="Đến" bordered={false} />
                  </Col>
                </Row>
              </Panel>
              <Panel header="Chi phí" key="11">
                <CustomSelect
                  placeholder="Chọn 1 trong 2 đk"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                >
                  <CustomSelect.Option key="1" value="0">
                    Có chi phí
                  </CustomSelect.Option>
                  <CustomSelect.Option key="2" value="1">
                    Không chi phí
                  </CustomSelect.Option>
                </CustomSelect>
              </Panel>
              <Panel header="VAT" key="12">
                <CustomSelect
                  placeholder="Chọn 1 trong 2 đk"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                >
                  <CustomSelect.Option key="1" value="0">
                    Có VAT
                  </CustomSelect.Option>
                  <CustomSelect.Option key="2" value="1">
                    Không VAT
                  </CustomSelect.Option>
                </CustomSelect>
              </Panel>
              <Panel header="Ngày nhận hàng dự kiến" key="13">
                <CustomRangepicker />
              </Panel>
              <Panel header="Kho nhận hàng dự kiến" key="15">
                <CustomSelect
                  placeholder="Kho nhận hàng dự kiến"
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                  mode="multiple"
                  maxTagCount="responsive"
                >
                  {listStore?.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Panel>
              <Panel header="Ghi chú nội bộ" key="15">
                <Input placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
              </Panel>
              <Panel header="Ghi chú nhà cung cấp" key="16">
                <Input placeholder="Tìm kiếm theo nội dung ghi chú nhà cung cấp" />
              </Panel>
              <Panel header="Tag" key="17">
                <Input placeholder="Tìm kiếm theo tag" />
              </Panel>
              <Panel header="Mã tham chiếu" key="18">
                <Input placeholder="Tìm kiếm theo mã tham chiếu" />
              </Panel>
            </Collapse>
          </Form>
        </BaseFilter>
      </Form.Provider>
    </div>
  );
};

export default PurchaseOrderFilter;
