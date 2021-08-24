import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { actionFetchPrinterDetail } from "domain/actions/printer/printer.action";
import { PrinterModel } from "model/response/printer.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { LIST_PRINTER_TYPES } from "utils/Printer.constants";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from "./styles";

type PropType = {};

function SinglePrinter(props: PropType) {
  const FAKE_SINGLE_THIRD_PARTY_LOGISTIC_DETAIL = [];
  const paramsId = useParams<{ id: string }>();
  const { id } = paramsId;
  console.log("id", id);
  const dispatch = useDispatch();

  const [ListServices, setListServices] = useState([]);
  const [ListShops, setListShops] = useState([]);
  useEffect(() => {}, [dispatch, id]);

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
            name: "Kết nối hãng vận chuyển",
          },
        ]}
      >
        <div className="singleThirdPartyLogistic">
          <section className="singleThirdPartyLogistic__top"></section>
        </div>
      </ContentContainer>
    </StyledComponent>
  );
}

export default SinglePrinter;
