import { Select, SelectProps, Spin } from "antd";
import { SpecialOrderOrderTypeInFormModel } from "model/order/special-order.model";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getListOrderApi, getReturnApi } from "service/order/order.service";
import {
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  isFetchApiSuccessful,
  removeMultiWhitespaceAndTrimText,
} from "utils/AppUtils";
import CustomSelect from "../select.custom";

export type OrderInformationModel = {
  id: number;
  code: string;
};

type Props = SelectProps<any> & {
  placeholder: string;
  initValue?: string;
  dataToSelect: OrderInformationModel[];
  initDataToSelect: OrderInformationModel[];
  setDataToSelect: (value: OrderInformationModel[]) => void;
  [res: string]: any;
  isDropdownAlwaysAtBottomLeft?: boolean;
  queryParam: { [res: string]: any };
  orderType: SpecialOrderOrderTypeInFormModel;
};

function OrderCustomSearchSelect(props: Props) {
  const {
    placeholder,
    initValue,
    dataToSelect,
    initDataToSelect,
    setDataToSelect,
    isDropdownAlwaysAtBottomLeft,
    queryParam,
    orderType,
    ...rest
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const inputRef: MutableRefObject<any> = useRef();
  const dispatch = useDispatch();

  const onSearch = useCallback(
    (value: string) => {
      const getOrders = (value: string) => {
        value = removeMultiWhitespaceAndTrimText(value);
        if (value.trim() !== "" && value.length >= 3) {
          setIsLoading(true);
          if (orderType === SpecialOrderOrderTypeInFormModel.order) {
            getListOrderApi({
              ...queryParam,
              search_term: value,
            })
              .then((response) => {
                if (isFetchApiSuccessful(response)) {
                  setDataToSelect(
                    response.data.items.map((single) => {
                      return {
                        id: single.id,
                        code: single.code,
                      };
                    }),
                  );
                } else {
                  handleFetchApiError(response, "Danh sách đơn hàng", dispatch);
                }
              })
              .catch((error) => {
                console.log("error", error);
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else if (orderType === SpecialOrderOrderTypeInFormModel.orderReturn) {
            getReturnApi({
              ...queryParam,
              search_term: value,
            })
              .then((response) => {
                if (isFetchApiSuccessful(response)) {
                  console.log("response222", response);
                  setDataToSelect(
                    response.data.items.map((single) => {
                      return {
                        id: single.id,
                        code: single.code_order_return,
                      };
                    }),
                  );
                } else {
                  handleFetchApiError(response, "Danh sách đơn hàng", dispatch);
                }
              })
              .catch((error) => {
                console.log("error", error);
              })
              .finally(() => {
                setIsLoading(false);
              });
          }
        } else if (value === "") {
          setDataToSelect(initDataToSelect);
        }
      };

      handleDelayActionWhenInsertTextInSearchInput(inputRef, () => getOrders(value));
    },
    [dispatch, initDataToSelect, orderType, queryParam, setDataToSelect],
  );

  const onClear = useCallback(() => {
    setDataToSelect(initDataToSelect);
  }, [initDataToSelect, setDataToSelect]);

  useEffect(() => {
    setDataToSelect(initDataToSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDataToSelect]);

  return (
    <CustomSelect
      loading={isLoading}
      showSearch
      showArrow
      onSearch={onSearch}
      onClear={onClear}
      allowClear
      optionFilterProp="children"
      placeholder={placeholder}
      notFoundContent={isLoading ? <Spin size="small" /> : "Không tìm thấy kết quả"}
      isDropdownAlwaysAtBottomLeft={isDropdownAlwaysAtBottomLeft}
      {...rest}
    >
      {dataToSelect.length > 0 &&
        dataToSelect.map((order) => (
          <Select.Option key={order.id} value={order.code}>
            {`${order.code}`}
          </Select.Option>
        ))}
    </CustomSelect>
  );
}

export default OrderCustomSearchSelect;
