import { Radio } from "antd";
import { ReportPermissions } from "config/permissions/report.permisstion";
import useAuthorization from "hook/useAuthorization";
import { useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import KeyDriverOfflineV2 from "screens/reports/key-driver-offline-v2";
import KeyDriverOnline from "screens/reports/key-driver-online";
import { generateQuery } from "utils/AppUtils";
import { useQuery } from "utils/useQuery";
import DashboardWithProvider from "./dashborad";
import { StyledComponent } from "./index.style";

const NewDashboard = (props: any) => {
  const history = useHistory();
  const query = useQuery();
  const defaultScreenQuery = query.get("default-screen");
  const [allowViewReportOnline] = useAuthorization({
    acceptPermissions: [ReportPermissions.reports_view_report_online],
    not: false,
  });

  const [allowViewReportOffline] = useAuthorization({
    acceptPermissions: [ReportPermissions.reports_view_report_offline],
    not: false,
  });
  const defaultScreen = useMemo(() => {
    return defaultScreenQuery &&
      (defaultScreenQuery === "dash-board" ||
        (defaultScreenQuery === "key-driver-online" && allowViewReportOnline) ||
        (defaultScreenQuery === "key-driver-offline" && allowViewReportOffline))
      ? defaultScreenQuery
      : "dash-board";
  }, [allowViewReportOffline, allowViewReportOnline, defaultScreenQuery]);
  const onChangeOrderOptions = useCallback(
    (e) => {
      let queryParam = generateQuery({
        "default-screen": e.target.value,
      });
      history.push(`?${queryParam}`);
    },
    [history],
  );

  return (
    <StyledComponent>
      <div className="dash-board-options">
        <Radio.Group onChange={(e) => onChangeOrderOptions(e)} value={defaultScreen}>
          <Radio.Button value="dash-board">Dashboard</Radio.Button>
          {allowViewReportOnline && (
            <Radio.Button value="key-driver-online">Key Driver Online</Radio.Button>
          )}
          {allowViewReportOffline && (
            <Radio.Button value="key-driver-offline">Key Driver Offline</Radio.Button>
          )}
        </Radio.Group>
      </div>
      {defaultScreenQuery !== "key-driver-online" &&
        defaultScreenQuery !== "key-driver-offline" && <DashboardWithProvider />}
      {allowViewReportOnline && defaultScreenQuery === "key-driver-online" && <KeyDriverOnline />}
      {allowViewReportOffline && defaultScreenQuery === "key-driver-offline" && (
        <KeyDriverOfflineV2 />
      )}
    </StyledComponent>
  );
};

export default NewDashboard;
