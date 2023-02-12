import { Radio } from "antd";
import { useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { useQuery } from "utils/useQuery";
import DashboardWithProvider from "./dashboard";
import { StyledComponent } from "./index.style";

const NewDashboard = (props: any) => {
  const history = useHistory();
  const query = useQuery();
  const defaultScreenQuery = query.get("default-screen");

  const defaultScreen = useMemo(() => {
    return defaultScreenQuery && defaultScreenQuery === "dash-board"
      ? defaultScreenQuery
      : "dash-board";
  }, [defaultScreenQuery]);
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
        </Radio.Group>
      </div>
      {defaultScreenQuery !== "key-driver-online" &&
        defaultScreenQuery !== "key-driver-offline" && <DashboardWithProvider />}
    </StyledComponent>
  );
};

export default NewDashboard;
