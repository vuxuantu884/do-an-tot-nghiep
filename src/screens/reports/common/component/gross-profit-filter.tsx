import { SettingOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Form, List, Modal, Row, Select } from "antd";
import Undo from "assets/icon/undo.svg";
import { AppConfig } from "config/app.config";
import { debounce } from "lodash";
import moment from "moment";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useEffectOnce } from "react-use";
import AnalyticsDatePicker from "screens/reports/analytics/shared/analytics-date-picker";
import { getCollectionApi } from "service/product/collection.service";
import { searchProductWrapperApi, searchVariantSku3Api } from "service/product/product.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { searchNumberString } from "utils/StringUtils";
import { defaultDisplayOptions } from "../constant/goods-reports/gross-profit-report";
import { GrossProfitFilterForm } from "../enums/gross-profit-report";
import { InventoryBalanceFilterForm } from "../enums/inventory-balance-report";
import { InventoryBalanceFilterStyle } from "../styles/inventory-balance-filter.style";

interface Props {
  applyFilter: (conditionFilter: any) => void;
  displayOptions: any[];
  setDisplayOptions: (options: any[]) => void;
}

function GrossProfitFilter({ applyFilter, displayOptions, setDisplayOptions }: Props) {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [productGroupLv1, setProductGroupLv1] = useState<any[]>([]);
  const [sku3List, setSku3List] = useState<any[]>([]);
  const [sku7List, setSku7List] = useState<any[]>([]);

  const dispatch = useDispatch();

  const onApplyFilter = useCallback(() => {
    const conditionFilter = form.getFieldsValue();
    const { timeRange, productGroup, sku3, sku7 } = conditionFilter;
    if (!timeRange) {
      return;
    }
    const startDate = timeRange[0].format(DATE_FORMAT.YYYYMMDD);
    const endDate = timeRange[1].format(DATE_FORMAT.YYYYMMDD);
    const selectedOptions = displayOptions.filter((item) => item.visible);
    let params: any = {
      startDate,
      endDate,
      show: selectedOptions.length === 2 ? "All" : selectedOptions[0]?.key || "",
    };
    params = productGroup?.length ? { ...params, productGroup: productGroup.join(",") } : params;
    params = sku3?.length ? { ...params, sku3: sku3.join(",") } : params;
    params = sku7?.length ? { ...params, sku7: sku7.join(",") } : params;
    applyFilter(params);
  }, [applyFilter, displayOptions, form]);

  const openDisplayOptions = () => {
    setVisible(true);
  };

  const onGetProductGroupLv1 = useCallback(async () => {
    const response = await callApiNative({ isShowError: true }, dispatch, getCollectionApi, {
      page: 1,
      limit: 30,
    });
    if (response) {
      const data = response.items.map((item: any) => {
        const { name } = item;
        return {
          label: name,
          value: name,
        };
      });
      setProductGroupLv1(data);
    }
  }, [dispatch]);

  const onGetSku3List = useCallback(async () => {
    const response = await callApiNative({ isShowError: true }, dispatch, searchVariantSku3Api, {
      page: 1,
      limit: 1000,
    });
    if (response) {
      const data = response.items.map((item: any) => {
        const { code } = item;
        return {
          label: code,
          value: code,
        };
      });
      setSku3List(data);
    }
  }, [dispatch]);

  const onGetSku7List = useCallback(
    async (info?: string) => {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        searchProductWrapperApi,
        { info },
      );
      if (response) {
        const data = response.items.map((item: any) => {
          const { code } = item;
          return {
            label: code,
            value: code,
          };
        });
        setSku7List(data);
      }
    },
    [dispatch],
  );

  const resetDisplayOptions = () => {
    setDisplayOptions(defaultDisplayOptions);
  };

  const onCheckedChange = (index: number, e: any) => {
    if (index < 0 || index > displayOptions.length - 1) return; // Ignores if outside designated area
    const items = [...displayOptions];
    items[index] = { ...items[index], visible: e.target.checked };
    setDisplayOptions(items);
  };

  const onCancel = () => {
    setVisible(false);
  };

  const onConfirm = () => {
    setVisible(false);
    onApplyFilter();
  };

  useEffectOnce(() => {
    form.setFieldsValue({
      [InventoryBalanceFilterForm.TimeRange]: [
        moment().subtract(7, "day"),
        moment().subtract(1, "day"),
      ],
    });
    onApplyFilter();
  });

  return (
    <>
      <InventoryBalanceFilterStyle>
        <Form form={form} name="form-filter">
          <Row gutter={10} justify="start">
            <Col span={24} md={12} lg={8}>
              <Card>
                <Form.Item
                  name={InventoryBalanceFilterForm.TimeRange}
                  label="Thời gian"
                  rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                  className="input-width report-filter-item"
                  help={false}
                >
                  <AnalyticsDatePicker className="input-width-sm" />
                </Form.Item>
              </Card>
            </Col>
            <Col span={24} md={12} lg={16}>
              <Card>
                <Row gutter={10}>
                  <Col span={24} lg={6}>
                    <Form.Item name={GrossProfitFilterForm.ProductGroup}>
                      <Select
                        showSearch
                        allowClear
                        mode="multiple"
                        maxTagCount={"responsive"}
                        placeholder={"Chọn nhóm hàng"}
                        options={productGroupLv1}
                        filterOption={(input, option) => {
                          return option?.label && input
                            ? searchNumberString(input, option?.label as string)
                            : false;
                        }}
                        // onSearch={(value) =>
                        //   addAdditionalOptions(GrossProfitFilterForm.ProductGroup, value)
                        // }
                        onFocus={onGetProductGroupLv1}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={6}>
                    <Form.Item name={GrossProfitFilterForm.Sku3}>
                      <Select
                        showSearch
                        allowClear
                        placeholder={"Chọn mã 3"}
                        mode="multiple"
                        maxTagCount={"responsive"}
                        options={sku3List}
                        filterOption={(input, option) => {
                          return option?.label && input
                            ? searchNumberString(input, option?.label as string)
                            : false;
                        }}
                        onFocus={onGetSku3List}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={6}>
                    <Form.Item name={GrossProfitFilterForm.Sku7}>
                      <Select
                        showSearch
                        allowClear
                        placeholder={"Chọn mã 7"}
                        mode="multiple"
                        maxTagCount={"responsive"}
                        options={sku7List}
                        filterOption={(input, option) => {
                          return option?.label && input
                            ? searchNumberString(input, option?.label as string)
                            : false;
                        }}
                        onSearch={debounce((value) => {
                          onGetSku7List(value);
                        }, AppConfig.TYPING_TIME_REQUEST)}
                      ></Select>
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={6} className="action-btn-group">
                    <Button
                      htmlType="submit"
                      type="primary"
                      onClick={onApplyFilter}
                      className="btn-filter"
                    >
                      Lọc
                    </Button>
                    <Button
                      className="btn-filter"
                      onClick={openDisplayOptions}
                      icon={<SettingOutlined />}
                    ></Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <Modal
            title="Thay đổi tuỳ chọn hiển thị"
            closable={false}
            visible={visible}
            onCancel={onCancel}
            footer={[
              <div
                key="footer-button-list"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  key="return_default"
                  icon={<img src={Undo} style={{ marginRight: 5 }} alt="" />}
                  onClick={resetDisplayOptions}
                >
                  Quay về mặc định
                </Button>

                <div>
                  <Button key="on_cancel" onClick={onCancel}>
                    Huỷ
                  </Button>
                  <Button key="on_confirm" type="primary" onClick={() => onConfirm()}>
                    Lưu
                  </Button>
                </div>
              </div>,
            ]}
          >
            <List
              dataSource={displayOptions}
              renderItem={(item, index) => (
                <Checkbox
                  key={item.key}
                  onChange={(e) => onCheckedChange(index, e)}
                  checked={item.visible}
                >
                  {item.title}
                </Checkbox>
              )}
            />
          </Modal>
        </Form>
      </InventoryBalanceFilterStyle>
    </>
  );
}

export default GrossProfitFilter;
