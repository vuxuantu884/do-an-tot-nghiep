import React, { useCallback, useEffect, useState } from "react";
import { Card } from "antd";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import { StaffListStyled } from "screens/work-shift/work-shift-styled";
import StaffListFilter from "./component/Filter";
import StaffListTable from "./component/Table";
import { StaffQuery } from "model/staff/staff.model";
import { generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import { getQueryParamsFromQueryString } from "utils/useQuery";

const initQueryDefault = {
  key1: [],
  key2: null,
};
const StaffList: React.FC = () => {
  const history = useHistory();
  const queryParamsParsed: any = queryString.parse(window.location.search);

  const [params, setPrams] = useState<StaffQuery>({
    ...initQueryDefault,
  });

  const onFilter = useCallback(
    (values: any) => {
      let newPrams = { ...params, ...values };
      let queryParam = generateQuery(newPrams);
      history.replace(`${UrlConfig.WORK_SHIFT}/staff?${queryParam}`);
      setPrams({ ...newPrams });
    },
    [history, params],
  );

  const fetchDataWorkShiftCell = (query: StaffQuery) => {
    (async () => {
      try {
        // const customQuery = convertWorkShiftCellQuery(query);
        // const response = await getWorkShiftCellsService(customQuery);
        // setWorkShiftCellsResponse(response.data);
        // setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    })();
  };

  useEffect(() => {
    if (queryParamsParsed) {
      let paramDefault: StaffQuery = getQueryParamsFromQueryString(queryParamsParsed) as StaffQuery;

      console.log("paramDefault", paramDefault);
      let dataQuery: StaffQuery = {
        ...initQueryDefault,
        ...paramDefault,
      };
      setPrams(dataQuery);

      fetchDataWorkShiftCell(dataQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.search]);
  return (
    <StaffListStyled>
      <ContentContainer
        title="Phân ca"
        breadcrumb={[
          {
            name: "Phân ca",
            path: UrlConfig.WORK_SHIFT,
          },
          {
            name: "Danh sách nhân viên",
          },
        ]}
      >
        <Card>
          <StaffListFilter onFilter={onFilter} params={params} />
          <StaffListTable />
        </Card>
      </ContentContainer>
    </StaffListStyled>
  );
};

export default StaffList;
