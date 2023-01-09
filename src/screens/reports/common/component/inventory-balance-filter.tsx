import { FilterOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Row, Select } from "antd";
import BaseFilter from "component/filter/base.filter";
import { CityByCountryAction } from "domain/actions/content/content.action";
import { AccountStoreResponse } from "model/account/account.model";
import { ProvinceModel } from "model/content/district.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffectOnce } from "react-use";
import AnalyticsDatePicker from "screens/reports/analytics/shared/analytics-date-picker";
import { VietNamId } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { searchNumberString, strForSearch } from "utils/StringUtils";
import { showWarning } from "utils/ToastUtils";
import { InventoryBalanceFilterForm } from "../enums/inventory-balance-report";
import { fetchProductInfo, fetchStoreByProvince } from "../services/fetch-inventory-balance-list";
import { InventoryBalanceFilterStyle } from "../styles/inventory-balance-filter.style";
import DepartmentSelect from "./department-select";

const { Option } = Select;
interface Props {
  applyFilter: (conditionFilter: any) => void;
}

function InventoryBalanceFilter({ applyFilter }: Props) {
  const [form] = Form.useForm();
  const [finalOptions, setFinalOptions] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [productGroupLv1, setProductGroupLv1] = useState<any[]>([]);
  const [productGroupLv2, setProductGroupLv2] = useState<any[]>([]);
  const [productSkus, setProductSkus] = useState<any[]>([]);

  const dispatch = useDispatch();
  const [listProvinces, setListProvinces] = useState<ProvinceModel[]>([]);

  const addAdditionalOptions = (keySearch: string) => {
    const skus = form.getFieldValue(InventoryBalanceFilterForm.SkuCodes);
    const selectedOptions = skus?.length
      ? skus.map((value: string) => {
          return { label: value, value };
        })
      : [];
    const opt = { label: keySearch, value: keySearch };
    setFinalOptions(() => {
      if (!skus?.includes(keySearch)) {
        return [...selectedOptions, opt];
      }
      return [...selectedOptions];
    });
  };

  const [assignedStore, setAssignedStore] = useState<AccountStoreResponse[]>([]);

  const myStores: AccountStoreResponse[] =
    useSelector((state: RootReducerType) => state.userReducer.account?.account_stores) || [];

  const fetchStores = async () => {
    const { province } = form.getFieldsValue();
    const response = await fetchStoreByProvince(dispatch, province);
    if (!response) {
      setAssignedStore(myStores);
      return;
    }
    if (myStores.length) {
      const stores = myStores.filter((item) => {
        return response.data.findIndex((storeItem: any) => storeItem.id === item.store_id) !== -1;
      });
      setAssignedStore(stores);
    } else {
      setAssignedStore(
        response.data.map((item: any) => {
          return {
            store_id: item.id,
            store: item.name,
          };
        }),
      );
    }
  };

  useEffectOnce(() => {
    fetchStores();
  });

  const onReloadStore = () => {
    fetchStores();
  };

  const onApplyFilter = useCallback(() => {
    const conditionFilter = form.getFieldsValue();
    const { timeRange, inventory, skuCodes, productGroupLv1, productGroupLv2 } = conditionFilter;
    if (!timeRange || !inventory) {
      return;
    }
    const startDate = timeRange[0].format(DATE_FORMAT.YYYYMMDD);
    const endDate = timeRange[1].format(DATE_FORMAT.YYYYMMDD);
    applyFilter({
      startDate,
      endDate,
      listSKU: skuCodes?.map((item: any) => JSON.parse(item).sku_code).join(","),
      storeName: inventory,
      listProductGroupLv1: productGroupLv1 || "ALL",
      listProductGroupLv2: productGroupLv2 || "ALL",
    });
  }, [applyFilter, form]);

  const openFilter = () => {
    setVisible(true);
  };

  const onGetProductGroupLv1 = async () => {
    const response = await fetchProductInfo(dispatch);
    if (response) {
      const data = response.data.productGroupLV1.map((item: any) => {
        const { product_group_level1 } = item;
        return {
          label: product_group_level1,
          value: product_group_level1,
        };
      });
      console.log("data", data);

      setProductGroupLv1(data);
    }
  };

  const onGetProductGroupLv2 = async () => {
    const { productGroupLv1 } = form.getFieldsValue();
    if (!productGroupLv1) {
      setProductGroupLv2([]);
      showWarning("Vui lòng chọn nhóm sản phẩm cấp 1");
      return;
    }
    const response = await fetchProductInfo(dispatch, { productGroupLV1: productGroupLv1 });
    if (response) {
      const data = response.data.productGroupLV2.map((item: any) => {
        const { product_group_level2 } = item;
        return {
          label: product_group_level2,
          value: product_group_level2,
        };
      });
      setProductGroupLv2(data);
    }
  };

  const onGetProductSku = async () => {
    const { productGroupLv2 } = form.getFieldsValue();
    if (!productGroupLv2) {
      setProductSkus([]);
      showWarning("Vui lòng chọn nhóm sản phẩm cấp 2");
      return;
    }
    const response = await fetchProductInfo(dispatch, { productGroupLV2: productGroupLv2 });
    if (response) {
      setProductSkus(response.data.SKU);
    }
  };

  const onChangeSkuNames = () => {
    const { skuNames } = form.getFieldsValue();
    form.setFieldsValue({
      skuCodes: skuNames,
    });
  };

  const onChangeSkuCodes = () => {
    const { skuCodes } = form.getFieldsValue();
    form.setFieldsValue({
      skuNames: skuCodes,
    });
  };

  const handleClearFilter = () => {
    form?.setFieldsValue({
      productGroupLv1: undefined,
      productGroupLv2: undefined,
      skuCodes: undefined,
      skuNames: undefined,
    });
  };

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onFilterClick = useCallback(() => {
    setVisible(false);
    form?.submit();
    onApplyFilter();
  }, [form, onApplyFilter]);

  useEffect(() => {
    dispatch(
      CityByCountryAction(VietNamId, (response) => {
        setListProvinces(response);
      }),
    );
  }, [dispatch]);

  return (
    <>
      <InventoryBalanceFilterStyle>
        <Form form={form} name="form-filter">
          <Row gutter={10} justify="start">
            <Col>
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
            <Col>
              <Card>
                <Row gutter={10}>
                  <Col>
                    <Form.Item label="Kho/Cửa hàng" name={InventoryBalanceFilterForm.Province}>
                      <Select
                        style={{ width: "200px" }}
                        showSearch
                        allowClear
                        placeholder={"Tỉnh thành"}
                        filterOption={(input: string, option: any) => {
                          if (option.props.value) {
                            return strForSearch(option.props.children).includes(
                              strForSearch(input),
                            );
                          }
                          return false;
                        }}
                        onChange={onReloadStore}
                      >
                        {listProvinces.map((item, index) => (
                          <Option key={"province" + index} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      name={InventoryBalanceFilterForm.Inventory}
                      rules={[{ required: true, message: "Vui lòng chọn kho/cửa hàng" }]}
                    >
                      <DepartmentSelect
                        form={form}
                        assignedStore={assignedStore}
                      ></DepartmentSelect>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button
                      htmlType="submit"
                      type="primary"
                      onClick={onApplyFilter}
                      className="btn-filter"
                    >
                      Lọc
                    </Button>
                    <Button onClick={openFilter} icon={<FilterOutlined />}>
                      Thêm bộ lọc
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
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
                    label="Nhóm sản phẩm cấp 1"
                    labelCol={{ span: 24 }}
                    name={InventoryBalanceFilterForm.ProductGroupLv1}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder={"Chọn nhóm sản phẩm cấp 1"}
                      onSearch={(value) => addAdditionalOptions(value)}
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
                    label="Nhóm sản phẩm cấp 2"
                    labelCol={{ span: 24 }}
                    name={InventoryBalanceFilterForm.ProductGroupLv2}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder={"Chọn nhóm sản phẩm cấp 2"}
                      onSearch={(value) => addAdditionalOptions(value)}
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
                    label="Tên vật tư"
                    labelCol={{ span: 24 }}
                    name={InventoryBalanceFilterForm.SkuNames}
                  >
                    <Select
                      showSearch
                      allowClear
                      mode="multiple"
                      maxTagCount={"responsive"}
                      placeholder={"Chọn tên vật tư"}
                      onSearch={(value) => addAdditionalOptions(value)}
                      filterOption={(input, option) => {
                        return option?.sku_name && input
                          ? searchNumberString(input, option?.sku_name as string)
                          : false;
                      }}
                      onFocus={onGetProductSku}
                      onChange={onChangeSkuNames}
                    >
                      {productSkus.map((item, index) => (
                        <Option key={"productSkuName" + index} value={JSON.stringify(item)}>
                          {item.sku_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24}>
                  <Form.Item
                    label="Mã vật tư"
                    labelCol={{ span: 24 }}
                    name={InventoryBalanceFilterForm.SkuCodes}
                  >
                    <Select
                      showSearch
                      allowClear
                      mode="multiple"
                      maxTagCount={"responsive"}
                      placeholder={"Chọn mã vật tư"}
                      onSearch={(value) => addAdditionalOptions(value)}
                      filterOption={(input, option) => {
                        return option?.sku_code && input
                          ? searchNumberString(input, option?.sku_code as string)
                          : false;
                      }}
                      onFocus={onGetProductSku}
                      onChange={onChangeSkuCodes}
                    >
                      {productSkus.map((item, index) => (
                        <Option key={"productSkuCode" + index} value={JSON.stringify(item)}>
                          {item.sku_code}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </BaseFilter>
        </Form>
      </InventoryBalanceFilterStyle>
    </>
  );
}

export default InventoryBalanceFilter;
