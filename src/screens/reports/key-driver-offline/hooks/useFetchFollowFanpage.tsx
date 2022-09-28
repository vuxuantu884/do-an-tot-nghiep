import { TODAY } from "config/dashboard";
import { ASM_LIST, KDOfflineTotalSalesParams, KeyDriverDimension } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDFollowFanpage } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineContext } from "../provider/kd-offline-provider";
import { calculateDimSummary } from "../utils/DimSummaryUtils";
import { findKDAndUpdateFollowFanpageValue } from "../utils/FollowFanpageUtils";

function useFetchFollowFanpage(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedDate, selectedStaffs } =
    useContext(KDOfflineContext);

  const [isFetchingFollowFanpage, setIsFetchingFollowFanpage] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let dimKey: "department_lv2" | "pos_location_name" | "store_name" | undefined = undefined;
      const { Asm, Store } = KeyDriverDimension;
      switch (dimension) {
        case Asm:
          dimKey = "department_lv2";
          break;
        case Store:
          dimKey = "store_name";
          break;
        default:
          break;
      }
      findKDAndUpdateFollowFanpageValue({
        data,
        asmData,
        columnKey,
        selectedDate,
        dimKey,
      });
    },
    [dimension, selectedDate],
  );

  const refetchFollowFanpage = useCallback(() => {
    const fetchFollowFanpage = async () => {
      const { Asm, Store, Staff } = KeyDriverDimension;
      if (dimension === Store && (!selectedStores.length || !selectedAsm.length)) {
        return;
      }
      if (
        dimension === Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingFollowFanpage(true);
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: dimension === Asm ? [] : selectedStores,
        departmentLv2s: dimension === Asm ? ASM_LIST : selectedAsm,
      };
      if (dimension === Staff) {
        setIsFetchingFollowFanpage(false);
        return;
      }
      // const dayApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDFollowFanpage, {
      //   ...params,
      //   from: selectedDate,
      //   to: selectedDate,
      // });
      const dayApi = Promise.resolve([]);
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDFollowFanpage, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDFollowFanpage, {
          ...params,
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Lượt follow fanpage");
          setIsFetchingFollowFanpage(false);
          return;
        }
        const dimName = "";
        const dimKeys = {
          asmDim: "department_lv2",
          storeDim: "store_name",
        };
        let resDayDim: any[] = [];
        if (resDay.length) {
          if (dimension === Asm) {
            resDayDim = resDay.map((item: any) => {
              if (item.department_lv2 === null) {
                item.department_lv2 = "COMPANY";
              }
              return item;
            });
          } else {
            resDayDim = calculateDimSummary(resDay[0], dimension, dimName, dimKeys);
          }
        }
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Lượt follow fanpage");
          }
          if (resDay.length) {
            if (resDayDim.length) {
              setData((prev: any) => {
                let dataPrev: any = prev[0];
                resDayDim.forEach((item: any) => {
                  findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
                });
                prev[0] = dataPrev;
                return [...prev];
              });
            }
          }
          setIsFetchingFollowFanpage(false);
          return;
        }

        if (resMonth.length) {
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            if (resDay.length) {
              resDayDim.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
            }
            let resMonthDim: any[] = [];
            if (dimension === Asm) {
              resMonthDim = resMonth.map((item: any) => {
                if (item.department_lv2 === null) {
                  item.department_lv2 = "COMPANY";
                }
                return item;
              });
            } else {
              resMonthDim = calculateDimSummary(resMonth[0], dimension, dimName, dimKeys);
            }
            resMonthDim.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
        }
      });

      setIsFetchingFollowFanpage(false);
    };
    if (selectedDate) {
      fetchFollowFanpage();
    }
  }, [
    dimension,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedDate,
    selectedStaffs,
    selectedStores,
    setData,
  ]);

  useEffect(() => {
    refetchFollowFanpage();
  }, [refetchFollowFanpage]);

  return {
    isFetchingFollowFanpage,
    refetchFollowFanpage,
  };
}

export default useFetchFollowFanpage;
