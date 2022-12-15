import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Select, Tag } from "antd";
import search from "assets/img/search.svg";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import ColorSearchSelect from "component/custom/select-search/color-select";
import SizeSearchSelect from "component/custom/select-search/size-search";
import BaseFilter from "component/filter/base.filter";
import CustomSelectOne from "component/filter/component/select-one.custom";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { getColorAction } from "domain/actions/product/color.action";
import { sizeSearchAction } from "domain/actions/product/size.action";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { ColorResponse } from "model/product/color.model";
import {
  keysDateFilter,
  SearchVariantField,
  SearchVariantMapping,
} from "model/product/product-mapping";
import { VariantSearchQuery } from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { convertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import {
  DATE_FORMAT,
  formatDateFilter,
  getEndOfDayCommon,
  getStartOfDayCommon,
} from "utils/DateUtils";
import { StyledComponent } from "./style";
import BaseSelect from "component/base/BaseSelect/BaseSelect";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import { useFetchMerchans } from "hook/useFetchMerchans";
import SupplierSearchSelect from "component/custom/select-search/supplier-select";

type ProductFilterProps = {
  params: any;
  listStatus?: Array<BaseBootstrapResponse>;
  listBrands?: Array<BaseBootstrapResponse>;
  listCountries?: Array<CountryResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: VariantSearchQuery) => void;
  onClickOpen?: () => void;
  canReadSuppliers?: boolean;
};

const { Item } = Form;
const { Option } = Select;

function tagRender(props: any) {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      className="primary-bg"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
    >
      {label}
    </Tag>
  );
}

