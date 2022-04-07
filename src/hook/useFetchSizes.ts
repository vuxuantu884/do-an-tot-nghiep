import { PageResponse } from "model/base/base-metadata.response";
import { SizeQuery, SizeResponse } from "model/product/size.model";
import { useState } from "react";
import { useDispatch } from "react-redux";
import useEffectOnce from "react-use/lib/useEffectOnce";
import { getSearchSize } from "service/product/size.service";
import { callApiNative } from "../utils/ApiUtils";
const PAGE = 1;
const PAGE_LIMIT = 30;
export default function useFetchSizes() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>();

    const [data, setData] = useState<PageResponse<SizeResponse>>({
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

    const fetchData = async (query: SizeQuery) => {
        setIsLoading(true);
        try {
            const response = await callApiNative(
                { isShowError: true },
                dispatch,
                getSearchSize,
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

    return { isSizeLoading: isLoading, sizes: data, setSize: setData, fetchSizes: fetchData, errors };
};
