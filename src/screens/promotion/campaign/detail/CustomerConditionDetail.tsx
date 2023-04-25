import { CustomerGroups } from "domain/actions/customer/customer.action";
import { LoyaltyRankSearch } from "domain/actions/loyalty/rank/loyalty-rank.action";
import { PageResponse } from "model/base/base-metadata.response";
import { CustomerSelectionOption, Gender } from "model/promotion/price-rules.model";
import { CustomerGroupModel } from "model/response/customer/customer-group.response";
import { LoyaltyRankResponse } from "model/response/loyalty/ranking/loyalty-rank.response";
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { PromotionCampaignResponse } from "model/promotion/campaign.model";

export default function CustomerConditionDetail(props: PromotionCampaignResponse): ReactElement {
  const {
    customer_selection,
    prerequisite_genders,
    prerequisite_birthday_duration,
    prerequisite_wedding_duration,
    prerequisite_customer_group_ids,
    prerequisite_customer_loyalty_level_ids,
  } = props;

  const dispatch = useDispatch();
  const [groups, setGroups] = React.useState<Map<number, CustomerGroupModel>>();
  const [rankingList, setRankingList] = React.useState<Map<number, LoyaltyRankResponse>>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const getCustomerGroupName = useCallback(() => {
    const temps: string[] = [];
    if (!prerequisite_customer_group_ids || prerequisite_customer_group_ids.length === 0) {
      return "--";
    } else {
      prerequisite_customer_group_ids?.forEach((id: number) => {
        const name = groups?.get(id)?.name;
        if (name) {
          temps.push(name);
        }
      });
      return temps.join(", ");
    }
  }, [groups, prerequisite_customer_group_ids]);

  const getCustomerRankName = useCallback(() => {
    const temps: string[] = [];
    if (
      !prerequisite_customer_loyalty_level_ids ||
      prerequisite_customer_loyalty_level_ids.length === 0
    ) {
      return "--";
    } else
      prerequisite_customer_loyalty_level_ids?.forEach((id: number) => {
        const name = rankingList?.get(id)?.name;
        if (name) {
          temps.push(name);
        }
      });
    return temps.join(", ");
  }, [prerequisite_customer_loyalty_level_ids, rankingList]);

  const convertDateValue = (dateValue: Array<string>) => {
    if (!Array.isArray(dateValue) || !dateValue?.length) {
      return "---";
    }
    const startDate = dateValue[0]?.slice(0, 2) + "/" + dateValue[0]?.slice(2, 4);

    let endDate = "";
    if (dateValue[1]) {
      endDate = dateValue[1]?.slice(0, 2) + "/" + dateValue[1]?.slice(2, 4);
    }
    return startDate + " - " + endDate;
  };

  const customerConditionList = useMemo(() => {
    return [
      {
        title: "Giới tính",
        info:
          prerequisite_genders && prerequisite_genders?.length > 0
            ? prerequisite_genders
                ?.map((item: string) => {
                  if (item.toLocaleLowerCase() === Gender.MALE.toLocaleLowerCase()) {
                    return "Nam";
                  }
                  if (item.toLocaleLowerCase() === Gender.FEMALE.toLocaleLowerCase()) {
                    return "Nữ";
                  } else {
                    return "Khác";
                  }
                })
                .join(", ")
            : "--",
      },
      {
        title: "Ngày sinh",
        info: (
          <>
            {convertDateValue(prerequisite_birthday_duration || [])}
          </>
        ),
      },
      {
        title: "Ngày cưới",
        info: (
          <>
            {convertDateValue(prerequisite_wedding_duration || [])}
          </>
        ),
      },
      {
        title: "Nhóm khách hàng",
        info: getCustomerGroupName(),
      },
      {
        title: "Hạng khách hàng",
        info: getCustomerRankName(),
      },
    ];
  }, [
    getCustomerGroupName,
    getCustomerRankName,
    prerequisite_birthday_duration,
    prerequisite_genders,
    prerequisite_wedding_duration
  ]);

  useEffect(() => {
    dispatch(
      CustomerGroups((result) => {
        const temps = new Map<number, CustomerGroupModel>();
        result.forEach((item: CustomerGroupModel) => {
          temps.set(item.id, item);
        });
        setGroups(temps);
      }),
    );
    dispatch(
      LoyaltyRankSearch({}, (result: PageResponse<LoyaltyRankResponse>) => {
        const temps = new Map<number, LoyaltyRankResponse>();
        result.items.forEach((item: LoyaltyRankResponse) => {
          temps.set(item.id, item);
        });
        setRankingList(temps);
      }),
    );
  }, [dispatch]);

  return (
    <div>
      {customer_selection === CustomerSelectionOption.ALL && <span>Tất cả khách hàng</span>}
      {customer_selection === CustomerSelectionOption.PREREQUISITE && (
        <>
          {customerConditionList.map((data) => (
            <div key={data.title}>
              {data.title}: &nbsp; <b> {data.info}</b>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
