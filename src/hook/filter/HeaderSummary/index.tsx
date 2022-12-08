import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { ProductHelper } from "utils";
import { Tooltip } from "antd";
import { sortActionColor } from "utils/global-styles/variables";
import "./index.scss";

/**
 * This is for reusability and maintainability
 */
export type SortType = "asc" | "desc";

export const HeaderSummary = (
  total: number | undefined,
  header: string,
  field: string,
  onSort: (sortColumn: string, type: SortType) => void,
  sortType: string | undefined, // asc | desc
  active: boolean = false,
  tooltip?: string,
) => {
  const Inner = (
    <div className="inventory-index">
      <div
        className={active ? "field-active" : ""}
        style={{
          display: "inline-flex",
          wordBreak: "initial",
          ...{ lineHeight: total ? 1 : "unset" },
        }}
      >
        {header}{" "}
        <div className="block-sort">
          <CaretUpOutlined
            className={sortType === "asc" && active ? "field-active" : ""}
            style={{ color: sortActionColor, fontSize: 12 }}
            title="Sắp xếp tăng dần"
            size={5}
            onClick={() => {
              onSort(field, "asc");
            }}
          />
          <CaretDownOutlined
            className={sortType === "desc" && active ? "field-active" : ""}
            style={{ color: sortActionColor, fontSize: 12 }}
            title="Sắp xếp giảm dần"
            size={10}
            onClick={() => {
              onSort(field, "desc");
            }}
          />
        </div>
      </div>
      {total ? (
        <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              fontSize: "80%",
              color: "#808080",
              position: "absolute",
              bottom: 0,
            }}
          >{`${ProductHelper.formatCurrencyForProduct(total, ".")}`}</div>
        </div>
      ) : null}
    </div>
  );

  return tooltip ? (
    <Tooltip title={tooltip} placement="top">
      {Inner}
    </Tooltip>
  ) : (
    { Inner }
  );
};
