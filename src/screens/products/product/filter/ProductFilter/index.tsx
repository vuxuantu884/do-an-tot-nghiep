import { FilterOutlined } from "@ant-design/icons";
import { Button, FormInstance, Col, Form, Input, Row, Select, Tag } from "antd";
import search from "assets/img/search.svg";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import ColorSearchSelect from "component/custom/select-search/color-select";
import SizeSearchSelect from "component/custom/select-search/size-search";
import SelectPaging from "component/custom/SelectPaging";
import BaseFilter from "component/filter/base.filter";
import CustomSelectOne from "component/filter/component/select-one.custom";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { AppConfig } from "config/app.config";
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
import { DATE_FORMAT, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import { StyledComponent } from "./style";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import CustomSelect from "component/custom/select.custom";

type ProductFilterProps = {
  params: any;
  listStatus?: Array<BaseBootstrapResponse>;
  listBrands?: Array<BaseBootstrapResponse>;
  listCountries?: Array<CountryResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: VariantSearchQuery) => void;
  onClickOpen?: () => void;
};

const {Item} = Form;

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
  } = props;
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState('');
  let [advanceFilters, setAdvanceFilters] = useState<any>({});

  const [lstSize, setLstSize] = useState<PageResponse<SizeResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [colors, setColors] = useState<PageResponse<ColorResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [mainColors, setMainColors] = useState<PageResponse<ColorResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [suppliers, setSupplier] = useState<PageResponse<SupplierResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 }
  });

  const [wins, setWins] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [designers, setDesigner] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const getSuppliers = useCallback((key: string, page: number) => {
    dispatch(SupplierSearchAction({ ids: key, page: page }, (data: PageResponse<SupplierResponse>) => {
      setSupplier((suppliers) => {
        return {
          ...suppliers,
          items: [
            ...suppliers.items,
            ...data.items
          ],
          metadata: data.metadata,
        }
      });
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const setDataDesigners = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) return;
      setDesigner((designer) => {
        return {
          ...designer,
          items: [
            ...designer.items,
            ...data.items
          ],
          metadata: data.metadata,
        }
      });
    },
    []
  );

  const setDataWins = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) return;
      setWins((wins) => {
        return {
          ...wins,
          items: [
            ...wins.items,
            ...data.items
          ],
          metadata: data.metadata,
        }
      });
    },
    []
  );

  const getDesigners = useCallback((code: string, page: number) => {
    dispatch(
      searchAccountPublicAction(
        { codes: code, page: page },
        setDataDesigners
      )
    );
  }, [dispatch, setDataDesigners]);

  const getWins = useCallback((code: string, page: number) => {
    dispatch(
      searchAccountPublicAction(
        { codes: code, page: page },
        setDataWins
      )
    );
  }, [dispatch, setDataWins]);

  useEffect(() => {
    const {
      designer,
      merchandiser,
      size,
      color,
      main_color,
      brand,
      made_in,
      supplier
    } = params;

    const filter = {
      ...params,
      size: size ? Array.isArray(size) ? size.map((i: string) => Number(i)) : [Number(size)] : [],
      color: color ? Array.isArray(color) ? color.map((i: string) => Number(i)) : [Number(color)] : [],
      main_color: main_color ? Array.isArray(main_color) ? main_color.map((i: string) => Number(i)) : [Number(main_color)] : [],
      brand: brand ? Array.isArray(brand) ? brand : [brand] : [],
      made_in: made_in ? Array.isArray(made_in) ? made_in.map((i: string) => Number(i)) : [made_in] : [],
      supplier: supplier ? Array.isArray(supplier) ? supplier.map((i: string) => Number(i)) : [Number(supplier)] : [],
    };

    if (designer && designer !== '') getDesigners(designer, 1);
    if (merchandiser && merchandiser !== '') getWins(merchandiser, 1);
    if (supplier && supplier !== '') getSuppliers(supplier, 1);
    setTimeout(() => {
      if (size && size !== '') getSizes(size, 1);
    }, 0);
    if (color && color !== '') getColors(color, 1, true, false);
    if (main_color && main_color !== '') getColors(main_color, 1, false, true);

    formAvd.setFieldsValue(filter);
    setAdvanceFilters(filter);

    if (!designer || designer.length === 0) formAvd.resetFields(['designer']);
    if (!merchandiser || merchandiser.length === 0) formAvd.resetFields(['merchandiser']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onFinish = useCallback(
    (values: VariantSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFinishAvd = useCallback(
    (values: any) => {
      setAdvanceFilters(values);
      values.from_created_date = getStartOfDayCommon(values.from_created_date)?.format();
      values.to_created_date = getEndOfDayCommon(values.to_created_date)?.format();

      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAvd.submit();
  }, [formAvd]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onClearFilterClick = useCallback(() => {
    formAvd.resetFields();
    formAvd.submit();
    setVisible(false);
  }, [formAvd]);

  const resetField = useCallback(
    (field: string) => {
      formAvd.resetFields([field]);
      formAvd.submit();
    },
    [formAvd]
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
            items: [
              ...colors.items,
              ...data.items
            ],
            metadata: data.metadata,
          }
        });
      }
      if (isMainColors) {
        setMainColors((mainColors) => {
          return {
            ...mainColors,
            items: [
              ...mainColors.items,
              ...data.items
            ],
            metadata: data.metadata,
          }
        });
      }
    },
    []
  );

  const getColors = useCallback((code: string, page: number, isColor: boolean, isMainColor: boolean) => {
    dispatch(
      getColorAction(
        { ids: code, page: page, is_main_color: isMainColor ? 1: 0 },
        (res)=>{
          setDataColors(res, isColor, isMainColor);
        }
      )
    );
  }, [dispatch, setDataColors]);

  const setDataSizes = useCallback((res: PageResponse<SizeResponse>) => {
    console.log(res)
    if (res) {
      setLstSize((lstSize) => {
        return {
          ...lstSize,
          items: [
            ...lstSize.items,
            ...res.items
          ],
          metadata: res.metadata,
        }
      });
    }
  },[]);

  const getSizes = useCallback((code: string, page: number)=>{
    dispatch(
      sizeSearchAction(
        { ids: code, page: page },
        setDataSizes
      )
    );
  },[dispatch, setDataSizes]);

  useEffect(()=> {
    getColors('', 1, false, true);
    getColors('', 1, true, false);
    getSizes('', 1);
    getWins('', 1);
    getDesigners('', 1);
    setTimeout(() => {
      getSuppliers('', 1);
    }, 0);
  },[getColors, getSizes, getSuppliers, getWins, getDesigners]);

  return (
    <StyledComponent>
      <div className="product-filter">
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Item name="info" className="search">
              <Input prefix={<img src={search} alt="" />} placeholder="Tìm kiếm theo Tên/Mã/Barcode sản phẩm" />
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
          wins={wins}
          designers={designers}
          colors={colors}
          lstSize={lstSize}
          mainColors={mainColors}
          suppliers={suppliers}
        />
        <BaseFilter
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={700}
        >
          <Form
            onFinish={onFinishAvd}
            form={formAvd}
            ref={formRef}
            layout="vertical"
          >
            <Row gutter={20}>
              {Object.keys(SearchVariantMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantField.made_in:
                    component = (
                      <CustomSelect
                        showSearch
                        optionFilterProp="children"
                        showArrow
                        placeholder="Chọn xuất xứ"
                        mode="multiple"
                        allowClear
                        tagRender={tagRender}
                        notFoundContent="Không tìm thấy kết quả"
                        maxTagCount="responsive"
                      >
                        {listCountries?.map((item) => (
                          <CustomSelect.Option key={item.id} value={String(item.id)}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    );
                    break;
                  case SearchVariantField.designer:
                    component = (
                      <AccountSearchPaging
                        mode="multiple"
                        placeholder="Chọn thiết kế"
                        fixedQuery={{ department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" }}
                      />
                    );
                    break;
                  case SearchVariantField.merchandiser:
                    component = (
                      <AccountSearchPaging
                        mode="multiple"
                        placeholder="Chọn merchandiser"
                        fixedQuery={{ department_ids: [AppConfig.WIN_DEPARTMENT],
                          status: "active" }}
                      />
                    );
                    break;
                  case SearchVariantField.created_date:
                    component = <CustomFilterDatePicker
                      fieldNameFrom="from_created_date"
                      fieldNameTo="to_created_date"
                      activeButton={dateClick}
                      setActiveButton={setDateClick}
                      formRef={formRef}
                    />;
                    break;
                  case SearchVariantField.size:
                    component = (
                      <SizeSearchSelect
                        mode="multiple"
                        key="code"
                        onSelect={(key, option) => getSizes(option?.key || key, 1)}
                      /> // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.color:
                    component = (
                      <ColorSearchSelect
                        mode="multiple"
                        fixedQuery={{is_main_color:0}}
                        onSelect={(key, option) =>{getColors(option?.key || key, 1,true,false)}}
                      /> // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.main_color:
                    component = (
                      <ColorSearchSelect
                        mode="multiple"
                        fixedQuery={{is_main_color:1}}
                        placeholder="Chọn màu sắc chủ đạo"
                        onSelect={(key, option) =>{getColors(option?.key || key, 1,false, true)}}
                      />
                      // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.supplier:
                    component = (
                      <SelectPaging
                        searchPlaceholder="Tìm kiếm nhà cung cấp"
                        metadata={suppliers.metadata}
                        showSearch={false}
                        maxTagCount="responsive"
                        allowClear
                        mode="multiple"
                        placeholder="Chọn nhà cung cấp"
                        onSearch={(key) => getSuppliers(key, 1)}
                        onPageChange={(key, page) => getSuppliers(key, page)}
                        onSelect={()=>{}} // to disable onSearch when select item
                      >
                        {suppliers.items.map((item) => (
                          <SelectPaging.Option key={item.id} value={item.id}>
                            {item.name}
                          </SelectPaging.Option>
                        ))}
                      </SelectPaging>
                    );
                    break;
                  case SearchVariantField.saleable:
                    component = (
                      <CustomSelectOne
                        span={12}
                        data={{true: "Cho phép bán", false: "Ngừng bán"}}
                      />
                    );
                    break;
                  case SearchVariantField.brand:
                    component = (
                      <Select mode="multiple" showSearch optionFilterProp="children" allowClear placeholder="Chọn thương hiệu">
                        {listBrands?.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    );
                }
                return (
                  <Col span={12} key={key}>
                    <div className="font-weight-500">{SearchVariantMapping[key]}</div>
                    <Item name={key}>{component}</Item>
                  </Col>
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
  suppliers
}: any) => {
  const newFilters = {...filters};
  let filtersKeys = Object.keys(newFilters);
  let renderTxt: any = null;
  const newKeys = ConvertDatesLabel(newFilters, keysDateFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateFilter, i));

  return (
    <div>
      {[...newKeys, ...filtersKeys].map((filterKey) => {
        let value = filters[filterKey];
        if (!value && !filters[`from_${filterKey}`] && !filters[`to_${filterKey}`]) return null;
        if (!value && value !==0) return null;
        if (value && Array.isArray(value) && value.length === 0) return null;
        if (!SearchVariantMapping[filterKey]) return null;

        let newValues = Array.isArray(value) ? value : [value];

        switch (filterKey) {
          case SearchVariantField.created_date:
            renderTxt = `${SearchVariantMapping[filterKey]} 
            : ${filters[`from_${filterKey}`] ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'} 
            ~ ${filters[`to_${filterKey}`] ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'}`
            break;
          case SearchVariantField.color:
            let colorTag = "";
            newValues.forEach((item: string) => {
              const color = colors.items?.find((e: any) => e.id === Number(item));

              colorTag = color ? colorTag + color.name + "; " : colorTag;
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${colorTag}`;
            break;
          case SearchVariantField.main_color:
            let mainColorTag = "";
            newValues.forEach((item: string) => {
              const mainColor = mainColors.items?.find((e: any) => e.id === Number(item));

              mainColorTag = mainColor ? mainColorTag + mainColor.name + "; " : mainColorTag
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${mainColorTag}`;
            break;
          case SearchVariantField.supplier:
            let supplierTag = "";
            newValues.forEach((item: string) => {
              const supplier = suppliers.items?.find((e: any) => e.id === Number(item));

              supplierTag = supplier ? supplierTag + supplier.name + "; " : supplierTag
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${supplierTag}`;
            break;
          case SearchVariantField.size:
            let sizeTag = "";
            newValues.forEach((item: string) => {
              const size = lstSize.items?.find((e: any) => e.id === Number(item));

              sizeTag = size ? sizeTag + size.code + "; " : sizeTag
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${sizeTag}`;
            break;
          case SearchVariantField.merchandiser:
            let merchandiserTag = "";
            newValues.forEach((item: string) => {
              const win = wins.items?.find((e: any) => e.code === item);

              merchandiserTag = win ? merchandiserTag + win.full_name + "; " : merchandiserTag
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${merchandiserTag}`;
            break;
          case SearchVariantField.designer:
            let designerTag = "";
            newValues.forEach((item: string) => {
              const designer = designers.items?.find((e: any) => e.code === item);

              designerTag = designer ? designerTag + designer.full_name + "; " : designerTag
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${designerTag}`;
            break
          case SearchVariantField.made_in:
            if (!listCountries) return null;
            let madeInTag = "";
            newValues.forEach((item: string) => {
              const madeIn = listCountries.find((e: any) => e.id === Number(item));
              madeInTag = madeIn ? madeInTag + madeIn.name + "; " : madeInTag
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${madeInTag}`;
            break
          case SearchVariantField.saleable:
            renderTxt = `${SearchVariantMapping[filterKey]} : ${
              value === "true" ? "Cho phép bán" : "Ngừng bán"
            }`;
            break;
          case SearchVariantField.brand:
            let brandTag = "";
            newValues.forEach((item: string) => {
              const brand = listBrands.find((e: any) => e.value === item);

              brandTag = brand ? brandTag + brand.name + "; " : brandTag
            });
            renderTxt = `${SearchVariantMapping[filterKey]} : ${brandTag}`;
            break
        }
        return (
          <Tag
            onClose={() => {
              if (filterKey === "created_date") {
                resetField("from_created_date");
                resetField("to_created_date");
                return;
              }
              resetField(filterKey)
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
