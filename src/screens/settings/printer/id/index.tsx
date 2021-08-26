import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { actionFetchPrinterDetail } from "domain/actions/printer/printer.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { BasePrinterModel } from "model/response/printer.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { DEFAULT_FORM_VALUE } from "utils/Constants";
import { LIST_PRINTER_TYPES } from "utils/Printer.constants";
import { useQuery } from "utils/useQuery";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

function SinglePrinter() {
  const dispatch = useDispatch();
  const [singlePrinterContent, setSinglePrinterContent] =
    useState<BasePrinterModel>({
      company: DEFAULT_FORM_VALUE.company,
      company_id: DEFAULT_FORM_VALUE.company_id,
      store_id: 0,
      id: 0,
      print_size: "",
      default: false,
      template: "",
      type: "",
    });

  const paramsId = useParams<{ id: string }>();
  const { id } = paramsId;
  const [printerName, setPrinterName] = useState("");
  const query = useQuery();
  let queryPrintSize = query.get("print-size");

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const defaultPrintSize = bootstrapReducer.data?.print_size[0].value || "a4";

  const queryParams = useMemo(() => {
    let result = {
      "print-size": defaultPrintSize,
    };
    if (queryPrintSize) {
      result = {
        "print-size": queryPrintSize,
      };
    }
    return result;
  }, [defaultPrintSize, queryPrintSize]);

  useEffect(() => {
    const findPrinter = (printerType: string) => {
      return LIST_PRINTER_TYPES.find((singlePrinter) => {
        return singlePrinter.value === printerType;
      });
    };
    dispatch(
      actionFetchPrinterDetail(+id, queryParams, (data: BasePrinterModel) => {
        setSinglePrinterContent(data);
        const printer = findPrinter(data.type);
        if (printer) {
          setPrinterName(printer.name);
        }
      })
    );
  }, [dispatch, id, queryParams]);

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
