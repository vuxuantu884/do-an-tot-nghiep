import { Form } from "antd";
import CustomSelect from "component/custom/select.custom";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderRequest } from "model/request/order.request";
import { SourceSearchQuery } from "model/request/source.request";
import { OrderResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { departmentDetailApi } from "service/accounts/department.service";
import { getSourcesWithParamsService } from "service/order/order.service";
import {
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  isFetchApiSuccessful,
  sortSources,
} from "utils/AppUtils";
import { StyleComponent } from "./style";
import * as CONSTANTS from "utils/Constants";
import { fullTextSearch } from "utils/StringUtils";

type Props = {
  orderDetail?: OrderResponse | null;
  setOrderSourceId?: (value: number) => void;
  isDisableSelectSource?: boolean;
  initialForm?: OrderRequest;
  updateOrder?: boolean;
};

let initListSource: SourceResponse[] = [];
const ExtraCardCustomer: React.FC<Props> = (props: Props) => {
  const { orderDetail, initialForm, updateOrder, isDisableSelectSource, setOrderSourceId } = props;
  const dispatch = useDispatch();
  const sourceInputRef = useRef();

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);

  useEffect(() => {
    const getDepartmentIds = async () => {
      let departmentId = userReducer.account?.account_jobs[0]?.department_id;
      let departmentIds: number[] = [];
      if (departmentId) {
        departmentIds.push(departmentId);
        departmentDetailApi(departmentId).then((response) => {
          if (isFetchApiSuccessful(response)) {
            departmentIds.push(response.data.parent_id);
          } else {
            handleFetchApiError(response, "Chi tiết phòng ban", dispatch);
          }
        });
      }
      return departmentIds;
    };
    const getOrderSources = async (departmentIds: number[]) => {
      let result: SourceResponse[] = [];
      await getSourcesWithParamsService({
        limit: 30,
      }).then(async (response) => {
        if (isFetchApiSuccessful(response)) {
          result = await sortSources(response.data.items, departmentIds);
          return result;
        } else {
          handleFetchApiError(response, "Nguồn đơn hàng", dispatch);
        }
      });
      return result;
    };
    const checkIfInitOrderSourceIncludesOrderDetailSource = (sources: SourceResponse[]) => {
      if (orderDetail?.source_id === CONSTANTS.POS.source_id) {
        return false;
      }
      const init = initialForm?.source_id || orderDetail?.source_id;
      if (sources.some((single) => single.id === init)) {
        return true;
      }
      return false;
    };
    const getOrderSourceByDepartmentId = async (departmentIds: number[]) => {
      let result: SourceResponse[] = [];
      if (departmentIds.length > 0) {
        await getOrderSources(departmentIds).then(async (response) => {
          result = response;
        });
      }
      let sortedSources = result;
      let id = orderDetail?.source_id || initialForm?.source_id;
      if (id && updateOrder) {
        let sortedSourcesResult = sortedSources.filter(
          (x) => x.name.toLowerCase() !== CONSTANTS.POS.source_code.toLowerCase(),
        );
        if (!checkIfInitOrderSourceIncludesOrderDetailSource(sortedSources)) {
          const query: SourceSearchQuery = {
            ids: [id],
            // active: true, // mở
          };
          await getSourcesWithParamsService(query).then((responseSource) => {
            if (isFetchApiSuccessful(responseSource)) {
              let items = responseSource.data.items;
              sortedSources = [...sortedSourcesResult, ...items];
              return sortedSources;
            } else {
              handleFetchApiError(responseSource, "Nguồn đơn hàng", dispatch);
            }
          });
        }
        result = [...sortedSources];
        return result;
      } else {
        result = sortedSources.filter((x) => {
          return x.name.toLowerCase() !== CONSTANTS.POS.source_code.toLowerCase() && x.active;
        });
        return result;
      }
    };
    const setDefaultOrderSource = async (sources: SourceResponse[]) => {
      let checkIfHasDefault = sources.find((source) => source.default);
      if (checkIfHasDefault) {
        /**
         * tạm thời chưa dùng
         */
        // if (form && initialForm && !initialForm.source_id) {
        //   if(!initDefaultOrderSourceId) {
        //     form.setFieldsValue({
        //       source_id: checkIfHasDefault.id
        //     })
        //   }
        // }
        return sources;
      } else {
        let result = sources;
        const params: SourceSearchQuery = {
          page: 1,
          limit: 100,
          active: true,
        };
        await getSourcesWithParamsService(params).then((response) => {
          if (isFetchApiSuccessful(response)) {
            const defaultOrderSource = response.data.items.find(
              (single) => single.default && single.name.toLowerCase() !== CONSTANTS.POS.source_code,
            );
            if (defaultOrderSource) {
              result.push(defaultOrderSource);
              /**
               * tạm thời chưa dùng
               */
              // if(isAutoDefaultOrderSource) {
              //   if(initialForm && !initialForm.source_id) {
              //     if(!initDefaultOrderSourceId) {
              //       form?.setFieldsValue({
              //         source_id: defaultOrderSource.id
              //       })

              //     } else {
              //       form?.setFieldsValue({
              //         source_id: initDefaultOrderSourceId
              //       })
              //     }
              //   }
              // }
            }
          } else {
            handleFetchApiError(response, "Nguồn đơn hàng", dispatch);
          }
        });
        return result;
      }
    };
    const fetchData = async () => {
      let result: SourceResponse[] = [];
      let departmentIds = await getDepartmentIds();
      result = await getOrderSourceByDepartmentId(departmentIds);
      result = await setDefaultOrderSource(result);
      initListSource = result;
      setListSource(result);
    };
    fetchData();
  }, [
    orderDetail?.source_id,
    dispatch,
    initialForm?.source_id,
    updateOrder,
    userReducer.account?.account_jobs,
  ]);
  const handleSearchOrderSources = useCallback((value: string) => {
    if (value.length > 1) {
      handleDelayActionWhenInsertTextInSearchInput(sourceInputRef, () => {
        let query = {
          name: value,
          active: true,
        };
        getSourcesWithParamsService(query)
          .then((response) => {
            setListSource(response.data.items);
          })
          .catch((error) => {
            console.log("error", error);
          });
      });
    } else {
      setListSource(initListSource);
    }
  }, []);
  const renderSelectOrderSource = () => {
    return (
      <div>
        <span
          style={{
            float: "left",
            lineHeight: "40px",
            marginRight: "10px",
          }}
        >
          Nguồn <span className="text-error">*</span>
        </span>
        <Form.Item
          name="source_id"
          style={{ margin: "0px" }}
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nguồn đơn hàng",
            },
          ]}
        >
          <CustomSelect
            style={{ width: 300, borderRadius: "6px" }}
            showArrow
            allowClear
            showSearch
            onSearch={handleSearchOrderSources}
            placeholder="Nguồn đơn hàng"
            notFoundContent="Không tìm thấy kết quả"
            filterOption={(input, option: any) => fullTextSearch(input, option?.children)}
            onChange={(value) => {
              setOrderSourceId && setOrderSourceId(value);
            }}
            disabled={isDisableSelectSource && false} // mở update
          >
            {listSource.map((item, index) => (
              <CustomSelect.Option style={{ width: "100%" }} key={index.toString()} value={item.id}>
                {item.name}
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </Form.Item>
      </div>
    );
  };

  const renderInfoOrderSource = () => {
    return (
      <div className="d-flex align-items-center form-group-with-search">
        <span
          style={{
            float: "left",
            lineHeight: "40px",
          }}
        >
          <span style={{ marginRight: "10px" }}>Nguồn:</span>
          <span className="text-error">
            <span style={{ color: "red" }}>{orderDetail?.source}</span>
          </span>
        </span>
      </div>
    );
  };
  return (
    <StyleComponent>
      {orderDetail
        ? orderDetail.source?.toLocaleLowerCase() === CONSTANTS.POS.source.toLocaleLowerCase() ||
          props.updateOrder
          ? renderSelectOrderSource()
          : renderInfoOrderSource()
        : renderSelectOrderSource()}
    </StyleComponent>
  );
};

export default ExtraCardCustomer;
