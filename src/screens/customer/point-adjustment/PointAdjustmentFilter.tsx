import { useCallback, useMemo, useState, useEffect } from "react";
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
import {
  searchAccountApi,
} from "service/accounts/account.service";
import { useDispatch } from "react-redux";
import rightArrow from "assets/icon/right-arrow.svg";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import DebounceSelect from "component/filter/component/debounce-select";
import moment from "moment";

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

  const [listAccount, setListAccount] = useState<any[]>([]);
  const [isDisableFilterAdjustment, setDisableFilterAdjustment] = useState(false);
  const dispatch = useDispatch();

  let initialValues = useMemo(() => {
    return {
      ...params,
      reasons: Array.isArray(params.reasons)
        ? params.reasons
        : [params.reasons],
      emps: Array.isArray(params.emps)
        ? params.emps
        : [params.emps]
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


  async function searchRegulator(value: any) {
    try {
      const response = await searchAccountApi({ info: value });
      setListAccount(response.data.items)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    let query = {
      info: '',
    }
    searchAccountApi(query).then((response) => {
      setListAccount(response.data.items)
    }).catch((error) => {
    })
  }, [dispatch]);

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

  const onChangeDate = useCallback(
    () => {
      let value: any = {};
      value = formFilter?.getFieldsValue(["from", "to"])
      if (value["from"] && value["to"] && (+moment(value["to"], 'DD-MM-YYYY') < + moment(value["from"], 'DD-MM-YYYY'))) {
        formFilter?.setFields([
          {
            name: "from",
            errors: [''],
          },
          {
            name: "to",
            errors: ['Ngày kết thúc không được nhỏ hơn ngày bắt đầu'],
          },
        ])

        setDisableFilterAdjustment(true)
      } else {
        formFilter?.setFields([
          {
            name: "from",
            errors: undefined,
          },
          {
            name: "to",
            errors: undefined,
          },
        ])
        setDisableFilterAdjustment(false)
      }
    }, [formFilter]);


  return (
    <StyledPointAdjustment>
      <div className="filter">
        <Form
          form={formFilter}
          onFinish={onFilter}
          initialValues={initialValues}
          layout="inline"
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

          <Item
            className="regulator"
            name="emps"
            // style={{ margin: "10px 0px" }}
          >
            <DebounceSelect
              mode="multiple"
              showArrow
              maxTagCount="responsive"
              placeholder="Người điều chỉnh"
              allowClear
              fetchOptions={searchRegulator}
            >
              {listAccount.map((item, index) => (
                <CustomSelect.Option
                  style={{ width: "100%" }}
                  key={index.toString()}
                  value={item.code}
                >
                  {item.code + " - " + item.full_name}
                </CustomSelect.Option>
              ))}
            </DebounceSelect>
          </Item>

          <Item name="from" className="check-validate-adjustment">
              <CustomDatePicker
                format="DD-MM-YYYY"
                placeholder="Từ ngày"
                style={{ width: "100%", borderRadius: 0 }}
                onChange={() => onChangeDate()}
              />
          </Item>

          <span className="form-adjustment-arrow-icon"> <img src={rightArrow} alt="" style={{marginRight: "10px"}}/> </span>

          <Item name="to" className="check-validate-adjustment">
              <CustomDatePicker
                format="DD-MM-YYYY"
                placeholder="Đến ngày"
                style={{ width: "100%", borderRadius: 0 }}
                onChange={() => onChangeDate()}
              />
          </Item>

          <Item style={{ marginRight: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={isDisableFilterAdjustment}
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
