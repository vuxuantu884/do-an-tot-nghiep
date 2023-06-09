import { LoadingOutlined } from "@ant-design/icons";
import { AutoComplete, Input } from "antd";
import { RefSelectProps } from "rc-select";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import { VariantResponse } from "model/product/product.model";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { useDispatch } from "react-redux";
import { showError } from "utils/ToastUtils";
import { handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
import SearchedVariant from "component/search-product/SearchedVariant";
import { PageResponse } from "model/base/base-metadata.response";

type Props = {
  keySearch: string;
  setKeySearch: (v: string) => void;
  id?: string;
  onSelect?: (v?: VariantResponse, ds?: any) => void;
  storeId?: number | null;
  dataSource?: any;
  ref?: React.RefObject<RefSelectProps>;
  placeholder?: string;
  reloadVariantDataFlag?: number;
  defaultActiveFirstOption?: boolean;
  disabled?: boolean;
};

var barCode = "";
var isBarcode = false;

const SearchProductComponent: React.FC<Props> = (props: Props) => {
  const { keySearch, setKeySearch, onSelect, id, storeId, dataSource, ref } = props;
  const dispatch = useDispatch();
  const autoCompleteRef = ref ? ref : createRef<RefSelectProps>();

  const [resultSearchVariant, setResultSearchVariant] = useState<VariantResponse[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  const onSearchVariantSelect = useCallback(
    (v, variant) => {
      let newV = parseInt(v);
      const result = [...resultSearchVariant];
      const index = result.findIndex((p) => p.id === newV);
      if (index === -1) {
        return;
      }

      setKeySearch(result[index].sku);
      setResultSearchVariant([{ ...result[index] }]);
      if (onSelect) {
        onSelect({ ...result[index] }, dataSource);
        setKeySearch("");
      }
    },
    [resultSearchVariant, setKeySearch, onSelect, dataSource],
  );

  const handleSearchProductData = useCallback(
    (value: string) => {
      let initQueryVariant: any = {
        info: value,
        store_ids: storeId,
      };
      dispatch(
        searchVariantsOrderRequestAction(
          initQueryVariant,
          (data) => {
            if (data.items.length === 0) {
              showError("Không tìm thấy sản phẩm!");
              setResultSearchVariant([]);
            } else {
              setResultSearchVariant(data.items);
            }
            setIsSearchingProducts(false);
          },
          () => {
            setIsSearchingProducts(false);
          },
        ),
      );
    },
    [dispatch, storeId],
  );

  const handleSearchProduct = useCallback(
    (value) => {
      setKeySearch(value);
      isBarcode = false;
      if (value.length >= 3) {
        setIsSearchingProducts(true);
      } else {
        setIsSearchingProducts(false);
      }

      setResultSearchVariant([]);

      handleDelayActionWhenInsertTextInSearchInput(
        autoCompleteRef,
        () => {
          barCode = "";
          if (isBarcode === false) {
            handleSearchProductData(value);
          } else {
            const txtSearchProductElement: any = document.getElementById(`${id}`);
            txtSearchProductElement?.select();
            setKeySearch("");
          }
        },
        500,
      );
    },
    [setKeySearch, autoCompleteRef, handleSearchProductData, id],
  );

  useEffect(() => {
    if (storeId && typeof storeId === "number") {
      if (keySearch.length >= 3) {
        handleSearchProductData(keySearch);
      } else {
        setResultSearchVariant([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.reloadVariantDataFlag]);

  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <SearchedVariant item={item} />,
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearchVariant]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchVariantSuccess = (data: PageResponse<VariantResponse>) => {
    if (data.items.length === 0) {
      showError("Không tìm thấy sản phẩm!");
    } else {
      onSelect && onSelect(data.items[0], dataSource);
      setKeySearch(data.items[0].sku);
      setResultSearchVariant([]);
      const txtSearchProductElement: any = document.getElementById(`${id}`);
      txtSearchProductElement?.select();
    }
    setIsSearchingProducts(false);
  };

  const handleBarcodeProduct = useCallback(
    (barcode: string) => {
      let initQueryVariant: any = {
        info: barcode,
        store_ids: storeId,
      };
      setIsSearchingProducts(true);
      dispatch(
        searchVariantsOrderRequestAction(initQueryVariant, searchVariantSuccess, () => {
          setIsSearchingProducts(false);
        }),
      );
    },
    [storeId, dispatch, searchVariantSuccess],
  );

  const eventKeydownProduct = useCallback(
    (event: any) => {
      if (event.key === "Enter") {
        if (barCode !== "" && event) {
          isBarcode = true;
          let barCodeCopy = barCode;
          handleBarcodeProduct(barCodeCopy);
          barCode = "";
        }
      } else {
        barCode = barCode + event.key;
        isBarcode = false;
        handleDelayActionWhenInsertTextInSearchInput(
          autoCompleteRef,
          () => {
            barCode = "";
          },
          500,
        );
      }

      return;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleBarcodeProduct],
  );

  const handleBlur = useCallback(() => {
    if (keySearch.length === 0) {
      setResultSearchVariant([]);
    }
  }, [keySearch]);

  return (
    <React.Fragment>
      <AutoComplete
        notFoundContent={keySearch.length >= 3 ? "Không tìm thấy sản phẩm" : undefined}
        value={keySearch}
        id={id}
        dropdownMatchSelectWidth={530}
        onSelect={onSearchVariantSelect}
        onSearch={handleSearchProduct}
        onKeyDown={eventKeydownProduct}
        onBlur={handleBlur}
        options={convertResultSearchVariant}
        maxLength={255}
        defaultActiveFirstOption={props.defaultActiveFirstOption || false}
        ref={autoCompleteRef}
        dropdownClassName="search-layout dropdown-search-header"
        style={{ width: "100%" }}
        disabled={props.disabled}
      >
        <Input
          size="middle"
          placeholder={props.placeholder || "Tìm sản phẩm /Barcode sản phẩm"}
          prefix={
            isSearchingProducts ? (
              <LoadingOutlined style={{ color: "#2a2a86" }} />
            ) : (
              <img alt="" src={search} />
            )
          }
        />
      </AutoComplete>
    </React.Fragment>
  );
};

export default SearchProductComponent;
