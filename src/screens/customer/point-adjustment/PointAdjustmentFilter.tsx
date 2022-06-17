import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Tag,
} from "antd";

import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import { PointAdjustmentListRequest } from "model/request/loyalty/loyalty.request";

import search from "assets/img/search.svg";
import { StyledPointAdjustment } from "screens/customer/point-adjustment/StyledPointAdjustment";
import {
  searchAccountPublicApi,
} from "service/accounts/account.service";
import { useDispatch } from "react-redux";
import rightArrow from "assets/icon/right-arrow.svg";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import moment from "moment";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import {AccountResponse} from "model/account/account.model";
import {PageResponse} from "model/base/base-metadata.response";
import {searchAccountPublicAction} from "domain/actions/account/account.action";

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
  "Tặng tiền tích lũy",
  "Trừ tiền tích lũy",
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

  const [initAccount, setInitAccount] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [accountDataFiltered, setAccountDataFiltered] = useState<Array<AccountResponse>>([]);

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
      initialValues.emps.forEach((emp: any) => {
        const account = accountDataFiltered?.find((item: any) => item.code?.toString() === emp?.toString());
        empsList = account
          ? empsList + account.code + " - " + account.full_name + "; "
          : empsList;
      });
      
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
    initialValues.to,
    accountDataFiltered,
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

  // get init account
  useEffect(() => {
    dispatch(searchAccountPublicAction({ limit: 30 }, (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setInitAccount(data.items);
      setAccountData(data.items);
    }));
  }, [dispatch]);

  // handle account by filter param
  const getAccountDataFiltered = useCallback((accountParam: any) => {
    if (accountParam && accountParam.length > 0) {
      searchAccountPublicApi({
        codes: accountParam,
      }).then((response) => {
        setAccountDataFiltered(response.data.items);
      });
    }
  }, [])
  // end handle account by filter param


  useEffect(() => {
    formFilter.setFieldsValue({
      term: params.term,
      reasons: params.reasons,
      from: params.from,
      to: params.to,
      emps: params.emps,
    })

    getAccountDataFiltered(params?.emps);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAccountDataFiltered, params]);

  const onChangeDate = useCallback(
    () => {
      let value: any;
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

  // handle scroll page
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const setPageScroll = (overflowType: string) => {
    let rootSelector: any = document.getElementById("root");
    if (rootSelector) {
      rootSelector.style.overflow = overflowType;
    }
  };

  // if the popup dropdown is scrolling then page scroll is hidden
  const handleOnSelectPopupScroll = () => {
    if (isDropdownVisible) {
      setPageScroll("hidden");
    }
  };

  const handleOnMouseLeaveSelect = () => {
    setPageScroll("scroll");
  };

  const handleOnDropdownVisibleChange = (open: boolean) => {
    setIsDropdownVisible(open);
  };

  const onInputSelectFocus = () => {
    setIsDropdownVisible(true);
  };

  const onInputSelectBlur = () => {
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    if (!isDropdownVisible) {
      setPageScroll("scroll");
    }
  }, [isDropdownVisible]);
  // end handle scroll page


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
            <Select
              mode="multiple"
              maxTagCount="responsive"
              showSearch
              disabled={isLoading}
              placeholder="Chọn lý do điều chỉnh"
              allowClear
              showArrow
              notFoundContent="Không tìm thấy kết quả"
              getPopupContainer={(trigger: any) => trigger.parentElement}
              onFocus={onInputSelectFocus}
              onBlur={onInputSelectBlur}
              onDropdownVisibleChange={handleOnDropdownVisibleChange}
              onPopupScroll={handleOnSelectPopupScroll}
              onMouseLeave={handleOnMouseLeaveSelect}
            >
              {POINT_ADJUSTMENT_REASON.map((item: any) => (
                <Option key={item} value={item}>
                  <div>{item}</div>
                </Option>
              ))}
            </Select>
          </Item>

          <Item
            className="regulator"
            name="emps"
            // style={{ margin: "10px 0px" }}
          >
            <AccountCustomSearchSelect
              placeholder="Người điều chỉnh"
              dataToSelect={accountData}
              setDataToSelect={setAccountData}
              initDataToSelect={initAccount}
              mode="multiple"
              maxTagCount="responsive"
              getPopupContainer={(trigger: any) => trigger.parentNode}
              onFocus={onInputSelectFocus}
              onBlur={onInputSelectBlur}
              onDropdownVisibleChange={handleOnDropdownVisibleChange}
              onPopupScroll={handleOnSelectPopupScroll}
              onMouseLeave={handleOnMouseLeaveSelect}
            />
          </Item>

          <Item name="from" className="check-validate-adjustment">
              <CustomDatePicker
                format="DD-MM-YYYY"
                placeholder="Từ ngày"
                style={{ width: "100%", borderRadius: 0 }}
                onChange={() => onChangeDate()}
                getPopupContainer={(trigger: any) => trigger.parentElement}
              />
          </Item>

          <span className="form-adjustment-arrow-icon"> <img src={rightArrow} alt="" style={{marginRight: "10px"}}/> </span>

          <Item name="to" className="check-validate-adjustment">
              <CustomDatePicker
                format="DD-MM-YYYY"
                placeholder="Đến ngày"
                style={{ width: "100%", borderRadius: 0 }}
                onChange={() => onChangeDate()}
                getPopupContainer={(trigger: any) => trigger.parentElement}
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
        {filters?.map((filter: any) => {
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
