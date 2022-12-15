import { PhoneOutlined } from "@ant-design/icons";
import { Card, FormInstance, Row, Typography, Form, Select, Col, Input, Button } from "antd";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import UrlConfig from "config/url.config";
import { isEmpty } from "lodash";
import { AccountStoreResponse } from "model/account/account.model";
import { SupplierResponse } from "model/core/supplier.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import React, { useMemo } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Link } from "react-router-dom";
import { POProcurementField } from "screens/procurement/helper";
import SupplierItem from "screens/purchase-order/component/supplier-item";

interface ProcurementManualFormProps {
  formMain: FormInstance;
  accountStores: AccountStoreResponse[];
  data: SupplierResponse[];
  listPO: PurchaseOrder[];
  isSelectSupplier: boolean;
  isLoadingSearch: boolean;
  isPODisable: boolean;
  isPOLoading: boolean;
  onChangeKeySearchSupplier: (keyword: string) => void;
  onChangeStore: (value: any) => void;
  removeSupplier: () => void;
  onSelect: (value: string) => void;
  removePOCode: () => void;
  onSelectPO: (value: any) => void;
  onSearchPO: (value: string) => void;
}

const ManualForm: React.FC<ProcurementManualFormProps> = (props: ProcurementManualFormProps) => {
  const {
    onChangeStore,
    accountStores,
    isSelectSupplier,
    removeSupplier,
    isLoadingSearch,
    onChangeKeySearchSupplier,
    onSelect,
    data,
    listPO,
    removePOCode,
    onSelectPO,
    isPOLoading,
    isPODisable,
    onSearchPO,
  } = props;

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: SupplierResponse) => {
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
              prevValues[POProcurementField.supplier_id] !==
              curValues[POProcurementField.supplier_id]
            }
            className="margin-bottom-0"
          >
            {({ getFieldValue }) => {
              const supplier_id = getFieldValue([POProcurementField.supplier_id]);
              const supplier = getFieldValue([POProcurementField.supplier]);
              const phone = getFieldValue([POProcurementField.supplier_phone]);
              return (
                <>
                  {isSelectSupplier || supplier_id ? (
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Link
                          to={`${UrlConfig.SUPPLIERS}/${supplier_id}`}
                          className="primary"
                          target="_blank"
                          style={{ fontSize: "16px", marginRight: 10 }}
                        >
                          {supplier}
                        </Link>
                        {isSelectSupplier && (
                          <Button
                            type="link"
                            onClick={removeSupplier}
                            style={{ display: "flex", alignItems: "center" }}
                            icon={<AiOutlineClose />}
                          />
                        )}
                      </div>
                      <>
                        <Form.Item hidden name={[POProcurementField.supplier_id]}>
                          <Input />
                        </Form.Item>
                        <Form.Item hidden name={[POProcurementField.supplier]}>
                          <Input />
                        </Form.Item>
                        <Form.Item hidden name={[POProcurementField.supplier_phone]}>
                          <Input />
                        </Form.Item>
                        <Row>
                          <div>
                            <PhoneOutlined />{" "}
                            <Typography.Text strong>
                              {phone.indexOf("{") !== -1
                                ? `+${JSON.parse(phone).code}${JSON.parse(phone).phone}`
                                : phone}
                            </Typography.Text>
                          </div>
                        </Row>
                      </>
                    </div>
                  ) : (
                    <>
                      <Typography.Text strong>Chọn nhà cung cấp</Typography.Text>
                      <span style={{ color: "red" }}> *</span>
                      <Form.Item
                        name={[POProcurementField.supplier_id]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn nhà cung cấp",
                          },
                        ]}
                      >
                        <CustomAutoComplete
                          loading={isLoadingSearch}
                          dropdownClassName="supplier"
                          placeholder="Tìm kiếm nhà cung cấp"
                          onSearch={onChangeKeySearchSupplier}
                          dropdownMatchSelectWidth={456}
                          style={{ width: "100%" }}
                          onSelect={(value) => {
                            if (!value) return;
                            onSelect(value);
                          }}
                          options={renderResult}
                        />
                      </Form.Item>
                    </>
                  )}
                </>
              );
            }}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues[POField.code] !== curValues[POField.code]
            }
            className="margin-bottom-0"
          >
            {({ getFieldValue }) => {
              const poCode = getFieldValue([POField.code]);
              const poId = getFieldValue([POField.id]);
              const poReference = getFieldValue([POField.reference]);
              return (
                <>
                  {poCode ? (
                    <div style={{ marginBottom: 15 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div>Đơn đặt hàng: </div>
                        <Link
                          to={`${UrlConfig.PURCHASE_ORDERS}/${poId}`}
                          className="primary"
                          target="_blank"
                          style={{
                            fontSize: "16px",
                            marginRight: 10,
                            marginLeft: 5,
                          }}
                        >
                          {poCode}
                        </Link>
                        {poCode && (
                          <Button
                            type="link"
                            onClick={removePOCode}
                            style={{ display: "flex", alignItems: "center" }}
                            icon={<AiOutlineClose />}
                          />
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
                          <div>
                            Mã tham chiếu: <Typography.Text strong>{poReference}</Typography.Text>
                          </div>
                        </Row>
                      </>
                    </div>
                  ) : (
                    <>
                      <Typography.Text strong>Chọn đơn đặt hàng </Typography.Text>
                      <span style={{ color: "red" }}>*</span>
                      <Form.Item
                        name={[POField.code]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn đơn đặt hàng",
                          },
                        ]}
                      >
                        <Select
                          autoClearSearchValue={false}
                          allowClear
                          showSearch
                          showArrow
                          optionFilterProp="children"
                          placeholder="Tìm kiếm theo đơn đặt hàng hoặc mã tham chiếu"
                          loading={isPOLoading}
                          disabled={isPODisable}
                          onSearch={(text) => {
                            const value = text.trim();
                            if (value.length > 2) {
                              onSearchPO(value);
                            }
                            return value;
                          }}
                          onSelect={(value) => {
                            if (!value) return;
                            onSelectPO(value);
                          }}
                        >
                          {!isEmpty(listPO) &&
                            listPO.map((item) => (
                              <Select.Option key={item.id} value={item.id || 0}>
                                {item.reference
                                  ? `${item.code} - ${item.reference}`
                                  : `${item.code}`}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </>
                  )}
                </>
              );
            }}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item hidden name={[POProcurementField.store]}>
            <Input />
          </Form.Item>
          <Typography.Text strong>Chọn kho nhận </Typography.Text>
          <span style={{ color: "red" }}>*</span>
          <Form.Item
            name={[POProcurementField.store_id]}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn kho nhận hàng",
              },
            ]}
          >
            <Select
              autoClearSearchValue={false}
              allowClear
              showSearch
              showArrow
              optionFilterProp="children"
              placeholder="Chọn kho nhận"
              onChange={onChangeStore}
            >
              {!isEmpty(accountStores) &&
                accountStores.map((item) => (
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
          <Form.Item
            name={POProcurementField.note}
            rules={[
              {
                max: 500,
                message: "Ghi chú không được quá 500 ký tự",
              },
            ]}
          >
            <Input placeholder="Nhập ghi chú" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default ManualForm;
