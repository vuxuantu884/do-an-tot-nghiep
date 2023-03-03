import { Button, Col, Form, FormInstance, Rate, Row } from "antd";

import { MenuAction } from "component/table/ActionButton";
import React, {
  createRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CustomFilter from "component/table/custom.filter";
import { FeedbackQuery } from "model/ecommerce/feedback.model";
import { StyledComponent } from "component/filter/shipment.filter.styles";
import BaseFilter from "component/filter/base.filter";
import DebounceSelect from "component/filter/component/debounce-select";
import CustomSelect from "component/custom/select.custom";
import {
  // ecommerceGetVariantsApi,
  ecommerceGetVariantsV2Api,
} from "service/ecommerce/ecommerce.service";

type FeedbackFilterProps = {
  params: FeedbackQuery;
  actions: Array<MenuAction>;
  shops: Array<any> | [];
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: FeedbackQuery | Object) => void;
  onClearFilter?: () => void;
};

const { Item } = Form;

async function searchVariants(input: any) {
  try {
    const result = await ecommerceGetVariantsV2Api({ sku_or_name_ecommerce: input });
    return result.data.items.map((item: any) => {
      return {
        label: item.ecommerce_variant,
        value: item.ecommerce_product_id.toString(),
      };
    });
  } catch (error) {
    console.log(error);
  }
}

const FeedbackFilter: React.FC<FeedbackFilterProps> = (props: FeedbackFilterProps) => {
  const { params, actions, shops, isLoading, onMenuClick, onClearFilter, onFilter } = props;
  const isFirstLoad = useRef(true);
  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [rerenderSearchVariant, setRerenderSearchVariant] = useState(false);
  const loadingFilter = useMemo(() => {
    return isLoading ? true : false;
  }, [isLoading]);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const [optionsVariant, setOptionsVariant] = useState<{ label: string; value: string }[]>([]);

  const onFilterClick = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  // const openFilter = useCallback(() => {
  //   setVisible(true);
  //   setRerender(true);
  // }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const initialValues = useMemo(() => {
    return {
      ...params,
      product_ids: Array.isArray(params.product_ids) ? params.product_ids : [params.product_ids],
      shop_ids: Array.isArray(params.shop_ids) ? params.shop_ids : [params.shop_ids],
      stars: Array.isArray(params.stars) ? params.stars : [params.stars],
    };
  }, [params]);

  const onFinish = useCallback(
    (values) => {
      let error = false;
      formRef?.current?.getFieldsError([]).forEach((field) => {
        if (field.errors.length) {
          error = true;
        }
      });
      if (!error) {
        setVisible(false);
        const valuesForm = {
          ...values,
        };
        onFilter && onFilter(valuesForm);
        setRerender(false);
      }
    },
    [formRef, onFilter],
  );

  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 1400;
    } else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
      return 1000;
    } else {
      return 800;
    }
  };

  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setVisible(false);
    setRerender(false);
  };
  useLayoutEffect(() => {
    window.addEventListener("resize", () => setVisible(false));
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      if (params.product_ids && params.product_ids.length) {
        setRerenderSearchVariant(false);
        let product_ids = Array.isArray(params.product_ids)
          ? params.product_ids
          : [params.product_ids];
        (async () => {
          let variants: any = [];
          await Promise.all(
            product_ids.map(async (product_id) => {
              try {
                const result = await ecommerceGetVariantsV2Api({
                  sku_or_name_ecommerce: product_id,
                });

                variants.push({
                  label: result.data.items[0].ecommerce_variant,
                  value: result.data.items[0].ecommerce_product_id.toString(),
                });
              } catch {}
            }),
          );
          setOptionsVariant(variants);
          if (variants?.length > 0) {
            setRerenderSearchVariant(true);
          }
        })();
      } else {
        setRerenderSearchVariant(true);
      }
    }
    isFirstLoad.current = false;
  }, [params.product_ids]);

  return (
    <StyledComponent>
      <div className="feedbacks-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            onFinish={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
            layout="inline"
          >
            <div style={{ width: "100%" }}>
              <Row gutter={12}>
                <Col span={6}>
                  <Item name="shop_ids">
                    <CustomSelect
                      mode="multiple"
                      style={{}}
                      showArrow
                      maxTagCount="responsive"
                      showSearch
                      allowClear
                      placeholder="Gian hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {shops.length &&
                        shops.map((item, index) => (
                          <CustomSelect.Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.id.toString()}
                          >
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={4}>
                  <Item name="is_replied">
                    <CustomSelect
                      style={{}}
                      showArrow
                      maxTagCount="responsive"
                      showSearch
                      allowClear
                      placeholder="Trạng thái"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      <CustomSelect.Option style={{ width: "100%" }} key={1} value={"true"}>
                        Đã phản hồi
                      </CustomSelect.Option>
                      <CustomSelect.Option style={{ width: "100%" }} key={2} value={"false"}>
                        Chưa phản hồi
                      </CustomSelect.Option>
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8}>
                  <Item name="product_ids">
                    {rerenderSearchVariant && (
                      <DebounceSelect
                        mode="multiple"
                        showArrow
                        maxTagCount="responsive"
                        placeholder="Tìm kiếm sản phẩm"
                        allowClear
                        fetchOptions={searchVariants}
                        optionsVariant={optionsVariant}
                        style={{
                          width: "100%",
                        }}
                      />
                    )}
                  </Item>
                </Col>
                <Col span={6}>
                  <Item name="stars">
                    <CustomSelect
                      mode="multiple"
                      style={{}}
                      showArrow
                      maxTagCount="responsive"
                      showSearch
                      allowClear
                      placeholder="Sao"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {[1, 2, 3, 4, 5].map((item, index) => (
                        <CustomSelect.Option
                          style={{}}
                          key={index.toString()}
                          value={item.toString()}
                        >
                          <Rate disabled defaultValue={item} />
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
            </div>

            <div className="buttonGroup">
              <div></div>
              <Button type="primary" loading={loadingFilter} htmlType="submit">
                Lọc
              </Button>
              {/* <Button icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button> */}
            </div>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="feedbacks-filter-drawer"
          width={widthScreen()}
        >
          {rerender && (
            <Form onFinish={onFinish} ref={formRef} initialValues={params} layout="vertical">
              <Row gutter={20}>
                {/* <Col span={12} xxl={8} style={{ marginBottom: "20px" }}>
                  <p>Ngày đóng gói</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="packed_on_min"
                    fieldNameTo="packed_on_max"
                    activeButton={packedClick}
                    setActiveButton={setPackedClick}
                    format="DD-MM-YYYY"
                    formRef={formRef}
                  />
                </Col> */}

                <Col span={12} xxl={8}>
                  <p>Sản phẩm</p>
                  <Item name="product_ids">
                    <DebounceSelect
                      mode="multiple"
                      showArrow
                      maxTagCount="responsive"
                      placeholder="Tìm kiếm sản phẩm"
                      allowClear
                      fetchOptions={searchVariants}
                      optionsVariant={optionsVariant}
                      style={{
                        width: "100%",
                      }}
                    />
                  </Item>
                </Col>
              </Row>
            </Form>
          )}
        </BaseFilter>
      </div>
    </StyledComponent>
  );
};

export default FeedbackFilter;
