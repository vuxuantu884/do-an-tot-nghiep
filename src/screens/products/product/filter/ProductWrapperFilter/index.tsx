import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Tag } from "antd";
import search from "assets/img/search.svg";
import SelectPaging from "component/custom/SelectPaging";
import BaseFilter from "component/filter/base.filter";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { getMaterialAction } from "domain/actions/product/material.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { CategoryView } from "model/product/category.model";
import { MaterialResponse } from "model/product/material.model";
import {
  keysDateWrapperFilter,
  SearchVariantWrapperField,
  SearchVariantWrapperMapping,
} from "model/product/product-mapping";
import { ProductWrapperSearchQuery, VariantSearchQuery } from "model/product/product.model";
import { StatusFilterResponse } from "model/product/status.model";
import moment from "moment";
import React, { createRef, Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT, formatDateFilter, getStartOfDayCommon } from "utils/DateUtils";
import { StyledComponent } from "./styled";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { convertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import CustomSelect from "component/custom/select.custom";
import CollectionSearchPaging from "component/custom/select-search/collection-select-paging";
import HashTag from "component/custom/hashtag";
import { CollectionResponse } from "model/product/collection.model";
import { getCollectionRequestAction } from "domain/actions/product/collection.action";
import CustomSelectOne from "component/filter/component/select-one.custom";

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

type ProductFilterProps = {
  params: ProductWrapperSearchQuery;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: VariantSearchQuery) => void;
  onClickOpen?: () => void;
  listCategory?: Array<CategoryView>;
  goods?: Array<BaseBootstrapResponse>;
  actions: Array<MenuAction>;
  initValue?: ProductWrapperSearchQuery;
};

const { Item } = Form;
const listStatus = [
  {
    name: "Ngừng hoạt động",
    value: "inactive",
  },
  {
    name: "Đang hoạt động",
    value: "active",
  },
];

