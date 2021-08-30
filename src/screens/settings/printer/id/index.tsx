import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { actionFetchPrinterDetail } from "domain/actions/printer/printer.action";
import {
  BasePrinterModel,
  FormPrinterModel,
} from "model/response/printer.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { DEFAULT_FORM_VALUE } from "utils/Constants";
import { useQuery } from "utils/useQuery";
import FormPrinter from "../component/FormPrinter";
import { StyledComponent } from "./styles";

function SinglePrinter() {
  const dispatch = useDispatch();
  const viewAction: FormPrinterModel = "view";
  const editAction: FormPrinterModel = "edit";
  const [singlePrinterContent, setSinglePrinterContent] =
    useState<BasePrinterModel>({
      company: DEFAULT_FORM_VALUE.company,
      company_id: DEFAULT_FORM_VALUE.company_id,
      store_id: 0,
      id: 0,
      name: "",
      print_size: "",
      default: false,
      template: "",
      type: "",
    });

  const paramsId = useParams<{ id: string }>();
  const { id } = paramsId;
  const [printerName, setPrinterName] = useState("");
  const [actionSinglePrinter, setActionSinglePrinter] =
    useState<FormPrinterModel>(viewAction);
  const query = useQuery();
  let queryAction = query.get("action");

  const queryParams = useMemo(() => {
    let result = {
      action: "",
    };
    if (queryAction) {
      result = {
        action: queryAction,
      };
    }
    return result;
  }, [queryAction]);

  const breadCrumb = [
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
  ];

  const breadCrumbViewDetail = [
    ...breadCrumb,
    {
      name: printerName,
    },
  ];

  const breadCrumbEdit = [
    ...breadCrumb,
    {
      name: printerName,
      path: `${UrlConfig.PRINTER}/${id}`,
    },
    {
      name: "Tùy chỉnh mẫu in",
    },
  ];

  useEffect(() => {
    dispatch(
      actionFetchPrinterDetail(+id, queryParams, (data: BasePrinterModel) => {
        setSinglePrinterContent(data);
        if (data) {
          setPrinterName(data.name);
        }
      })
    );
  }, [dispatch, id, queryParams]);

  /**
   * kiểm tra action là view chi tiết hay sửa
   */
  useEffect(() => {
    let actionParam = queryParams.action;
    if (actionParam === editAction) {
      setActionSinglePrinter(editAction);
    } else {
      setActionSinglePrinter(viewAction);
    }
  }, [dispatch, id, queryParams]);

  return (
    <StyledComponent>
      <ContentContainer
        title={
          queryParams.action === editAction
            ? "Tùy chỉnh mẫu in"
            : "Chi tiết mẫu in"
        }
        breadcrumb={
          queryParams.action === editAction
            ? breadCrumbEdit
            : breadCrumbViewDetail
        }
      >
        <FormPrinter
          type={actionSinglePrinter}
          id={id}
          formValue={singlePrinterContent}
        />
      </ContentContainer>
    </StyledComponent>
  );
}

export default SinglePrinter;
