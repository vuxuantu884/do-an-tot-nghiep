import { FilterOutlined } from "@ant-design/icons";
import { Button, Collapse, Form, Input, Space, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import CustomRangePicker from "component/filter/component/range-picker.custom";
import SelectMerchandisers from "component/filter/component/select-merchandisers";
// import SelectStoreField from "component/filter/component/select-store-field";
import SelectSupplierField from "component/filter/component/select-supplier-field";
import UrlConfig from "config/url.config";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { StoreResponse } from "model/core/store.model";
import { SupplierResponse } from "model/core/supplier.model";
import { ProcurementQuery } from "model/purchase-order/purchase-procument";
import moment from "moment";
import querystring from "querystring";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import { checkFixedDate, DATE_FORMAT } from "utils/DateUtils";
import { FilterProcurementStyle, ProcurementStatusStyle } from "./styles";
const { Item } = Form;
const BaseProcumentField = {
  content: "content",
  merchandisers: "merchandisers",
  suppliers: "suppliers"
};

interface ProcurementFilter {
  stockDate: string;
  stockUser: string;
  confirmDate: string;
  confirmUser: string;
  expectDate: string;
  status: string;
  cancelDate: string;
  merchandisers: string;
  stores: string;
  suppliers: string;
}

const ProcurementFilterItem = {
  stockDate: "stockDate",
  confirmDate: "confirmDate",
  expectDate: "expectDate",
  status: "status",
  stores: "stores",
};

const ProcurementFilterName = {
  [ProcurementFilterItem.stockDate]: "Ngày duyệt phiếu nhập",
  [ProcurementFilterItem.confirmDate]: "Ngày nhập kho",
  [ProcurementFilterItem.status]: "Trạng thái phiếu nhập kho",
  [ProcurementFilterItem.stores]: "Kho nhận hàng",
  [ProcurementFilterItem.expectDate]: "Ngày nhận dự kiến",
};
const { Panel } = Collapse;
function TabListFilter() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const [visible, setVisible] = useState(false);
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [allStore, setAllStore] = useState<Array<StoreResponse>>();


  const [formBase] = useForm();
  const [formAdvanced] = useForm();

  const openVisibleFilter = () => {
    setVisible(true);
  };
  const cancelFilter = () => {
    setVisible(false);
  };
  const resetFilter = () => {
    formAdvanced.resetFields();
    formAdvanced.submit();
    setVisible(false);
  };

  const resetField = useCallback(
    (field: string) => {
      formAdvanced.setFieldsValue({
        ...formAdvanced.getFieldsValue(true),
        [field]: undefined,
      });
      formAdvanced.submit();
    },
    [formAdvanced]
  );
  const parseDataToString = (data: ProcurementFilter) => {
    const params: ProcurementQuery = {} as ProcurementQuery;
    //;ngay duyet phieu
    if (data.stockDate) {
      params.active_from = data.stockDate[0];
      params.active_to = data.stockDate[1];
    }
    //ngay xac nhan phieu
    if (data.confirmDate) {
      params.stock_in_from = data.confirmDate[0];
      params.stock_in_to = data.confirmDate[1];
    }
    // ngay nhan du kien
    if (data.expectDate) {
      params.expect_receipt_from = data.expectDate[0];
      params.expect_receipt_to = data.expectDate[1];
    }

    //trang thai
    if (data.status) {
      params.status = data.status.toString();
    }

    //cua hang
    if (data?.stores) {
      params.stores = data.stores.toString();
    }

    if (data?.suppliers) {
      params.suppliers = data.suppliers.toString();
    }
    return params;
  };

  const onAdvanceFinish = (data: ProcurementFilter) => {
    setVisible(false);
    const params: ProcurementQuery = parseDataToString(data);

    const formBaseData = formBase.getFieldsValue(true);
    const newFormBaseData = { ...formBaseData };
    newFormBaseData.merchandisers = formBaseData?.merchandisers?.toString();
    setAdvanceFilters(data);
    history.replace(
      `${UrlConfig.PROCUREMENT}?${querystring.stringify({
        ...params,
        ...newFormBaseData,
      })}`
    );
  };

  const onBaseFinish = (data: any) => {
    data.merchandisers = data?.merchandisers?.toString();

    const formAdvanceData = formAdvanced.getFieldsValue(true);
    const formAdvanceParams: ProcurementQuery = parseDataToString(formAdvanceData);

    history.push(
      `${UrlConfig.PROCUREMENT}?${querystring.stringify({
        ...data,
        ...formAdvanceParams,
      })}`
    );
  };

  const handleClickStatus = (value: string) => {
    let statusList = advanceFilters?.status || [];
    if (statusList && !statusList.includes(value)) {
      statusList.push(value);
    } else if (statusList && statusList.includes(value)) {
      const index = statusList.indexOf(value);
      if (index > -1) {
        statusList.splice(index, 1);
      }
    } else {
      advanceFilters.status = [];
      statusList.push(value);
    }
    advanceFilters.status = statusList;
    formAdvanced.setFieldsValue(advanceFilters);
    setAdvanceFilters({ ...advanceFilters });
  };

  useEffect(() => {
    dispatch(
      SupplierGetAllAction((stores) => {
        setAllSupplier(stores);
      })
    );

    dispatch(
      getListStoresSimpleAction((stores) => {
        setAllStore(stores);
      })
    );
  }, [dispatch]);
  return (
    <Form.Provider>
      <Form onFinish={onBaseFinish} form={formBase} layout="inline">
        <FilterProcurementStyle>
          <Item name={BaseProcumentField.content} className="search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm phiếu nhập kho"
            />
          </Item>
          <Item name={BaseProcumentField.suppliers} className="suppliers">
            <SelectSupplierField isMulti />
          </Item>
          <Item name={BaseProcumentField.merchandisers} className="merchandisers">
            <SelectMerchandisers isMulti allowClear />
          </Item>
          <div className="btn-action">
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>

            <Item>
              <Button icon={<FilterOutlined />} onClick={openVisibleFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
            {/* <Item><ButtonSetting onClick={openColumn} /></Item> */}
          </div>
        </FilterProcurementStyle>
      </Form>

      {advanceFilters && (
        <FilterList
          filters={advanceFilters}
          resetField={resetField}
          allSupplier={allSupplier}
        />
      )}
      <BaseFilter
        onClearFilter={resetFilter}
        onFilter={() => {
          formAdvanced.submit();
        }}
        onCancel={cancelFilter}
        visible={visible}
        width={500}
      >
        <Form onFinish={onAdvanceFinish} initialValues={{}} form={formAdvanced}>
          <Space className="po-filter" direction="vertical" style={{ width: "100%" }}>
            {Object.keys(ProcurementFilterItem).map((field) => {
              let component: any = null;
              switch (field) {
                case ProcurementFilterItem.stockDate:
                case ProcurementFilterItem.confirmDate:
                case ProcurementFilterItem.expectDate:

                  component = <CustomRangePicker />;
                  break;

                case ProcurementFilterItem.stores:
                  component = <TreeStore name={field} form={formAdvanced} listStore={allStore}/>;
                  break;
                case ProcurementFilterItem.status:
                  component = (
                    <ProcurementStatusStyle>
                      {Object.keys(ProcurementStatus).map((item) => (
                        <Button
                          value={item}
                          onClick={() => handleClickStatus(item)}
                          className={
                            advanceFilters?.status?.includes(item) ? "active" : ""
                          }
                        >
                          {ProcurementStatusName[item]}
                        </Button>
                      ))}
                    </ProcurementStatusStyle>
                  );
                  break;
              }
              return (
                <Collapse key={field}>
                  <Panel
                    key="1"
                    header={<span>{ProcurementFilterName[field]?.toUpperCase()}</span>}
                  >
                    <Item name={field}>{component}</Item>
                  </Panel>
                </Collapse>
              );
            })}
          </Space>
        </Form>
      </BaseFilter>
    </Form.Provider>
  );
}
type FilterListProps = {
  filters: any;
  resetField: (field: string) => void;
  allSupplier: Array<SupplierResponse> | undefined;
};
const FilterList = ({ filters, resetField, allSupplier }: FilterListProps) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return <Fragment />;

        if (!ProcurementFilterName[filterKey]) return <Fragment />;

        switch (filterKey) {
          case ProcurementFilterItem.stockDate:
          case ProcurementFilterItem.confirmDate:
          case ProcurementFilterItem.expectDate:

            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${ProcurementFilterName[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${ProcurementFilterName[filterKey]} : ${formatedFrom} - ${formatedTo}`;
            break;

          // case ProcurementFilterItem.suppliers:
          //   if (Array.isArray(value) && value.length > 0) {
          //     let text = "";
          //     value?.forEach((id: number) => {
          //       allSupplier?.forEach((element: SupplierResponse, index: number) => {
          //         if (id === element.id) {
          //           text += ", " + allSupplier[index].name;
          //         }
          //       });
          //     });
          //     renderTxt = `${ProcurementFilterName[filterKey]} : ${text.substr(1)}`;
          //   }
          //   break;
          case ProcurementFilterItem.stores:
            if (Array.isArray(value) && value.length > 0) {
              renderTxt = `${ProcurementFilterName[filterKey]} : ${value}`;
            }
            break;
          case ProcurementFilterItem.status:
            if (Array.isArray(value) && value.length > 0) {
              let statusText = "";
              value?.forEach(
                (item: string) => (statusText += ", " + ProcurementStatusName[item])
              );
              renderTxt = `${ProcurementFilterName[filterKey]} : ${statusText.substr(1)}`;
            }
        }
        if (!renderTxt) return <Fragment />;
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </Space>
  );
};
export default TabListFilter;
