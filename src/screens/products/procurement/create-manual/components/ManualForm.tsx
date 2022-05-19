import { PhoneOutlined } from '@ant-design/icons';
import { Card, FormInstance, Row, Typography, Form, Select, Col, Input, Button } from 'antd';
import CustomAutoComplete from 'component/custom/autocomplete.cusom';
import UrlConfig from 'config/url.config';
import { isEmpty } from 'lodash';
import { AccountStoreResponse } from 'model/account/account.model';
import { SupplierResponse } from 'model/core/supplier.model';
import { POField } from 'model/purchase-order/po-field';
import { PurchaseOrder } from 'model/purchase-order/purchase-order.model';
import { POProcumentField } from 'model/purchase-order/purchase-procument';
import React, { useMemo } from 'react'
import { AiOutlineClose } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import SupplierItem from 'screens/purchase-order/component/supplier-item';


interface ProcurementManualFormProps {
  formMain: FormInstance;
  accountStores: AccountStoreResponse[];
  data: SupplierResponse[];
  listPO: PurchaseOrder[];
  isSelectSupplier: boolean;
  loadingSearch: boolean;
  poDisable: boolean;
  poLoading: boolean;
  onChangeKeySearchSupplier: (keyword: string) => void;
  onChangeStore: (value: any) => void;
  removeSupplier: () => void;
  onSelect: (value: string) => void;
  removePOCode: () => void;
  onSelectPO: (value: any) => void;
}

