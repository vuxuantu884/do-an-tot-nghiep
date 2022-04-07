import { PageResponse } from "model/base/base-metadata.response";
import { ColorResponse, ColorSearchQuery } from "model/product/color.model";
import { useState } from "react";
import { useDispatch } from "react-redux";
import useEffectOnce from "react-use/lib/useEffectOnce";
import { colorSearchApi } from "../service/product/color.service";
import { callApiNative } from "../utils/ApiUtils";
const PAGE = 1;
const PAGE_LIMIT = 30;
export default function useFetchColors() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>();

    const [data, setData] = useState<PageResponse<ColorResponse>>({
        metadata: {
            limit: PAGE_LIMIT,
            page: PAGE,
            total: 0,
        },
        items: [],
    });

    useEffectOnce(() => {
        fetchData(data.metadata);
    });

    const fetchData = async (query: ColorSearchQuery) => {
        setIsLoading(true);
        try {
            const response = await callApiNative(
                { isShowError: true },
                dispatch,
                colorSearchApi,
                { ...data.metadata, ...query }
            );
            setData(response);
        } catch (err) {
            console.error(err);
            setErrors(err);
        } finally {
            setIsLoading(false);
        }
    };

    return {isColorLoading:  isLoading, color: data, setColor: setData, fetchColor: fetchData, errors };
};
