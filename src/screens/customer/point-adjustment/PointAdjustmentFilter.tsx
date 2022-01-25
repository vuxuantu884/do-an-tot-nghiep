import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Tag,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";

import BaseFilter from "component/filter/base.filter";
import CustomSelect from "component/custom/select.custom";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import { PointAdjustmentListRequest } from "model/request/loyalty/loyalty.request";

import search from "assets/img/search.svg";
import { StyledPointAdjustment } from "screens/customer/point-adjustment/StyledPointAdjustment";


type PointAdjustmentFilterProps = {
  params: PointAdjustmentListRequest;
  initParams: any;
  isLoading: boolean;
  onClearFilter?: () => void;
  onFilter?: (values: GetOrdersMappingQuery | Object) => void;
};

const { Item } = Form;
const { Option } = Select;

const POINT_ADJUSTMENT_REASON = [
  "Tặng điểm sinh nhật",
  "Tặng điểm ngày cưới",
  "Tặng điểm bù",
  "Tặng điểm sự cố",
  "Trừ điểm bù",
  "Khác",
];


const PointAdjustmentFilter: React.FC<PointAdjustmentFilterProps> = (
  props: PointAdjustmentFilterProps
) => {
  const {
    params,
    initParams,
    isLoading,
    onClearFilter,
    onFilter,
  } = props;

  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);

  let initialValues = useMemo(() => {
    return {
      ...params,
      reasons: Array.isArray(params.reasons)
        ? params.reasons
        : [params.reasons],
    };
  }, [params]);

  // handle tag filter
  const filters = useMemo(() => {
    let list = [];

    if (initialValues.reasons?.length) {
      let reasonsList = "";
      initialValues.reasons.forEach((reason: any) => {
        reasonsList = reasonsList + reason + "; ";
      });
      list.push({
        key: "reasons",
        name: "Lý do điều chỉnh",
        value: reasonsList,
      });
    }
    return list;
  }, [initialValues.reasons]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "reasons":
          onFilter && onFilter({ ...params, reasons: [] });
          formFilter?.setFieldsValue({ reasons: [] });
          break;
        default:
          break;
      }
    },
    [formFilter, onFilter, params]
  );
  // end handle tag filter

  // handle filter action
  const onFilterClick = useCallback(() => {
    setVisibleBaseFilter(false);
    formFilter?.submit();
  }, [formFilter]);

  const openBaseFilter = useCallback(() => {
    setVisibleBaseFilter(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisibleBaseFilter(false);
  }, []);

  //clear base filter

  const onClearBaseFilter = useCallback(() => {
    setVisibleBaseFilter(false);
    formFilter.setFieldsValue(initParams);
    onClearFilter && onClearFilter();
  }, [formFilter, initParams, onClearFilter]);
  // end handle filter action

  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
      };
      
      onFilter && onFilter(formValues);
    },
    [onFilter]
  );

  useEffect(() => {
      formFilter.setFieldsValue({
        term: params.term,
        reasons: params.reasons,
      })
  }, [formFilter, params]);

  return (
    <StyledPointAdjustment>
      <div>
        <Form
          form={formFilter}
          onFinish={onFinish}
          initialValues={initialValues}
          className="basic-filter"
        >
          <Item name="term" className="search-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo mã phiếu, tên phiếu điều chỉnh"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  request: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item name="reasons" className="select-reason">
            <CustomSelect
              mode="multiple"
              maxTagCount="responsive"
              showSearch
              disabled={isLoading}
              placeholder="Chọn lý do điều chỉnh"
              allowClear
              notFoundContent="Không tìm thấy kết quả"
            >
              {POINT_ADJUSTMENT_REASON.map((item: any) => (
                <Option key={item} value={item}>
                  <div>{item}</div>
                </Option>
              ))}
            </CustomSelect>
          </Item>

          <Item>
            <Button
              type="primary"
              htmlType="submit" 
              disabled={isLoading}
            >
              Lọc
            </Button>
          </Item>

          <Item style={{ display: "none" }}>
            <Button
              icon={<FilterOutlined />}
              onClick={openBaseFilter}
              disabled={isLoading}
            >
              Thêm bộ lọc
            </Button>
          </Item>
        </Form>

        <BaseFilter
          onClearFilter={onClearBaseFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visibleBaseFilter}
          width={500}
        >
          <Form
            form={formFilter}
            onFinish={onFinish}
            initialValues={params}
            layout="vertical"
          >
            
          </Form>
        </BaseFilter>
      </div>

			{filters && filters.length > 0 && (
        <div className="filter-tags">
          {filters?.map((filter: any, index) => {
            return (
              <Tag
                key={filter.key}
                className="tag"
                closable={!isLoading}
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
        </div>
      )}
    </StyledPointAdjustment>
  );
};

export default PointAdjustmentFilter;
