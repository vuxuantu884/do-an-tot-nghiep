import React, { ReactElement, useContext } from "react";
import {
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import { GiftContext } from "screens/promotion/gift/components/GiftProvider";
import GiftByProductGroupList from "screens/promotion/gift/components/GiftByProductGroupList";
import GiftByOrderGroup from "screens/promotion/gift/components/GiftByOrderGroup";
import { GIFT_METHOD_ENUM, GIFT_METHOD_LIST } from "model/promotion/gift.model";
import _ from "lodash";
import { MAX_FIXED_DISCOUNT_VALUE } from "screens/promotion/constants";
const { Option } = Select;
interface Props {
  form: FormInstance;
  idNumber?: number;
  originalEntitlements?: any;
  setGetIndexRemoveDiscount?: (index: any) => void;
}

function GiftForm({
  form,
  idNumber,
  originalEntitlements,
  setGetIndexRemoveDiscount,
}: Props): ReactElement {
  const giftContext = useContext(GiftContext);
  const {
    giftMethod,
    setGiftMethod,
    unlimitedQuantity,
    setUnlimitedQuantity,
    usageLimitPerCustomer,
    setUsageLimitPerCustomer,
    registerWithMinistry,
    setRegisterWithMinistry,
  } = giftContext;

  const onChangeGiftMethod = (value: GIFT_METHOD_ENUM) => {
    if (!value) {
      return;
    }

    setGiftMethod(value);
    const isQuantityMethod = value === GIFT_METHOD_ENUM.QUANTITY;
    const isOrderThresholdMethod = value === GIFT_METHOD_ENUM.ORDER_THRESHOLD;
    const formData = form.getFieldsValue(true);

    if (isQuantityMethod) {
      formData.entitlements = [
        {
          entitled_product_ids: [],
          entitled_variant_ids: [],
          entitled_gift_ids: [],
          selectedProducts: [],
          selectedGifts: [],
          prerequisite_quantity_ranges: [
            {
              greater_than_or_equal_to: 1,
            },
          ],
        },
      ];
      formData.rule = undefined;
    } else if (isOrderThresholdMethod) {
      formData.entitlements = [
        {
          entitled_gift_ids: [],
          selectedGifts: [],
        },
      ];
    }
    form.setFieldsValue({
      entitlements: _.cloneDeep(formData?.entitlements),
    });
  };

  return (
    <div>
      <Card title={"THÔNG TIN CHUNG"}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="title"
              label={"Tên khuyến mại"}
              rules={[
                {
                  required: true,
                  message: "Cần nhập tên khuyến mãi",
                },
                {
                  max: 255,
                  message: "Tên khuyến mại không được vượt quá 255 ký tự",
                },
              ]}
            >
              <Input id={"title"} placeholder="Nhập tên khuyến mại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={"Mã khuyến mại"} name="code">
              <Input placeholder="Mã khuyến mại sẽ được tạo tự động" disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Row gutter={30}>
              <Col span={12}>
                <Form.Item
                  label={"Số lượng áp dụng"}
                  name="quantity_limit"
                  rules={[
                    {
                      required: !unlimitedQuantity,
                      message: "Vui lòng nhập số lượng áp dụng",
                    },
                    {
                      type: "integer",
                      message: "Số lượng áp dụng phải là số nguyên",
                    },
                  ]}
                >
                  <InputNumber
                    disabled={unlimitedQuantity}
                    style={{ borderRadius: "5px", width: "100%" }}
                    placeholder="Nhập số lượng khuyến mại"
                    min={1}
                    max={MAX_FIXED_DISCOUNT_VALUE}
                    step={1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label=" ">
                  <Space>
                    <Switch
                      checked={unlimitedQuantity}
                      onChange={(value) => {
                        form.setFields([
                          {
                            name: "quantity_limit",
                            value: null,
                            errors: [],
                          },
                        ]);
                        setUnlimitedQuantity(value);
                      }}
                    />
                    {"Không giới hạn"}
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={30}>
              <Col span={12}>
                <Form.Item
                  label={"Số lượt áp dụng trên 1 KH"}
                  name="usage_limit_per_customer"
                  rules={[
                    {
                      required: !usageLimitPerCustomer,
                      message: "Vui lòng nhập số lượt áp dụng trên 1 KH",
                    },
                    {
                      type: "integer",
                      message: "Số lượt áp dụng trên 1 KH phải là số nguyên",
                    },
                  ]}
                >
                  <InputNumber
                    disabled={usageLimitPerCustomer}
                    style={{ borderRadius: "5px", width: "100%" }}
                    placeholder="Nhập số lượt áp dụng trên 1 KH"
                    min={1}
                    max={MAX_FIXED_DISCOUNT_VALUE}
                    step={1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label=" ">
                  <Space>
                    <Switch
                      checked={usageLimitPerCustomer}
                      onChange={(value) => {
                        form.setFields([
                          {
                            name: "usage_limit_per_customer",
                            value: null,
                            errors: [],
                          },
                        ]);
                        setUsageLimitPerCustomer(value);
                      }}
                    />
                    {"Không giới hạn"}
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                {
                  max: 500,
                  message: "Mô tả không được vượt quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea placeholder="Nhập mô tả cho khuyến mại" autoSize={{ minRows: 5 }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item style={{ marginBottom: 28 }}>
              <Space>
                <Switch
                  checked={registerWithMinistry}
                  onChange={(value) => {
                    setRegisterWithMinistry(value);
                  }}
                />
                Đã đăng ký Bộ công thương
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title={"THÔNG TIN SẢN PHẨM, QUÀ TẶNG KHUYẾN MẠI"}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="entitled_method" label={"Chọn loại khuyến mại"}>
              <Select onSelect={onChangeGiftMethod}>
                {GIFT_METHOD_LIST?.map((method: any) => (
                  <Option key={method.value} value={method.value}>
                    {method.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Loại chương trình quà tặng */}
          {giftMethod === GIFT_METHOD_ENUM.QUANTITY ? (
            // Tặng quà theo sản phẩm
            <GiftByProductGroupList
              form={form}
              idNumber={idNumber}
              originalEntitlements={originalEntitlements}
              setGetIndexRemoveDiscount={setGetIndexRemoveDiscount}
            />
          ) : (
            // Tặng quà theo đơn hàng
            <GiftByOrderGroup form={form} />
          )}
        </Row>
      </Card>
    </div>
  );
}

export default GiftForm;
