import { Card, Col, Form, FormInstance, Input, Row, Select } from "antd";
import Text from "antd/lib/typography/Text";
import { isEmpty } from "lodash";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getListStore } from "service/core/store.service";
import { callApiNative } from "utils/ApiUtils";
import {
  StockInOutField,
  StockInOutType,
  stockOutReason,
  stockInReason,
  StockInReasonField,
  StockOutReasonField,
} from "../constant";

interface StockInOutWareHouseFormProps {
  title: string;
  formMain: FormInstance;
  stockInOutType: string;
  setIsRequireNote: (require: boolean) => void;
}

type AccountStore = {
  id: number;
  store_id: number;
  store: string;
};

const StockInOutWareHouseForm: React.FC<StockInOutWareHouseFormProps> = (
  props: StockInOutWareHouseFormProps,
) => {
  const { title, stockInOutType, setIsRequireNote, formMain } = props;
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const userStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );
  const dispatch = useDispatch();

  const getStores = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getListStore);
    const accountStores = userStores?.map((store: AccountStore) => {
      return { id: store.store_id, name: store.store };
    });
    if (res && userStores && userStores.length === 0) {
      setListStore(res);
    } else if (userStores && userStores.length === 1) {
      setListStore(accountStores);
      formMain.setFieldsValue({
        [StockInOutField.store_id]: accountStores[0].id,
      });
      formMain.setFieldsValue({
        [StockInOutField.store]: accountStores[0].name,
      });
    } else if (userStores && userStores.length > 0) {
      setListStore(accountStores);
    }
  }, [dispatch, formMain, setListStore, userStores]);

  useEffect(() => {
    getStores();
  }, [getStores]);

  return (
    <Card title={title} bordered={false}>
      <Row gutter={24}>
        <Form.Item name={StockInOutField.store} noStyle hidden>
          <Input />
        </Form.Item>
        <Col span={12}>
          <Text strong>Kho hàng </Text>
          <span style={{ color: "red" }}>*</span>
          <Form.Item
            name={[StockInOutField.store_id]}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn kho hàng",
              },
            ]}
          >
            <Select
              allowClear
              showSearch
              showArrow
              optionFilterProp="children"
              placeholder="Chọn 1 kho hàng"
              onSelect={(value: number) => {
                const store = listStore.find((item: StoreResponse) => item.id === value);
                if (store)
                  formMain.setFieldsValue({
                    [StockInOutField.store]: store.name,
                  });
              }}
            >
              {!isEmpty(listStore) &&
                listStore.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          {stockInOutType === StockInOutType.stock_in ? (
            <>
              <Text strong>Lý do nhập </Text>
              <span style={{ color: "red" }}>*</span>
              <Form.Item
                name={[StockInOutField.stock_in_out_reason]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn lý do nhập",
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  showArrow
                  optionFilterProp="children"
                  placeholder="Chọn lý do nhận"
                  onChange={(value) => {
                    if (value && value === StockInReasonField.stock_in_other)
                      setIsRequireNote(true);
                    else setIsRequireNote(false);
                  }}
                >
                  {stockInReason.map((item, i) => (
                    <Select.Option key={i} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          ) : (
            <>
              <Text strong>Lý do xuất </Text>
              <span style={{ color: "red" }}>*</span>
              <Form.Item
                name={[StockInOutField.stock_in_out_reason]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn lý do xuất",
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  showArrow
                  optionFilterProp="children"
                  placeholder="Chọn lý do xuất"
                  onChange={(value) => {
                    if (value && value === StockOutReasonField.stock_out_other)
                      setIsRequireNote(true);
                    else setIsRequireNote(false);
                  }}
                >
                  {stockOutReason.map((item, i) => (
                    <Select.Option key={i} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default StockInOutWareHouseForm;
