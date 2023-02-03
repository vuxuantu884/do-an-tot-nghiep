import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Input } from "antd";
import imageDefault from "assets/icon/img-default.svg";
import { CustomerSearchSo, getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerResponse } from "model/response/customer/customer.response";
import { RefSelectProps } from "rc-select";
import { createRef, useCallback, useMemo, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import { StyleComponent } from "./style";
type Props = {
  keySearch: string;
  setKeySearch: (v: string) => void;
  id?: string;
  onSelect?: (v: CustomerResponse) => void;
  handleConfirmCreate?: () => void;
};

var barCode = "";
var isBarcode = false;

const initQueryCustomer: CustomerSearchQuery = {
  request: "",
  limit: 5,
  page: 1,
  gender: null,
  from_birthday: null,
  to_birthday: null,
  company: null,
  from_wedding_date: null,
  to_wedding_date: null,
  customer_type_ids: [],
  customer_group_ids: [],
  customer_level_id: undefined,
  responsible_staff_codes: null,
  search_type: "SIMPLE",
};

const SearchCustomerAutoComplete: React.FC<Props> = (props: Props) => {
  const { keySearch, setKeySearch, onSelect, id, handleConfirmCreate } = props;

  const dispatch = useDispatch();
  const autoCompleteRef = createRef<RefSelectProps>();

  const [searchCustomer, setIsSearchCustomer] = useState(false);
  const [resultSearchCustomer, setResultSearchCustomer] = useState<CustomerResponse[]>([]);

  const onSearchCustomerSelect = useCallback(
    (v, variant) => {
      let newV = parseInt(v);
      const result = [...resultSearchCustomer];
      const index = result.findIndex((p) => p.id === newV);
      if (index === -1) {
        return;
      }
      dispatch(
        getCustomerDetailAction(result[index].id, (data: CustomerResponse | null) => {
          if (data && onSelect) {
            onSelect(data);
          }
        }),
      );

      if (autoCompleteRef && autoCompleteRef.current && autoCompleteRef.current.blur)
        autoCompleteRef.current?.blur();
      setKeySearch("");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resultSearchCustomer, dispatch, setKeySearch, onSelect],
  );

  const handleSearchCustomerData = useCallback(
    (value: string) => {
      initQueryCustomer.request = value.trim();
      dispatch(
        CustomerSearchSo(initQueryCustomer, (response) => {
          setResultSearchCustomer(response);
          setIsSearchCustomer(false);
        }),
      );
    },
    [dispatch],
  );

  const handleSearchProduct = useCallback(
    (value) => {
      setKeySearch(value);
      isBarcode = false;
      if (value.length >= 3) {
        setIsSearchCustomer(true);
      } else {
        setIsSearchCustomer(false);
        setResultSearchCustomer([]);
      }
      handleDelayActionWhenInsertTextInSearchInput(
        autoCompleteRef,
        () => {
          barCode = "";
          if (isBarcode === false) {
            handleSearchCustomerData(value);
          } else {
            const txtSearchCustomerElement: any = document.getElementById(`${id}`);
            txtSearchCustomerElement?.select();
            setKeySearch("");
          }
        },
        500,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setKeySearch, handleSearchCustomerData, id],
  );

  const handleBlur = useCallback(() => {
    if (keySearch.length === 0) {
      setResultSearchCustomer([]);
    }
  }, [keySearch]);

  const searchVariantSuccess = useCallback(
    (data: CustomerResponse[]) => {
      if (data.length === 0) {
        showError("Không tìm thấy khách hàng!");
      } else {
        dispatch(
          getCustomerDetailAction(data[0].id, (data: CustomerResponse | null) => {
            if (data && onSelect) {
              onSelect(data);
            }
          }),
        );
        setKeySearch("");
        setResultSearchCustomer([]);
      }
      setIsSearchCustomer(false);
    },
    [dispatch, onSelect, setKeySearch],
  );

  const handleBarcodeProduct = useCallback(
    (barcode: string) => {
      initQueryCustomer.request = barcode;
      setIsSearchCustomer(true);
      dispatch(
        CustomerSearchSo(initQueryCustomer, (data: Array<CustomerResponse>) => {
          if (data && data.length !== 0) {
            searchVariantSuccess(data);
          } else {
            showError("Không tìm thấy khách hàng từ hệ thống");
          }
          setKeySearch("");
        }),
      );
    },
    [dispatch, searchVariantSuccess, setKeySearch],
  );

  const eventKeydownProduct = useCallback(
    (event: any) => {
      if (event.key === "Enter") {
        isBarcode = true;
        if (barCode !== "" && event) {
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
    [setKeySearch, handleBarcodeProduct],
  );

  //Render result search
  const CustomerRenderSearchResult = (item: CustomerResponse) => {
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100" style={{ lineHeight: "35px" }}>
          <img src={imageDefault} alt="anh" placeholder={imageDefault} className="logo-customer" />
          <div className="rs-info w-100">
            <span style={{ display: "flex" }}>
              {item.full_name}{" "}
              <i
                className="icon-dot"
                style={{
                  fontSize: "4px",
                  margin: "16px 10px 10px 10px",
                  color: "#737373",
                }}
              ></i>{" "}
              <span style={{ color: "#737373" }}>{item.phone}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomerConvertResultSearch = useMemo(() => {
    let options: any[] = [];
    if (resultSearchCustomer.length > 0) {
      resultSearchCustomer.forEach((item: CustomerResponse, index: number) => {
        options.push({
          label: CustomerRenderSearchResult(item),
          value: item.id ? item.id.toString() : "",
        });
      });
    }
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, resultSearchCustomer]);

  return (
    <StyleComponent>
      <AutoComplete
        notFoundContent={keySearch.length >= 3 ? "Không tìm thấy khách hàng" : undefined}
        value={keySearch}
        id={id}
        dropdownMatchSelectWidth={530}
        onSelect={onSearchCustomerSelect}
        onSearch={handleSearchProduct}
        onKeyDown={eventKeydownProduct}
        onBlur={handleBlur}
        options={CustomerConvertResultSearch}
        maxLength={255}
        defaultActiveFirstOption
        ref={autoCompleteRef}
        dropdownClassName="search-layout dropdown-search-header"
        style={{ width: "100%" }}
        dropdownRender={
          handleConfirmCreate
            ? (menu) => (
                <div className="dropdown-custom">
                  <Button
                    // icon={<AiOutlinePlusCircle size={24} />} // tam bo icon dung symbol
                    className="dropdown-custom-add-new"
                    type="link"
                    onClick={() => handleConfirmCreate()}
                  >
                    + Thêm mới khách hàng
                  </Button>
                  {menu}
                </div>
              )
            : undefined
        }
      >
        <Input
          size="middle"
          placeholder="Tìm hoặc thêm khách hàng... (F4)"
          prefix={
            searchCustomer ? (
              <LoadingOutlined style={{ color: "#2a2a86" }} />
            ) : (
              <SearchOutlined style={{ color: "#ABB4BD" }} />
            )
          }
        />
      </AutoComplete>
    </StyleComponent>
  );
};
export default SearchCustomerAutoComplete;
