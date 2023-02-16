import moment from "moment";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import search from "assets/img/search.svg";
import { MenuAction } from "component/table/ActionButton";
import { Button, Col, Form, Input, Row, Select, Tag } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CustomFilter from "component/table/custom.filter";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import {
  PromotionReleaseQuery,
  PromotionReleaseField,
  PromotionReleaseFieldMapping,
  PromotionReleaseMethod,
} from "model/promotion/promotion-release.model";
import useAuthorization from "hook/useAuthorization";
import { PromotionReleasePermission } from "config/permissions/promotion.permisssion";
import BaseFilter from "component/filter/base.filter";
import { FilterOutlined } from "@ant-design/icons";
import TreeStore from "component/CustomTreeSelect";
import { useDispatch } from "react-redux";
import { convertItemToArray } from "utils/AppUtils";
import SelectRangeDateCustom, {
  convertSelectedDateOption,
  handleSelectedDate,
} from "component/filter/SelectRangeDateCustom";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";
import TreeSource from "component/treeSource";
import { ChannelResponse } from "model/response/product/channel.response";
import { cloneDeep } from "lodash";
import { STATE_LIST } from "screens/promotion/constants";
import { PromotionReleaseFilterStyled } from "screens/promotion/promo-code/PromotionReleaseStyled";

type DiscountFilterProps = {
  isLoading?: boolean;
  initQuery: PromotionReleaseQuery;
  params: any;
  actions: Array<MenuAction>;
  listStore: Array<StoreResponse>;
  channelList: Array<ChannelResponse>;
  sourceList: Array<SourceResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (value: PromotionReleaseQuery | Object) => void;
};

const IS_REGISTER_LIST = [
  { value: "true", name: "Có đăng ký" },
  { value: "false", name: "Không đăng ký" },
];

const PROMOTION_RELEASE_METHOD_LIST = [
  {
    name: "Khuyến mại theo sản phẩm",
    value: PromotionReleaseMethod.DISCOUNT_CODE_QTY,
  },
  {
    name: "Khuyến mại theo đơn hàng",
    value: PromotionReleaseMethod.ORDER_THRESHOLD,
  },
  /** Tạm ẩn Khuyến mại có tặng mã giảm giá qua sms */
  // {
  //   name: "Khuyến mại có tặng mã giảm giá qua sms",
  //   value: PromotionReleaseMethod.IS_SMS_VOUCHER,
  // },
];

const { Item } = Form;
const { Option } = Select;

