import _ from "lodash";
import { useState, useEffect } from "react";
import { Pikachure } from "src/services";

const defaultProps = {
	username: "mapbox",
	style_id: "outdoors-v11",
	//overlay: "",
	lng: 0,
	lat: 0,
	zoom: 13,
	pitch: 60,
	bearing: 0,
	width: 576,
	height: 431
};

export default function StaticMap(props) {
	const [fetchUrl, setFetchUrl] = useState();

	useEffect(() => {
		async function getStaticMap() {
			const fetchParams = {
				...defaultProps,
				...props
			};

			const fetchUrl = `${Pikachure.URL}/map?username=${fetchParams.username}&style_id=${fetchParams.style_id}&lng=${fetchParams.lng}&lat=${fetchParams.lat + 0.001 /* Preview offset due to tilt */}&zoom=${fetchParams.zoom}&bearing=${fetchParams.bearing}&pitch=${fetchParams.pitch}&width=${fetchParams.width}&height=${fetchParams.height}`;
			setFetchUrl(fetchUrl);
		}

		getStaticMap();
	}, [props]);

	return (
		<img alt="map" src={fetchUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
	);
}