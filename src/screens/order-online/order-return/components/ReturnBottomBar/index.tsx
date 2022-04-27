import { Button } from "antd";
import CustomSelect from "component/custom/select.custom";
import { RootReducerType } from "model/reducers/RootReducerType";
import React from "react";
import { useSelector } from "react-redux";
import { RETURN_TYPES } from "utils/Order.constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  onReturn: () => void;
  onReturnAndPrint: () => void;
  onReturnAndExchange: () => void;
  onReturnAndExchangeAndPrint: () => void;
  onCancel: () => void;
  isCanExchange: boolean;
  isExchange: boolean;
  setReturnType: (value: string|undefined) => void;
};

function ReturnBottomBar(props: PropTypes) {
  const {
    onReturn,
    onReturnAndPrint,
    onReturnAndExchange,
    onReturnAndExchangeAndPrint,
    onCancel,
    isExchange,
    setReturnType,
  } = props;

  const isLoadingDiscount = useSelector(
    (state: RootReducerType) => state.orderReducer.isLoadingDiscount
  );

  return (
    <StyledComponent>
      <div className="bottomBar">
        <div className="bottomBar__left"></div>
        <div className="bottomBar__right">
          <Button
            onClick={() => {
              onCancel();
            }}
          >
            Hủy
          </Button>

          <CustomSelect
            placeholder="Chọn kiểu trả hàng"
            notFoundContent="Không tìm thấy kết quả"
            style={{width: "100%"}}
            optionFilterProp="children"
            showArrow
            getPopupContainer={(trigger) => trigger.parentNode}
            allowClear
            onChange={setReturnType}
            id="selectReturnType"
          >
            {RETURN_TYPES.map((type) => (
              <CustomSelect.Option
                key={type.value.toString()}
                value={type.value.toString()}
              >
                {type.name}
              </CustomSelect.Option>
            ))}
          </CustomSelect>

          {!isExchange ? (
            <React.Fragment>
              <Button
                type="primary"
                ghost
                onClick={() => {
                  onReturn();
                }}
                id="btn-return"
              >
                Trả hàng (F9)
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  onReturnAndPrint();
                }}
                id="btn-return-print"
              >
                Trả hàng và in hóa đơn (F10)
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button
                type="primary"
                ghost
                onClick={() => {
                  onReturnAndExchange();
                }}
                disabled={isLoadingDiscount}
                id="btn-return"
              >
                Trả và đổi hàng (F9)
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  onReturnAndExchangeAndPrint();
                }}
                disabled={isLoadingDiscount}
                id="btn-return-print"
              >
                Trả và đổi hàng và in hóa đơn (F10)
              </Button>
            </React.Fragment>
          )}
          
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