const PromotionReleaseFilter: React.FC<DiscountFilterProps> = (props: DiscountFilterProps) => {
  const {
    isLoading,
    initQuery,
    params,
    actions,
    listStore,
    channelList,
    sourceList,
    onMenuClick,
    onFilter,
  } = props;

  /** phân quyền */
  const [allowActivePromotionRelease] = useAuthorization({
    acceptPermissions: [PromotionReleasePermission.ACTIVE],
  });
  /** */

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [initAccount, setInitAccount] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [accountDataFiltered, setAccountDataFiltered] = useState<Array<AccountResponse>>([]);

  /** get init account */
  useEffect(() => {
    dispatch(
      searchAccountPublicAction({ limit: 30 }, (data: PageResponse<AccountResponse> | false) => {
        if (!data) {
          return;
        }
        setInitAccount(data.items);
        setAccountData(data.items);
      }),
    );
  }, [dispatch]);
  /** */

  /** handle form value */
  const initialValues = useMemo(() => {
    return {
      ...params,
      states: convertItemToArray(params.states),
      creators: convertItemToArray(params.creators),
      store_ids: convertItemToArray(params.store_ids, "number"),
      channels: convertItemToArray(params.channels),
      source_ids: convertItemToArray(params.source_ids, "number"),
    };
  }, [params]);

  const updateAccountData = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    const accountList = cloneDeep(initAccount);
    data.items?.length && data.items.forEach(item => {
      if (!initAccount.some((account: any) => account.code === item.code)) {
        accountList.push(item);
      }
    })

    setAccountData(accountList);
    setAccountDataFiltered(data.items);
  }, [initAccount]);

  const getAccountByParams = useCallback((accountCodes: Array<string>) => {
    if (accountCodes?.length) {
      dispatch(searchAccountPublicAction({limit: 30, codes: accountCodes}, updateAccountData));
    }
  },[dispatch, updateAccountData]);

  useEffect(() => {
    getAccountByParams(initialValues.creators);

    handleSelectedDate(
      initialValues?.starts_date_min,
      initialValues?.starts_date_max,
      setStartDateClick,
    );
    setStartDateFrom(initialValues?.starts_date_min);
    setStartDateTo(initialValues?.starts_date_max);

    handleSelectedDate(
      initialValues?.ends_date_min,
      initialValues?.ends_date_max,
      setEndDateClick,
    );
    setEndDateFrom(initialValues?.ends_date_min);
    setEndDateTo(initialValues?.ends_date_max);

    form.setFieldsValue({
      ...initialValues,
    });
  }, [form, getAccountByParams, initialValues]);
  /** end handle form value */

  /** handle apply date filter */
  const [startDateClick, setStartDateClick] = useState("");
  const [startDateFrom, setStartDateFrom] = useState<any>(params.starts_date_min);
  const [startDateTo, setStartDateTo] = useState<any>(params.starts_date_max);
  
  const [endDateClick, setEndDateClick] = useState("");
  const [endDateFrom, setEndDateFrom] = useState<any>(params.ends_date_min);
  const [endDateTo, setEndDateTo] = useState<any>(params.ends_date_max);

  const clearStartDate = () => {
    setStartDateClick("");
    setStartDateFrom(null);
    setStartDateTo(null);
  };

  const clearEndDate = () => {
    setEndDateClick("");
    setEndDateFrom(null);
    setEndDateTo(null);
  };

  const clickOptionDate = useCallback(
    (type, value) => {
      const selectedDateOption = convertSelectedDateOption(value);
      const { startDateValue, endDateValue } = selectedDateOption;

      switch (type) {
        case "starts_date":
          if (startDateClick === value) {
            clearStartDate();
          } else {
            setStartDateClick(value);
            setStartDateFrom(startDateValue);
            setStartDateTo(endDateValue);
          }
          break;
        case "ends_date":
          if (endDateClick === value) {
            clearEndDate();
          } else {
            setEndDateClick(value);
            setEndDateFrom(startDateValue);
            setEndDateTo(endDateValue);
          }
          break;
        default:
          break;
      }
    },
    [startDateClick, endDateClick],
  );

  const convertDateStringToDate = (dateString: string) => {
    const arrDate = dateString.split("-");
    const stringDate = arrDate[2] + "-" + arrDate[1] + "-" + arrDate[0];
    return new Date(stringDate);
  }

  const handleStartDateFrom = (dateString: string) => {
    setStartDateClick("");
    if (!dateString) {
      setStartDateFrom(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setStartDateFrom(startOfDate);
    }
  };

  const handleStartDateTo = (dateString: string) => {
    setStartDateClick("");
    if (!dateString) {
      setStartDateTo(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setStartDateTo(endOfDate);
    }
  };
  
  const handleEndDateFrom = (dateString: string) => {
    setEndDateClick("");
    if (!dateString) {
      setEndDateFrom(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setEndDateFrom(startOfDate);
    }
  };

  const handleEndDateTo = (dateString: string) => {
    setEndDateClick("");
    if (!dateString) {
      setEndDateTo(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setEndDateTo(endOfDate);
    }
  };
  /** end handle apply date filter */

  /** handle submit form */
  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        starts_date_min: startDateFrom,
        starts_date_max: startDateTo,
        ends_date_min: endDateFrom,
        ends_date_max: endDateTo,
        query: values.query?.trim(),
        coupon: values.coupon?.trim(),
        is_registered: values.is_registered ? (values.is_registered === "true") : undefined
      };
      onFilter && onFilter(formValues);
    },
    [
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      onFilter
    ],
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    form.submit();
  }, [form]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onActionClick = useCallback(
    (index) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const onClearFilterClick = useCallback(() => {
    onFilter && onFilter(initQuery);
    setVisible(false);
  }, [initQuery, onFilter]);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  /** handle tag filter */
  let filters = useMemo(() => {
    let list = [];

    if (initialValues.query) {
      list.push({
        key: "query",
        name: "Mã, tên đợt phát hành",
        value: initialValues.query,
      });
    }

    if (initialValues.states?.length) {
      let statesFiltered = "";
      initialValues.states.forEach((stateValue: string) => {
        const state = STATE_LIST.find(
          (item: any) => item.value === stateValue?.toUpperCase()
        );
        statesFiltered = state
          ? statesFiltered + state.name + "; "
          : statesFiltered + stateValue + "; ";
      });
      list.push({
        key: "states",
        name: "Trạng thái",
        value: statesFiltered,
      });
    }

    if (initialValues.coupon) {
      list.push({
        key: "coupon",
        name: "Mã giảm giá",
        value: initialValues.coupon,
      });
    }

    if (initialValues.creators?.length) {
      let createdByFiltered = "";
      initialValues.creators.forEach((accountCode: string) => {
        const staff = accountDataFiltered?.find(
          (item: any) => item.code?.toString() === accountCode?.toString()
        );
        createdByFiltered = staff
          ? createdByFiltered + staff.full_name + "; "
          : createdByFiltered;
      });
      if (createdByFiltered) {
        list.push({
          key: "creators",
          name: "Người tạo khuyến mại",
          value: createdByFiltered,
        });
      }
    }

    if (initialValues.entitled_method) {
      const promotionReleaseMethod = PROMOTION_RELEASE_METHOD_LIST?.find(
        (item) => item.value === initialValues.entitled_method?.toString().toUpperCase(),
      );
      if (promotionReleaseMethod) {
        list.push({
          key: "entitled_method",
          name: "Phương thức khuyến mại",
          value: promotionReleaseMethod.name,
        });
      }
    }

    if (initialValues.store_ids?.length) {
      let appliedStoreFiltered = "";
      initialValues.store_ids.forEach((store_id: any) => {
        const appliedStore = listStore?.find(
          (item: any) => item.id?.toString() === store_id?.toString(),
        );
        appliedStoreFiltered = appliedStore
          ? appliedStoreFiltered + appliedStore.name + "; "
          : appliedStoreFiltered + store_id + "; ";
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng áp dụng",
        value: appliedStoreFiltered,
      });
    }

    if (initialValues.channels?.length) {
      let channelFiltered = "";
      initialValues.channels.forEach((channelCode: any) => {
        const appliedSource = channelList?.find(
          (item: any) => item.code?.toString().toUpperCase() === channelCode?.toString().toUpperCase(),
        );
        channelFiltered = appliedSource
          ? channelFiltered + appliedSource.name + "; "
          : channelFiltered + channelCode + "; ";
      });
      list.push({
        key: "channels",
        name: "Kênh bán hàng áp dụng",
        value: channelFiltered,
      });
    }

    if (initialValues.source_ids?.length) {
      let sourceFiltered = "";
      initialValues.source_ids.forEach((sourceId: any) => {
        const source = sourceList?.find(
          (item: any) => item.id?.toString() === sourceId?.toString(),
        );
        sourceFiltered = source
          ? sourceFiltered + source.name + "; "
          : sourceFiltered + sourceId + "; ";
      });
      list.push({
        key: "source_ids",
        name: "Nguồn áp dụng",
        value: sourceFiltered,
      });
    }

    if (initialValues.is_registered) {
      const isRegister = IS_REGISTER_LIST?.find(
        (item) => item.value === initialValues.is_registered?.toString().toLowerCase(),
      );
      if (isRegister) {
        list.push({
          key: "is_registered",
          name: "Đăng ký với Bộ Công Thương",
          value: isRegister.name,
        });
      }
    }

    if (initialValues.starts_date_min || initialValues.starts_date_max) {
      let startDateFiltered =
        (initialValues.starts_date_min
          ? formatDateFilter(initialValues.starts_date_min)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.starts_date_max
          ? formatDateFilter(initialValues.starts_date_max)?.format(DATE_FORMAT.DDMMYYY)
          : "");
      list.push({
        key: "starts_date",
        name: "Ngày bắt đầu áp dụng",
        value: startDateFiltered,
      });
    }

    if (initialValues.ends_date_min || initialValues.ends_date_max) {
      let endDateFiltered =
        (initialValues.ends_date_min
          ? formatDateFilter(initialValues.ends_date_min)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.ends_date_max
          ? formatDateFilter(initialValues.ends_date_max)?.format(DATE_FORMAT.DDMMYYY)
          : "");
      list.push({
        key: "ends_date",
        name: "Ngày kết thúc áp dụng",
        value: endDateFiltered,
      });
    }
    return list;
  }, [
    initialValues.query,
    initialValues.coupon,
    initialValues.states,
    initialValues.is_registered,
    initialValues.entitled_method,
    initialValues.creators,
    initialValues.store_ids,
    initialValues.channels,
    initialValues.source_ids,
    initialValues.starts_date_min,
    initialValues.starts_date_max,
    initialValues.ends_date_min,
    initialValues.ends_date_max,
    listStore,
    channelList,
    sourceList,
    accountDataFiltered,
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "query":
          onFilter && onFilter({ ...params, query: null });
          break;
        case "states":
          onFilter && onFilter({ ...params, states: [] });
          break;
        case "coupon":
          onFilter && onFilter({ ...params, coupon: "" });
          break;
        case "is_registered":
          onFilter && onFilter({ ...params, is_registered: undefined });
          break;
        case "entitled_method":
          onFilter && onFilter({ ...params, entitled_method: null });
          break;
        case "creators":
          onFilter && onFilter({ ...params, creators: [] });
          break;
        case "store_ids":
          onFilter && onFilter({ ...params, store_ids: [] });
          break;
        case "channels":
          onFilter && onFilter({ ...params, channels: [] });
          break;
        case "source_ids":
          onFilter && onFilter({ ...params, source_ids: [] });
          break;
        case "starts_date":
          setStartDateClick("");
          setStartDateFrom(null);
          setStartDateTo(null);
          onFilter &&
          onFilter({
            ...params,
            starts_date_min: null,
            starts_date_max: null,
          });
          break;
        case "ends_date":
          setEndDateClick("");
          setEndDateFrom(null);
          setEndDateTo(null);
          onFilter &&
          onFilter({
            ...params,
            ends_date_min: null,
            ends_date_max: null,
          });
          break;
        default:
          break;
      }
    },
    [onFilter, params],
  );
  /** end handle tag filter */

  return (
    <PromotionReleaseFilterStyled>
      <div className="promotion-release-filter">
        <CustomFilter
          onMenuClick={onActionClick}
          menu={actions}
          actionDisable={!allowActivePromotionRelease}
        >
          <Form onFinish={onFinish} initialValues={params} layout="inline" form={form}>
            <Item name="query" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã, tên đợt phát hành"
                allowClear
                onBlur={(e) => {
                  form.setFieldsValue({ query: e.target.value?.trim() || "" });
                }}
              />
            </Item>

            <Item name="states" className="select-state">
              <Select
                showArrow
                allowClear
                mode="multiple"
                maxTagCount="responsive"
                optionFilterProp="children"
                placeholder="Chọn trạng thái"
              >
                {STATE_LIST?.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Item>

            <Item name="coupon" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã giảm giá"
                allowClear
                onBlur={(e) => {
                  form.setFieldsValue({ coupon: e.target.value?.trim() || "" });
                }}
              />
            </Item>

            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
          </Form>
        </CustomFilter>

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

        <BaseFilter
          visible={visible}
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          width={1000}
        >
          <Form onFinish={onFinish} form={form} initialValues={params} layout="vertical">
            <Row gutter={24}>
              {Object.keys(PromotionReleaseFieldMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case PromotionReleaseField.creators:
                    component = (
                      <AccountCustomSearchSelect
                        placeholder="Tìm kiếm theo tên, mã nhân viên"
                        dataToSelect={accountData}
                        setDataToSelect={setAccountData}
                        initDataToSelect={initAccount}
                        mode="multiple"
                        maxTagCount="responsive"
                        getPopupContainer={(trigger: any) => trigger.parentNode}
                      />
                    );
                    break;
                  case PromotionReleaseField.entitled_method:
                    component = (
                      <Select
                        showArrow
                        allowClear
                        optionFilterProp="children"
                        placeholder="Chọn phương thức khuyến mại"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        notFoundContent="Không tìm thấy phương thức khuyến mại"
                      >
                        {PROMOTION_RELEASE_METHOD_LIST?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case PromotionReleaseField.store_ids:
                    component = (
                      <TreeStore
                        placeholder="Chọn 1 hoặc nhiều cửa hàng"
                        storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                      />
                    );
                    break;
                  case PromotionReleaseField.channels:
                    component = (
                      <Select
                        autoClearSearchValue={false}
                        mode="multiple"
                        maxTagCount="responsive"
                        showSearch
                        showArrow
                        allowClear
                        placeholder="Chọn kênh"
                        optionFilterProp="children"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                      >
                        {channelList?.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case PromotionReleaseField.source_ids:
                    component = (
                      <TreeSource
                        placeholder="Chọn nguồn"
                        name="source_ids"
                        listSource={sourceList}
                      />
                    );
                    break;
                  case PromotionReleaseField.is_registered:
                    component = (
                      <Select
                        showArrow
                        allowClear
                        optionFilterProp="children"
                        placeholder="Chọn đăng ký với Bộ Công Thương"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        notFoundContent="Không tìm thấy lựa chọn"
                      >
                        {IS_REGISTER_LIST?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case PromotionReleaseField.starts_date:
                    component = (
                      <SelectRangeDateCustom
                        fieldNameFrom="starts_date_min"
                        fieldNameTo="starts_date_max"
                        dateType="starts_date"
                        clickOptionDate={clickOptionDate}
                        dateSelected={startDateClick}
                        startDate={startDateFrom}
                        endDate={startDateTo}
                        handleSelectDateStart={handleStartDateFrom}
                        handleSelectDateEnd={handleStartDateTo}
                      />
                    );
                    break;
                  case PromotionReleaseField.ends_date:
                    component = (
                      <SelectRangeDateCustom
                        fieldNameFrom="ends_date_min"
                        fieldNameTo="ends_date_max"
                        dateType="ends_date"
                        clickOptionDate={clickOptionDate}
                        dateSelected={endDateClick}
                        startDate={endDateFrom}
                        endDate={endDateTo}
                        handleSelectDateStart={handleEndDateFrom}
                        handleSelectDateEnd={handleEndDateTo}
                      />
                    );
                    break;
                }
                return (
                  <Col span={12} key={key}>
                    <div style={{ marginBottom: 5 }}>
                      <b>{PromotionReleaseFieldMapping[key]}</b>
                    </div>
                    <Item name={key}>{component}</Item>
                  </Col>
                );
              })}
            </Row>
          </Form>
        </BaseFilter>
      </div>
    </PromotionReleaseFilterStyled>
  );
};

export default PromotionReleaseFilter;
