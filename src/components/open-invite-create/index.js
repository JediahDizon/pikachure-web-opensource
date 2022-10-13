import { useState, useContext } from "react";
import _ from "lodash";

import { ContextLoading } from "src/components";
import OpenInviteCreate from "./component";


function Component(props) {
	const [mentionToRemove, setMentionToRemove] = useState("");
	const [fileToRemove, setFileToRemove] = useState("");
	const [navPage, setNavPage] = useState(_.isEmpty(props.values.id) ? 0 : 1); // If this is an edit, go to the navPage
	const [uploadPhotoVisibility, setUploadPhotoVisibility] = useState(0);
	const [currentSlide, setCurrentSlide] = useState();
	const [zoom, setZoom] = useState(12);

	const { saveLoading, placesLoading, searchUsersLoading } = useContext(ContextLoading);
	
	return (
		<OpenInviteCreate
			{...props}
			
			saveLoading={saveLoading} 
			placesLoading={placesLoading} 
			searchUsersLoading={searchUsersLoading}

			zoom={zoom} setZoom={setZoom}
			
			mentionToRemove={mentionToRemove} setMentionToRemove={setMentionToRemove}
			navPage={navPage} setNavPage={setNavPage}
			currentSlide={currentSlide} setCurrentSlide={setCurrentSlide}
			fileToRemove={fileToRemove} setFileToRemove={setFileToRemove}
			uploadPhotoVisibility={uploadPhotoVisibility} setUploadPhotoVisibility={setUploadPhotoVisibility}
		/>
	);
}

export default Component;

