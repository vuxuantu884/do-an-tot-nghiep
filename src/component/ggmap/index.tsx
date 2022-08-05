import React, { useState } from "react";
import { Select, Spin } from "antd";
import debounce from "lodash/debounce";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { getPlaceApi } from "service/core/store.services";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const API_KEY = "AIzaSyB6sGeWZ-0xWzRNGK0eCCdZW1CtzYTfJ0g";

export interface MapProps {
  styles?: object;
  zoom?: number;
  center?: any;
  draggable?: boolean;
  searchable?: boolean;
  onSelect?: (e: any) => void;
  onMarkerDrag?: (e: any) => void;
}

export const Map = (props: MapProps) => {
  const {
    styles,
    center,
    onSelect,
    onMarkerDrag,
    draggable = true,
    zoom = 10,
    searchable = true,
  } = props;

  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<any>([]);
  const dispatch = useDispatch();

  const onSearchResult = (data: any) => {
    const res = data?.results;

    if (res.length === 0) return;

    const dataSelect = res.map((i: any) => {
      return {
        value: JSON.stringify(i.geometry.location),
        label: i.formatted_address,
      };
    });
    setOptions(dataSelect);
  };

  const searchPlace = async (value: string) => {
    setFetching(true);
    const res = await callApiNative({ isShowLoading: false }, dispatch, getPlaceApi, {
      key: API_KEY,
      query: value,
    });
    setFetching(false);
    onSearchResult(JSON.parse(res));
  };

  const searchPlaceDebounce = debounce((value: string) => {
    searchPlace(value).then();
  }, 1000);

  return (
    <>
      {searchable && (
        <Select
          placeholder="Nhập địa điểm để tìm kiếm"
          showSearch
          style={{ width: "100%", marginBottom: 20 }}
          labelInValue
          filterOption={false}
          onSelect={onSelect}
          onSearch={searchPlaceDebounce}
          notFoundContent={fetching ? <Spin size="small" /> : null}
          {...props}
          options={options}
        />
      )}
      <LoadScript googleMapsApiKey={API_KEY}>
        <GoogleMap mapContainerStyle={styles} center={center} zoom={zoom}>
          <Marker position={center} draggable={draggable} onDragEnd={onMarkerDrag} />
        </GoogleMap>
      </LoadScript>
    </>
  );
};