const ProductFilter: React.FC<ProductFilterProps> = (props: ProductFilterProps) => {
  const dispatch = useDispatch();
  const [formAvd] = Form.useForm();
  const [form] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const {
    params,
    listStatus,
    listBrands,
    listCountries,
    onFilter,
    onClickOpen,
    actions,
    onMenuClick,
    canReadSuppliers,
  } = props;
  const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();

  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState("");
  const [advanceFilters, setAdvanceFilters] = useState<any>({});

  const [lstSize, setLstSize] = useState<PageResponse<SizeResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });

  const [colors, setColors] = useState<PageResponse<ColorResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });

  const [mainColors, setMainColors] = useState<PageResponse<ColorResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });

  const [suppliers, setSupplier] = useState<PageResponse<SupplierResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });

  const getSuppliers = useCallback(
    (key: string, page: number) => {
      dispatch(
        SupplierSearchAction({ ids: key, page: page }, (data: PageResponse<SupplierResponse>) => {
          setSupplier((suppliers) => {
            return {
              ...suppliers,
              items: [...suppliers.items, ...data.items],
              metadata: data.metadata,
            };
          });
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    const { designers, merchandisers, sizes, colors, main_colors, brands, made_ins, suppliers } =
      params;

    const filter = {
      ...params,
      from_created_date: formatDateFilter(params.from_created_date),
      to_created_date: formatDateFilter(params.to_created_date),
      sizes: sizes
        ? Array.isArray(sizes)
          ? sizes.map((i: string) => Number(i))
          : [Number(sizes)]
        : [],
      colors: colors
        ? Array.isArray(colors)
          ? colors.map((i: string) => Number(i))
          : [Number(colors)]
        : [],
      main_colors: main_colors
        ? Array.isArray(main_colors)
          ? main_colors.map((i: string) => Number(i))
          : [Number(main_colors)]
        : [],
      brands: brands ? (Array.isArray(brands) ? brands : [brands]) : [],
      made_ins: made_ins
        ? Array.isArray(made_ins)
          ? made_ins.map((i: string) => Number(i))
          : [made_ins]
        : [],
      suppliers: suppliers
        ? Array.isArray(suppliers)
          ? suppliers.map((i: string) => Number(i))
          : [Number(suppliers)]
        : [],
    };

    if (suppliers && suppliers !== "") getSuppliers(suppliers, 1);
    setTimeout(() => {
      if (sizes && sizes !== "") getSizes(sizes, 1);
    }, 0);
    if (colors && colors !== "") getColors(colors, 1, true, false);
    if (main_colors && main_colors !== "") getColors(main_colors, 1, false, true);

    formAvd.setFieldsValue(filter);
    setAdvanceFilters(filter);

    if (!designers || designers.length === 0) formAvd.resetFields(["designers"]);
    if (!merchandisers || merchandisers.length === 0) formAvd.resetFields(["merchandisers"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAvd, params]);

  const submitFilter = useCallback(
    (values: VariantSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter],
  );

  const submitAdvFilter = useCallback(
    (values: any) => {
      setAdvanceFilters(values);
      form.setFieldsValue(values);
      values.from_created_date = getStartOfDayCommon(values.from_created_date)?.format();
      values.to_created_date = getEndOfDayCommon(values.to_created_date)?.format();

      onFilter && onFilter(values);
    },
    [form, onFilter],
  );

  const clickFilter = useCallback(() => {
    setVisible(false);
    formAvd.submit();
  }, [formAvd]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const cancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const clearFilter = useCallback(() => {
    formAvd.resetFields();
    formAvd.submit();
    setVisible(false);
  }, [formAvd]);

  const resetField = useCallback(
    (field: string) => {
      formAvd.resetFields([field]);
      formAvd.submit();
    },
    [formAvd],
  );

  const setDataColors = useCallback(
    (data: PageResponse<ColorResponse>, isColors: boolean, isMainColors: boolean) => {
      if (!data) {
        return false;
      }
      if (isColors) {
        setColors((colors) => {
          return {
            ...colors,
            items: [...colors.items, ...data.items],
            metadata: data.metadata,
          };
        });
      }
      if (isMainColors) {
        setMainColors((mainColors) => {
          return {
            ...mainColors,
            items: [...mainColors.items, ...data.items],
            metadata: data.metadata,
          };
        });
      }
    },
    [],
  );

  const getColors = useCallback(
    (code: string, page: number, isColor: boolean, isMainColor: boolean) => {
      dispatch(
        getColorAction({ ids: code, page: page, is_main_color: isMainColor ? 1 : 0 }, (res) => {
          setDataColors(res, isColor, isMainColor);
        }),
      );
    },
    [dispatch, setDataColors],
  );

  const setDataSizes = useCallback((res: PageResponse<SizeResponse>) => {
    if (res) {
      setLstSize((lstSize) => {
        return {
          ...lstSize,
          items: [...lstSize.items, ...res.items],
          metadata: res.metadata,
        };
      });
    }
  }, []);

  const getSizes = useCallback(
    (code: string, page: number) => {
      dispatch(sizeSearchAction({ ids: code, page: page }, setDataSizes));
    },
    [dispatch, setDataSizes],
  );

  return (
    <StyledComponent>
      <div className="product-filter">
        <Form onFinish={submitFilter} form={form} initialValues={params} layout="inline">
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Item name="info" className="search">
              <Input
                onChange={(e) =>
                  formAvd.setFieldsValue({
                    info: e.target.value,
                  })
                }
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo Tên/Mã/Barcode sản phẩm"
              />
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button onClick={openFilter} icon={<FilterOutlined />}>
                Thêm bộ lọc
              </Button>
            </Item>
            <Item>
              <ButtonSetting onClick={onClickOpen} />
            </Item>
          </CustomFilter>
        </Form>
        <FilterList
          filters={advanceFilters}
          listCountries={listCountries}
          listStatus={listStatus}
          resetField={resetField}
          listBrands={listBrands}
          wins={merchans}
          designers={merchans}
          colors={colors}
          lstSize={lstSize}
          mainColors={mainColors}
          suppliers={suppliers}
        />
        <BaseFilter
          onClearFilter={clearFilter}
          onFilter={clickFilter}
          onCancel={cancelFilter}
          visible={visible}
          width={700}
        >
          <Form onFinish={submitAdvFilter} form={formAvd} ref={formRef} layout="vertical">
            <Row>
              <Col span={24}>
                <Item name="info" className="search">
                  <Input
                    className="w-100"
                    prefix={<img src={search} alt="" />}
                    placeholder="Tìm kiếm theo Tên/Mã/Barcode sản phẩm"
                  />
                </Item>
              </Col>
            </Row>
            <Row gutter={20}>
              {Object.keys(SearchVariantMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantField.made_ins:
                    component = (
                      <BaseSelect
                        data={listCountries}
                        renderItem={(item) => (
                          <Option key={item.id} value={String(item.id)}>
                            {item.name}
                          </Option>
                        )}
                        mode="multiple"
                        tagRender={tagRender}
                        placeholder="Chọn xuất xứ"
                        showSearch
                        showArrow
                      />
                    );
                    break;
                  case SearchVariantField.designers:
                    component = (
                      <BaseSelectMerchans
                        {...{ merchans, fetchMerchans, isLoadingMerchans }}
                        mode={"multiple"}
                        placeholder="Chọn thiết kế"
                      />
                    );
                    break;
                  case SearchVariantField.merchandisers:
                    component = (
                      <BaseSelectMerchans
                        {...{ merchans, fetchMerchans, isLoadingMerchans }}
                        mode={"multiple"}
                        placeholder="Chọn merchandiser"
                      />
                    );
                    break;
                  case SearchVariantField.created_date:
                    component = (
                      <CustomFilterDatePicker
                        fieldNameFrom="from_created_date"
                        fieldNameTo="to_created_date"
                        activeButton={dateClick}
                        setActiveButton={setDateClick}
                        formRef={formRef}
                      />
                    );
                    break;
                  case SearchVariantField.sizes:
                    component = (
                      <SizeSearchSelect
                        mode="multiple"
                        key="id"
                        onSelect={(key, option) => getSizes(option?.id || key, 1)}
                      /> // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.colors:
                    component = (
                      <ColorSearchSelect
                        mode="multiple"
                        fixedQuery={{ is_main_color: 0 }}
                        onSelect={(key, option) => {
                          getColors(option?.id || key, 1, true, false);
                        }}
                      /> // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.main_colors:
                    component = (
                      <ColorSearchSelect
                        mode="multiple"
                        fixedQuery={{ is_main_color: 1 }}
                        placeholder="Chọn màu sắc chủ đạo"
                        onSelect={(key, option) => {
                          getColors(option?.id || key, 1, false, true);
                        }}
                      />
                      // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.suppliers:
                    if (canReadSuppliers) {
                      component = (
                        <SupplierSearchSelect
                          mode="multiple"
                          placeholder="Chọn nhà cung cấp"
                          onSelect={(key) => {
                            getSuppliers(key, 1);
                          }}
                        />
                      );
                    }
                    break;
                  case SearchVariantField.saleable:
                    component = (
                      <CustomSelectOne
                        span={12}
                        data={{ true: "Cho phép bán", false: "Ngừng bán" }}
                      />
                    );
                    break;
                  case SearchVariantField.brands:
                    component = (
                      <Select
                        autoClearSearchValue={false}
                        mode="multiple"
                        showSearch
                        optionFilterProp="children"
                        allowClear
                        placeholder="Chọn thương hiệu"
                      >
                        {listBrands?.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.is_exist_images:
                    component = <CustomSelectOne span={12} data={{ true: "Có", false: "Không" }} />;
                    break;
                }

                return (
                  <React.Fragment key={key}>
                    {component ? (
                      <Col span={12}>
                        <div className="font-weight-500">{SearchVariantMapping[key]}</div>
                        <Item name={key}>{component}</Item>
                      </Col>
                    ) : (
                      <React.Fragment />
                    )}
                  </React.Fragment>
                );
              })}
            </Row>
          </Form>
        </BaseFilter>
      </div>
    </StyledComponent>
  );
};

const FilterList = ({
  filters,
  resetField,
  listCountries,
  listBrands,
  wins,
  designers,
  lstSize,
  mainColors,
  colors,
  suppliers,
}: any) => {
  const newFilters = { ...filters };
  let filtersKeys = Object.keys(newFilters);
  let renderTxt: string;
  const newKeys = convertDatesLabel(newFilters, keysDateFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateFilter, i));
  return (
    <div>
      {[...newKeys, ...filtersKeys].map((filterKey) => {
        let value = filters[filterKey];
        if (!value && !filters[`from_${filterKey}`] && !filters[`to_${filterKey}`]) return null;
        if (value && Array.isArray(value) && value.length === 0) return null;
        if (!SearchVariantMapping[filterKey]) return null;

        let newValues = Array.isArray(value) ? value : [value];

        switch (filterKey) {
          case SearchVariantField.created_date:
            renderTxt = `${SearchVariantMapping[filterKey]} 
            : ${
              filters[`from_${filterKey}`]
                ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY)
                : "??"
            } 
            ~ ${
              filters[`to_${filterKey}`]
                ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY)
                : "??"
            }`;
            break;
          case SearchVariantField.colors:
            let colorTag = "";
            newValues.forEach((item: string) => {
              const color = colors.items?.find((e: any) => e.id === Number(item));

              colorTag = color ? colorTag + color.name + "; " : colorTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${colorTag}`;
            break;
          case SearchVariantField.main_colors:
            let mainColorTag = "";
            newValues.forEach((item: string) => {
              const mainColor = mainColors.items?.find((e: any) => e.id === Number(item));

              mainColorTag = mainColor ? mainColorTag + mainColor.name + "; " : mainColorTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${mainColorTag}`;
            break;
          case SearchVariantField.suppliers:
            let supplierTag = "";
            newValues.forEach((item: string) => {
              const supplier = suppliers.items?.find((e: any) => e.id === Number(item));

              supplierTag = supplier ? supplierTag + supplier.name + "; " : supplierTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${supplierTag}`;
            break;
          case SearchVariantField.sizes:
            let sizeTag = "";
            newValues.forEach((item: string) => {
              const size = lstSize.items?.find((e: any) => e.id === Number(item));

              sizeTag = size ? sizeTag + size.code + "; " : sizeTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${sizeTag}`;
            break;
          case SearchVariantField.merchandisers:
            let merchandiserTag = "";
            newValues.forEach((item: string) => {
              const win = wins.items?.find((e: any) => e.code === item);

              merchandiserTag = win ? merchandiserTag + win.full_name + "; " : merchandiserTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${merchandiserTag}`;
            break;
          case SearchVariantField.designers:
            let designerTag = "";
            newValues.forEach((item: string) => {
              const designer = designers.items?.find((e: any) => e.code === item);

              designerTag = designer ? designerTag + designer.full_name + "; " : designerTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${designerTag}`;
            break;
          case SearchVariantField.made_ins:
            if (!listCountries) return null;
            let madeInTag = "";
            newValues.forEach((item: string) => {
              const madeIn = listCountries.find((e: any) => e.id === Number(item));
              madeInTag = madeIn ? madeInTag + madeIn.name + "; " : madeInTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${madeInTag}`;
            break;
          case SearchVariantField.saleable:
            renderTxt = `${SearchVariantMapping[filterKey]} : ${
              value === "true" ? "Cho phép bán" : "Ngừng bán"
            }`;
            break;
          case SearchVariantField.brands:
            let brandTag = "";
            newValues.forEach((item: string) => {
              const brand = listBrands.find((e: any) => e.value === item);

              brandTag = brand ? brandTag + brand.name + "; " : brandTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${brandTag}`;
            break;
          case SearchVariantField.is_exist_images:
            renderTxt = `${SearchVariantMapping[filterKey]} : ${value === "true" ? "Có" : "Không"}`;
            break;
        }
        return (
          <Tag
            onClose={() => {
              if (filterKey === "created_date") {
                resetField("from_created_date");
                resetField("to_created_date");
                return;
              }
              resetField(filterKey);
            }}
            key={filterKey}
            className="fade margin-bottom-20"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </div>
  );
};

export default ProductFilter;
