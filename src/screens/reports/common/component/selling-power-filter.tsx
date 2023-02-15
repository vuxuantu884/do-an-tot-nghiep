import { FilterOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Form, List, Modal, Row, Select } from "antd";
import Undo from "assets/icon/undo.svg";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import BaseFilter from "component/filter/base.filter";
import { AppConfig } from "config/app.config";
import _, { debounce } from "lodash";
import moment from "moment";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useEffectOnce } from "react-use";
import { getCategoryApi } from "service/product/category.service";
import { getCollectionApi } from "service/product/collection.service";
import { searchProductWrapperApi, searchVariantSku3Api } from "service/product/product.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { searchNumberString } from "utils/StringUtils";
import { defaultDisplayOptions } from "../constant/goods-reports/selling-power-report";
import { SellingPowerFilterForm } from "../enums/selling-power-report.enum";
import { TypeSku } from "../enums/type-sku.enum";
import { SellingPowerReportParams } from "../interfaces/selling-power-report.interface";
import { InventoryBalanceFilterStyle } from "../styles/inventory-balance-filter.style";

interface Props {
  applyFilter: (conditionFilter: any) => void;
  displayOptions: any[];
  setDisplayOptions: (options: any[]) => void;
}

function SellingPowerFilter({ applyFilter, displayOptions, setDisplayOptions }: Props) {
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [visible, setVisible] = useState(false);
  const [productGroupLv1, setProductGroupLv1] = useState<any[]>([]);
  const [productGroupLv2, setProductGroupLv2] = useState<any[]>([]);
  const [sku3List, setSku3List] = useState<any[]>([]);
  const [sku7List, setSku7List] = useState<any[]>([]);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const defaultDate = moment().subtract(1, "days");

  const flagCategories = useCallback((categories: any[], flatData: any[]) => {
    categories.forEach((item: any) => {
      flatData.push(item);
      if (item.children.length) {
        flagCategories([...item.children], flatData);
      }
    });
    return flatData;
  }, []);

  const onApplyFilter = useCallback(() => {
    const conditionFilter = form.getFieldsValue();
    console.log("conditionFilter", conditionFilter);

    const { date, category, collection, sku3, sku7, sku13 } = conditionFilter;
    if (!date) {
      return;
    }
    let params: SellingPowerReportParams = {
      date: moment(date, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.YYYYMMDD),
      typeSKU: TypeSku.Sku13,
    };
    params = collection?.length ? { ...params, productGroupLv1: collection.join(",") } : params;
    params = category?.length ? { ...params, productGroupLv2: category.join(",") } : params;
    params = sku3?.length ? { ...params, ma3: sku3.join(",") } : params;
    params = sku7?.length ? { ...params, ma7: sku7.join(",") } : params;
    params = sku13?.length ? { ...params, ma13: sku13.join(",") } : params;
    applyFilter(params);
  }, [applyFilter, form]);

  const openFilter = () => {
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

  const onGetProductGroupLv2 = useCallback(async () => {
    const response = await callApiNative({ isShowLoading: false }, dispatch, getCategoryApi, {});
    if (response) {
      const data = _.uniqBy(flagCategories(response, []), "name").map((item: any) => {
        const { name } = item;
        return {
          label: name,
          value: name,
        };
      });
      setProductGroupLv2(data);
    }
  }, [dispatch, flagCategories]);

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

  const handleClearFilter = () => {
    form?.setFieldsValue({
      [SellingPowerFilterForm.Collection]: [],
      [SellingPowerFilterForm.Category]: [],
      [SellingPowerFilterForm.Sku3]: [],
      [SellingPowerFilterForm.Sku7]: [],
      [SellingPowerFilterForm.Sku13]: [],
    });
  };

  const onFilterClick = useCallback(() => {
    setVisible(false);
    form?.submit();
    onApplyFilter();
  }, [form, onApplyFilter]);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onCheckedChange = (index: number, e: any) => {
    if (index < 0 || index > displayOptions.length - 1) return; // Ignores if outside designated area
    const items = [...displayOptions];
    items[index] = { ...items[index], visible: e.target.checked };
    setDisplayOptions(items);
  };

  const resetDisplayOptions = () => {
    setDisplayOptions(defaultDisplayOptions);
  };

  const onCancelDisplayOptions = () => {
    setShowSettingColumn(false);
  };

  const onConfirmDisplayOptions = () => {
    setShowSettingColumn(false);
    onApplyFilter();
  };

  useEffectOnce(() => {
    form.setFieldsValue({
      date: defaultDate,
    });
    applyFilter({
      date: defaultDate.format(DATE_FORMAT.YYYYMMDD),
      typeSKU: TypeSku.Sku13,
    });
  });

  return (
    <>
      <InventoryBalanceFilterStyle>
        <Form form={form} name="form-filter">
          <Card>
            <Row gutter={10} justify="start">
              <Col span={24} md={8}>
                <Form.Item label="Thời gian" name={SellingPowerFilterForm.Date}>
                  <CustomDatePicker
                    disableDate={(date) => date >= moment().startOf("days")}
                    format={DATE_FORMAT.DDMMYYY}
                    placeholder="Chọn thời gian"
                    style={{ width: "100%" }}
                    showToday={false}
                    defaultValue={defaultDate}
                  />
                </Form.Item>
              </Col>
              <Col span={0} md={6}></Col>
              <Col span={24} md={10} className="action-btn-group">
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={onApplyFilter}
                  className="btn-filter"
                >
                  Lọc kết quả
                </Button>
                <Button onClick={openFilter} className="btn-filter" icon={<FilterOutlined />}>
                  Thêm bộ lọc
                </Button>
                <Button
                  className="btn-filter"
                  title="Ẩn/hiện cột"
                  icon={<SettingOutlined />}
                  onClick={() => setShowSettingColumn(true)}
                />
              </Col>
            </Row>
          </Card>
          <BaseFilter
            onClearFilter={handleClearFilter}
            onFilter={onFilterClick}
            onCancel={onCancelFilter}
            visible={visible}
            width={396}
          >
            <div className="ant-form ant-form-vertical">
              <Row gutter={50}>
                <Col span={24}>
                  <Form.Item
                    label="Nhóm hàng"
                    labelCol={{ span: 24 }}
                    name={SellingPowerFilterForm.Collection}
                  >
                    <Select
                      showSearch
                      allowClear
                      mode="multiple"
                      placeholder={"Chọn nhóm hàng"}
                      options={productGroupLv1}
                      filterOption={(input, option) => {
                        return option?.label && input
                          ? searchNumberString(input, option?.label as string)
                          : false;
                      }}
                      onFocus={onGetProductGroupLv1}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24}>
                  <Form.Item
                    label="Danh mục sản phẩm"
                    labelCol={{ span: 24 }}
                    name={SellingPowerFilterForm.Category}
                  >
                    <Select
                      showSearch
                      allowClear
                      mode="multiple"
                      placeholder={"Chọn danh mục sản phẩm"}
                      options={productGroupLv2}
                      filterOption={(input, option) => {
                        return option?.label && input
                          ? searchNumberString(input, option?.label as string)
                          : false;
                      }}
                      onFocus={onGetProductGroupLv2}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24}>
                  <Form.Item
                    label="Mã 3 ký tự"
                    labelCol={{ span: 24 }}
                    name={SellingPowerFilterForm.Sku3}
                  >
                    <Select
                      showSearch
                      allowClear
                      mode="multiple"
                      maxTagCount={"responsive"}
                      placeholder={"Chọn mã 3 ký tự"}
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
              </Row>
              <Row gutter={50}>
                <Col span={24}>
                  <Form.Item
                    label="Mã 7 ký tự"
                    labelCol={{ span: 24 }}
                    name={SellingPowerFilterForm.Sku7}
                  >
                    <Select
                      showSearch
                      allowClear
                      mode="multiple"
                      maxTagCount={"responsive"}
                      placeholder={"Chọn mã 7 ký tự"}
                      options={sku7List}
                      onSearch={debounce((value) => {
                        onGetSku7List(value);
                      }, AppConfig.TYPING_TIME_REQUEST)}
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24}>
                  <Form.Item
                    label="Mã SKU"
                    labelCol={{ span: 24 }}
                    name={SellingPowerFilterForm.Sku13}
                  >
                    <Select
                      showSearch
                      allowClear
                      mode="multiple"
                      maxTagCount={"responsive"}
                      placeholder={"Chọn mã SKU"}
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </BaseFilter>
        </Form>
      </InventoryBalanceFilterStyle>
      <Modal
        title="Thay đổi tuỳ chọn hiển thị"
        closable={false}
        visible={showSettingColumn}
        onCancel={onCancelDisplayOptions}
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
              <Button key="on_cancel" onClick={onCancelDisplayOptions}>
                Huỷ
              </Button>
              <Button key="on_confirm" type="primary" onClick={() => onConfirmDisplayOptions()}>
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
    </>
  );
}

export default SellingPowerFilter;
