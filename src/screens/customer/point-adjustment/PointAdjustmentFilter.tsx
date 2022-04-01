import { useCallback, useEffect, useMemo } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Tag,
} from "antd";

import CustomSelect from "component/custom/select.custom";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import { PointAdjustmentListRequest } from "model/request/loyalty/loyalty.request";

import search from "assets/img/search.svg";
import { StyledPointAdjustment } from "screens/customer/point-adjustment/StyledPointAdjustment";


type PointAdjustmentFilterProps = {
  params: PointAdjustmentListRequest;
  isLoading: boolean;
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
    isLoading,
    onFilter,
  } = props;

  const [formFilter] = Form.useForm();


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

    if (initialValues.term) {
      list.push({
        key: "term",
        name: "Tên hoặc mã phiếu điều chỉnh",
        value: initialValues.term
      })
    }

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

    if (initialValues.emps?.length) {
      let empsList = "";
      initialValues.emps.forEach((emp) => {
        empsList = empsList + emp + ";";
      })
      list.push({
        key: "emps",
        name: "Người điều chỉnh",
        value: empsList,
      });
    }

    if (initialValues.from) {
      list.push({
        key: "from",
        name: "Từ ngày",
        value: initialValues.from
      })
    }

    if (initialValues.to) {
      list.push({
        key: "to",
        name: "Đến ngày",
        value: initialValues.to,
      })
    }
    

    return list;
  }, [
    initialValues.term,
    initialValues.reasons,
    initialValues.emps,
    initialValues.from,
    initialValues.to
  ]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "term":
          onFilter && onFilter({ ...params, term: null })
          break;
        case "reasons":
          onFilter && onFilter({ ...params, reasons: [] });
          formFilter?.setFieldsValue({ reasons: [] });
          break;
        case "from":
          onFilter && onFilter({ ...params, from: null })
          break;
        case "to":
        onFilter && onFilter({ ...params, to: null })
        break;
        case "emps":
          onFilter && onFilter({ ...params, emps: [] });
          formFilter?.setFieldsValue({ emps: [] });
          break;
        default:
          break;
      }
    },
    [formFilter, onFilter, params]
  );
  // end handle tag filter

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
      from: params.from,
      to: params.to,
      emps: params.emps,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);


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
        </Form>
      </div>

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
    </StyledPointAdjustment>
  );
};

export default PointAdjustmentFilter;
