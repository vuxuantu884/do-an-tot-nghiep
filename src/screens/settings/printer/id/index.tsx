import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { actionFetchPrinterDetail } from "domain/actions/printer/printer.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PrinterModel } from "model/response/printer.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { DEFAULT_FORM_VALUE } from "utils/Constants";
import { LIST_PRINTER_TYPES } from "utils/Printer.constants";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

function SinglePrinter() {
  const dispatch = useDispatch();
  const [singlePrinterContent, setSinglePrinterContent] =
    useState<PrinterModel>({
      company: DEFAULT_FORM_VALUE.company,
      company_id: DEFAULT_FORM_VALUE.company_id,
      store_id: 0,
      id: 0,
      print_size: "",
      default: false,
      template: "",
      type: "",
    });

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const paramsId = useParams<{ id: string }>();
  const { id } = paramsId;
  const [printerName, setPrinterName] = useState("");
  const query = useQuery();
  let queryPrintSize = query.get("print-size");

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const params = useMemo(() => {
    let result = {
      "print-size": bootstrapReducer.data?.print_size[0].value || "a4",
    };
    if (queryPrintSize) {
      result = {
        "print-size": queryPrintSize,
      };
    }
    return result;
  }, [bootstrapReducer.data?.print_size, queryPrintSize]);

  useEffect(() => {
    const findPrinter = (printerType: string) => {
      return LIST_PRINTER_TYPES.find((singlePrinter) => {
        return singlePrinter.value === printerType;
      });
    };
    dispatch(
      actionFetchPrinterDetail(+id, params, (data: PrinterModel) => {
        setSinglePrinterContent(data);
        const printer = findPrinter(data.type);
        if (printer) {
          setPrinterName(printer.name);
        }
      })
    );
  }, [dispatch, id, params]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Chi tiết mẫu in"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Danh sách mẫu in",
            path: UrlConfig.PRINTER,
          },
          {
            name: printerName,
          },
        ]}
      >
        <FormPrinter type="edit" id={id} formValue={singlePrinterContent} />
      </ContentContainer>
    </StyledComponent>
  );
}

export default SinglePrinter;
