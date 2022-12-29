import { SelectProps, Spin } from "antd";
import CustomSelect from "component/custom/select.custom";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import React, { MutableRefObject, useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";

type Props = SelectProps<any> & {
  placeholder: string;
  isSearchProductActive?: boolean;
};

const ProductSkuMultiSelect: React.FC<Props> = (props: Props) => {
  const { placeholder, isSearchProductActive, ...rest } = props;
  const dispatch = useDispatch();
  const inputRef: MutableRefObject<any> = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [resultSearchVariants, setResultSearchVariants] = useState<VariantResponse[]>([]);

  const handleSearchProduct = useCallback(
    (value: string) => {
      if (!value || (value && value.trim().length === 0)) {
        setIsLoading(false);
        return;
      }
      let initQueryVariant: VariantSearchQuery = {
        info: value,
        limit: 5,
      };

      handleDelayActionWhenInsertTextInSearchInput(inputRef, () => {
        setIsLoading(true);
        dispatch(
          searchVariantsOrderRequestAction(
            initQueryVariant,
            (data) => {
              setIsLoading(false);
              if (data.items.length !== 0) {
                setResultSearchVariants(data.items);
              }
            },
            () => {
              setIsLoading(false);
            },
          ),
        );
      });
    },
    [dispatch],
  );

  const handleClear = () => {
    setResultSearchVariants([]);
    setIsLoading(false);
  };
  return (
    <React.Fragment>
      <CustomSelect
        loading={isLoading}
        mode="multiple"
        showSearch
        showArrow
        maxTagCount="responsive"
        allowClear
        optionFilterProp="children"
        placeholder={placeholder}
        notFoundContent={isLoading ? <Spin size="small" /> : "Không tìm thấy kết quả"}
        {...rest}
        onSearch={handleSearchProduct}
        onClear={() => {
          handleClear();
        }}
        onBlur={() => {
          handleClear();
        }}
      >
        {resultSearchVariants.length > 0 &&
          resultSearchVariants.map((p) => (
            <CustomSelect.Option key={p.id} value={p.sku}>
              {`${p.sku}`}
            </CustomSelect.Option>
          ))}
      </CustomSelect>
    </React.Fragment>
  );
};

export default ProductSkuMultiSelect;