const ProductWrapperFilter: React.FC<ProductFilterProps> = (props: ProductFilterProps) => {
  const dispatch = useDispatch();
  const { params, actions, onMenuClick, onFilter, onClickOpen, listCategory, goods } = props;
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState("");
  const [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [form] = Form.useForm();
  const [formNormal] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const [materials, setMaterials] = useState<PageResponse<MaterialResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [wins, setWins] = useState<PageResponse<AccountResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [designers, setDesigners] = useState<PageResponse<AccountResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [lstCollection, setLstCollection] = useState<Array<CollectionResponse>>([]);
  const setDataCollection = useCallback((data: PageResponse<CollectionResponse>) => {
    setLstCollection(data.items);
  }, []);

  const setDataDesigners = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) return;
    setDesigners((designer) => {
      return {
        ...designer,
        items: [...designer.items, ...data.items],
        metadata: data.metadata,
      };
    });
  }, []);

  const setDataWins = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) return;
    setWins((wins) => {
      return {
        ...wins,
        items: [...wins.items, ...data.items],
        metadata: data.metadata,
      };
    });
  }, []);

  const getDesigners = useCallback(
    (code: string, page: number) => {
      dispatch(searchAccountPublicAction({ codes: code, page: page }, setDataDesigners));
    },
    [dispatch, setDataDesigners],
  );

  const getWins = useCallback(
    (code: string, page: number) => {
      dispatch(searchAccountPublicAction({ codes: code, page: page }, setDataWins));
    },
    [dispatch, setDataWins],
  );

  const getCollections = useCallback(
    (code: string, page: number) => {
      dispatch(getCollectionRequestAction({ codes: code, page: page }, setDataCollection));
    },
    [dispatch, setDataCollection],
  );

  useEffect(() => {
    const { category_ids, material_ids, merchandisers, designers, goods, collections } = params;

    const filters = {
      ...params,
      [SearchVariantWrapperField.from_create_date]: formatDateFilter(params.from_create_date),
      [SearchVariantWrapperField.to_create_date]: formatDateFilter(params.to_create_date),
      category_ids: category_ids
        ? Array.isArray(category_ids)
          ? category_ids.map((i: string) => Number(i))
          : [Number(category_ids)]
        : [],
      material_ids: material_ids
        ? Array.isArray(material_ids)
          ? material_ids.map((i: string) => Number(i))
          : [Number(material_ids)]
        : [],
      goods: goods ? (Array.isArray(goods) ? goods : [goods]) : [],
    };

    if (designers && designers !== "") getDesigners(designers, 1);
    if (merchandisers && merchandisers !== "") getWins(merchandisers, 1);
    if (collections && collections !== "") getCollections(collections, 1);

    setAdvanceFilters(filters);
    form.setFieldsValue(filters);

    if (!designers || designers.length === 0) form.resetFields(["designer_code"]);
    if (!merchandisers || merchandisers.length === 0) form.resetFields(["merchandiser_code"]);
    if (!collections || collections.length === 0) form.resetFields(["collections"]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, params]);

  const submitFilter = useCallback(
    (values: VariantSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter],
  );

  const submitAdvFilter = useCallback(
    (values: any) => {
      setAdvanceFilters(values);
      formNormal.setFieldsValue(values);
      values.from_create_date = getStartOfDayCommon(values.from_create_date)?.format();
      values.to_create_date = getStartOfDayCommon(values.to_create_date)?.format();

      onFilter && onFilter(values);
    },
    [formNormal, onFilter],
  );

  const clickFilter = useCallback(() => {
    setVisible(false);
    form.submit();
  }, [form]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const cancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const handleClickMenu = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const clearFilter = useCallback(() => {
    form.resetFields();
    form.submit();
    setVisible(false);
  }, [form]);

  const resetField = useCallback(
    (field: string) => {
      form.resetFields([field]);
      form.submit();
    },
    [form],
  );

  const getMaterials = useCallback(
    (code: string, page: number) => {
      dispatch(
        getMaterialAction({ info: code, page: page }, (res) => {
          if (res) {
            setMaterials(res);
          }
        }),
      );
    },
    [dispatch],
  );

  return (
    <StyledComponent>
      <div className="product-filter">
        <CustomFilter onMenuClick={handleClickMenu} menu={actions}>
          <Form form={formNormal} onFinish={submitFilter} initialValues={params} layout="inline">
            <Item name="info" className="search">
              <Input
                onChange={(event) =>
                  form.setFieldsValue({
                    info: event.target.value,
                  })
                }
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo Tên/Mã sản phẩm"
                maxLength={255}
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
          </Form>
        </CustomFilter>
        <FilterList
          filters={advanceFilters}
          resetField={resetField}
          wins={wins}
          materials={materials}
          designers={designers}
          listCategory={listCategory}
          lstCollection={lstCollection}
          goods={goods}
          form={form}
        />
        <BaseFilter
          onClearFilter={clearFilter}
          onFilter={clickFilter}
          onCancel={cancelFilter}
          visible={visible}
          width={800}
        >
          <Form ref={formRef} onFinish={submitAdvFilter} form={form} layout="vertical">
            <Row>
              <Col span={24}>
                <Item name="info" className="search">
                  <Input
                    prefix={<img src={search} alt="" />}
                    placeholder="Tìm kiếm theo Tên/Mã sản phẩm"
                  />
                </Item>
              </Col>
            </Row>
            <Row gutter={20}>
              {Object.keys(SearchVariantWrapperMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantWrapperField.designers:
                    component = <AccountSearchPaging mode="multiple" placeholder="Chọn thiết kế" />;
                    break;
                  case SearchVariantWrapperField.merchandisers:
                    component = (
                      <AccountSearchPaging mode="multiple" placeholder="Chọn Merchandiser" />
                    );
                    break;
                  case SearchVariantWrapperField.status:
                    component = (
                      <CustomSelectOne
                        span={12}
                        data={{ active: "Đang hoạt động", inactive: "Ngừng hoạt động" }}
                      />
                    );
                    break;
                  case SearchVariantWrapperField.category_ids:
                    component = (
                      <CustomSelect
                        autoClearSearchValue={false}
                        showSearch
                        optionFilterProp="children"
                        showArrow
                        placeholder="Chọn danh mục"
                        mode="multiple"
                        allowClear
                        tagRender={tagRender}
                        notFoundContent="Không tìm thấy kết quả"
                        maxTagCount="responsive"
                      >
                        {listCategory?.map((item) => (
                          <CustomSelect.Option key={item.id} value={item.id}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    );
                    break;
                  case SearchVariantWrapperField.goods:
                    component = (
                      <CustomSelect
                        autoClearSearchValue={false}
                        showSearch
                        optionFilterProp="children"
                        showArrow
                        placeholder="Chọn ngành hàng"
                        mode="multiple"
                        allowClear
                        tagRender={tagRender}
                        notFoundContent="Không tìm thấy kết quả"
                        maxTagCount="responsive"
                      >
                        {goods?.map((item) => (
                          <CustomSelect.Option key={item.value} value={item.value}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    );
                    break;
                  case SearchVariantWrapperField.material_ids:
                    component = (
                      <SelectPaging
                        mode="multiple"
                        metadata={materials.metadata}
                        placeholder="Chọn chất liệu"
                        showSearch={false}
                        showArrow
                        allowClear
                        searchPlaceholder="Tìm kiếm chất liệu"
                        onPageChange={(key, page) => getMaterials(key, page)}
                        onSearch={(key) => getMaterials(key, 1)}
                      >
                        {materials.items.map((item) => (
                          <SelectPaging.Option key={item.id} value={item.id}>
                            {`${item.name}`}
                          </SelectPaging.Option>
                        ))}
                      </SelectPaging>
                    );
                    break;
                  case SearchVariantWrapperField.create_date:
                    component = (
                      <CustomFilterDatePicker
                        fieldNameFrom="from_create_date"
                        fieldNameTo="to_create_date"
                        activeButton={dateClick}
                        setActiveButton={setDateClick}
                        formRef={formRef}
                      />
                    );
                    break;
                  case SearchVariantWrapperField.collections:
                    component = (
                      <CollectionSearchPaging mode="multiple" placeholder="Chọn nhóm hàng" />
                    );
                    break;
                  case SearchVariantWrapperField.tags:
                    component = <HashTag />;
                    break;
                }
                return (
                  <Col span={12} key={key}>
                    <div className="font-weight-500">{SearchVariantWrapperMapping[key]}</div>
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
  materials,
  listCategory,
  goods,
  form,
  wins,
  designers,
  lstCollection,
}: any) => {
  let renderTxt = "";
  const newFilters = { ...filters };
  let filtersKeys = Object.keys(newFilters);
  const newKeys = convertDatesLabel(newFilters, keysDateWrapperFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateWrapperFilter, i));

  const formValue = form.getFieldsValue(true);
  let hasFilter = false;
  Object.keys(formValue).forEach((item) => {
    if (formValue[item]) {
      hasFilter = true;
    }
  });

  if (!hasFilter) {
    return <Fragment />;
  } else {
    return (
      <div>
        {[...newKeys, ...filtersKeys].map((filterKey) => {
          let value = filters[filterKey];
          if (!value && !filters[`from_${filterKey}`] && !filters[`to_${filterKey}`]) return null;
          if (value && Array.isArray(value) && value.length === 0) return null;
          if (!SearchVariantWrapperMapping[filterKey]) return null;

          let newValues = Array.isArray(value) ? value : [value];

          switch (filterKey) {
            case SearchVariantWrapperField.create_date:
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} 
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
            case SearchVariantWrapperField.category_ids:
              let categoryIdTag = "";
              newValues.forEach((item: number) => {
                const category = listCategory.find((e: any) => e.id === Number(item));

                categoryIdTag = category ? categoryIdTag + category.name + "; " : categoryIdTag;
              });
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${categoryIdTag}`;
              break;
            case SearchVariantWrapperField.material_ids:
              let materialIdTag = "";
              newValues.forEach((item: number) => {
                const material = materials.items.find((e: any) => e.id === Number(item));

                materialIdTag = material ? materialIdTag + material.name + "; " : materialIdTag;
              });
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${materialIdTag}`;
              break;
            case SearchVariantWrapperField.goods:
              let goodTag = "";
              newValues.forEach((item: string) => {
                const good = goods.find((e: any) => e.value === item);

                goodTag = good ? goodTag + good.name + "; " : goodTag;
              });
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${goodTag}`;
              break;
            case SearchVariantWrapperField.status:
              let index6 = listStatus.findIndex(
                (item: StatusFilterResponse) => item.value === value,
              );
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${listStatus[index6].name}`;
              break;
            case SearchVariantWrapperField.merchandisers:
              let merchandiserTag = "";
              newValues.forEach((item: string) => {
                const win = wins.items?.find((e: any) => e.code === item);

                merchandiserTag = win ? merchandiserTag + win.full_name + "; " : merchandiserTag;
              });
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${merchandiserTag}`;
              break;
            case SearchVariantWrapperField.designers:
              let designerTag = "";
              newValues.forEach((item: string) => {
                const designer = designers.items?.find((e: any) => e.code === item);

                designerTag = designer ? designerTag + designer.full_name + "; " : designerTag;
              });
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${designerTag}`;
              break;
            case SearchVariantWrapperField.collections:
              let collectionTag = "";
              newValues.forEach((item: string) => {
                const collection = lstCollection?.find((e: any) => e.code === item);

                collectionTag = collection ? collectionTag + collection.name + "; " : collectionTag;
              });
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${collectionTag}`;
              break;
            case SearchVariantWrapperField.tags:
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${newValues.toString()}`;
              break;
          }
          return (
            <Tag
              onClose={() => {
                if (filterKey === "create_date") {
                  resetField("from_create_date");
                  resetField("to_create_date");
                  return;
                } else {
                  resetField(filterKey);
                }
              }}
              key={filterKey}
              className="fade margin-bottom-20"
              closable
            >{`${renderTxt}`}</Tag>
          );
        })}
      </div>
    );
  }
};

export default ProductWrapperFilter;
