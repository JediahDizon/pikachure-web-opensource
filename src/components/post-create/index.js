import { useState, useContext } from "react";
import _ from "lodash";
import PostCreate from "./component";

import { ContextLoading } from "src/components"; 

function Component(props) {
	const [fileToRemove, setFileToRemove] = useState("");
	const [navPage, setNavPage] = useState(_.isEmpty(props.values?.gallery) ? 0 : 1);
	const [zoom, setZoom] = useState(12);

	const { saveLoading, placesLoading } = useContext(ContextLoading);

	return (
		<PostCreate 
			{...props}

			saveLoading={saveLoading}
			placesLoading={placesLoading} 

			zoom={zoom} setZoom={setZoom}

			fileToRemove={fileToRemove} setFileToRemove={setFileToRemove}
			navPage={navPage} setNavPage={setNavPage}
		/>
	);
}
export default Component;