const ManualForm: React.FC<ProcurementManualFormProps> = (props: ProcurementManualFormProps) => {
  const {
    onChangeStore,
    accountStores,
    isSelectSupplier,
    removeSupplier,
    loadingSearch,
    onChangeKeySearchSupplier,
    onSelect,
    data,
    listPO,
    removePOCode,
    onSelectPO,
    poLoading,
    poDisable
  } = props

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: SupplierResponse, index: number) => {
      options.push({
        label: <SupplierItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });

    return options;
  }, [data]);
  return (
    <Card>
      <Row gutter={50}>
        <Col span={8}>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues[POProcumentField.supplier_id] !== curValues[POProcumentField.supplier_id]
            }
            className="margin-bottom-0">
            {({ getFieldValue }) => {
              let supplier_id = getFieldValue([POProcumentField.supplier_id]);
              let supplier = getFieldValue([POProcumentField.supplier]);
              let phone = getFieldValue([POProcumentField.supplier_phone])
              return (
                <>
                  {((isSelectSupplier) || supplier_id) ? (
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ display: 'flex', alignItems: "center" }}>
                        <Link
                          to={`${UrlConfig.SUPPLIERS}/${supplier_id}`}
                          className="primary"
                          target="_blank"
                          style={{ fontSize: "16px", marginRight: 10 }}>
                          {supplier}
                        </Link>
                        {isSelectSupplier && (
                          <Button type="link" onClick={removeSupplier} style={{ display: "flex", alignItems: "center" }} icon={<AiOutlineClose />} />
                        )}
                      </div>
                      <>
                        <Form.Item hidden name={[POProcumentField.supplier_id]}>
                          <Input />
                        </Form.Item>
                        <Form.Item hidden name={[POProcumentField.supplier]}>
                          <Input />
                        </Form.Item>
                        <Form.Item hidden name={[POProcumentField.supplier_phone]}>
                          <Input />
                        </Form.Item>
                        <Row>
                          <div><PhoneOutlined />{" "} <Typography.Text strong>{phone}</Typography.Text></div>
                        </Row>
                      </>
                    </div>
                  ) : <><Typography.Text strong>Chọn nhà cung cấp</Typography.Text><span style={{ color: 'red' }}> *</span>
                    <Form.Item
                      name={[POProcumentField.supplier_id]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn nhà cung cấp",
                        },
                      ]}>
                      <CustomAutoComplete
                        loading={loadingSearch}
                        dropdownClassName="supplier"
                        placeholder="Tìm kiếm nhà cung cấp"
                        onSearch={onChangeKeySearchSupplier}
                        dropdownMatchSelectWidth={456}
                        style={{ width: "100%" }}
                        onSelect={(value) => {
                          if (!value) return
                          onSelect(value)
                        }}
                        options={renderResult}
                      />
                    </Form.Item>
                  </>}
                </>
              );
            }}
          </Form.Item>
        </Col>
        <Col span={8}>

          <Form.Item
            // name={[POField.code]}
            shouldUpdate={(prevValues, curValues) =>
              prevValues[POField.code] !== curValues[POField.code]
            }
            className="margin-bottom-0"
          >
            {({ getFieldValue }) => {
              let po_code = getFieldValue([POField.code]);
              let po_id = getFieldValue([POField.id]);
              let po_reference = getFieldValue([POField.reference]);
              return (
                <>
                  {(po_code) ? (
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ display: 'flex', alignItems: "center" }}>
                        <div>Đơn đặt hàng: </div>
                        <Link
                          to={`${UrlConfig.PURCHASE_ORDERS}/${po_id}`}
                          className="primary"
                          target="_blank"
                          style={{ fontSize: "16px", marginRight: 10, marginLeft: 5 }}>
                          {po_code}
                        </Link>
                        {po_code && (
                          <Button type="link" onClick={removePOCode} style={{ display: "flex", alignItems: "center" }} icon={<AiOutlineClose />} />
                        )}
                      </div>
                      <>
                        <Form.Item hidden name={[POField.reference]}>
                          <Input />
                        </Form.Item>
                        <Form.Item hidden name={[POField.id]}>
                          <Input />
                        </Form.Item>
                        <Form.Item hidden name={[POField.code]}>
                          <Input />
                        </Form.Item>
                        <Row>
                          <div>Mã tham chiếu:{" "} <Typography.Text strong>{po_reference}</Typography.Text></div>
                        </Row>
                      </>
                    </div>
                  ) : (
                    <>
                      <Typography.Text strong>Chọn đơn đặt hàng </Typography.Text><span style={{ color: 'red' }}>*</span>
                      <Form.Item
                        name={[POField.code]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn đơn đặt hàng",
                          },
                        ]}>
                        <Select
                          allowClear
                          showSearch
                          showArrow
                          optionFilterProp="children"
                          placeholder="Chọn đơn đặt hàng"
                          loading={poLoading}
                          disabled={poDisable}
                          // onChange={(value) => formMain.setFieldsValue({ [POField.code]: value })}
                          onSelect={(value) => {
                            if (!value) return
                            onSelectPO(value)
                          }}
                        >
                          {!isEmpty(listPO) && listPO.map((item) => (
                            <Select.Option key={item.id} value={item.id || 0}>
                              {item.code}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  )}
                </>
              )
            }}

          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item hidden name={[POProcumentField.store]}>
            <Input />
          </Form.Item>
          <Typography.Text strong>Chọn kho nhận </Typography.Text><span style={{ color: 'red' }}>*</span>
          <Form.Item
            name={[POProcumentField.store_id]}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn kho nhận hàng",
              },
            ]}
          >
            <Select
              allowClear
              showSearch
              showArrow
              optionFilterProp="children"
              placeholder="Chọn kho nhận"
              onChange={onChangeStore}
            >
              {!isEmpty(accountStores) && accountStores.map((item) => (
                <Select.Option key={item.id} value={item.store_id || 0}>
                  {item.store}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

      </Row>
      <Row gutter={50}>
        <Col span={24}>
          <Typography.Text strong>Ghi chú</Typography.Text>
          <Form.Item name={POProcumentField.note}>
            <Input placeholder="Nhập ghi chú" />
          </Form.Item>
        </Col>


      </Row>
    </Card>
  )
}

export default ManualForm