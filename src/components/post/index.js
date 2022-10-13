import { useState, useContext } from "react";
import { ContextLoading, ContextUser } from "src/components";
import _ from "lodash";
import Post from "./component";

function Component(props) {
	const [guestVisible, setGuestVisible] = useState(props.guestVisible);
	const [menuVisible, setMenuVisible] = useState(false);
	const [modalVisible, setModalVisible] = useState(false)
	const [autoplay, setAutoplay] = useState(props.autoplay);
	const [comment, setComment] = useState("");
	const [uploadPhotoVisibility, setUploadPhotoVisibility] = useState(false);
	const [fileToRemove, setFileToRemove] = useState("");
	const [guestGalleryPage, setGuestGalleryPage] = useState(0);
	const [currentSlide, setCurrentSlide] = useState();
	const [selectedComment, setSelectedComment] = useState();
	const [editComment, setEditComment] = useState("");

	const { postsLoading, saveCommentLoading, savePostPhotoLoading, leavePostLoading, joinPostLoading } = useContext(ContextLoading);
	const [user] = useContext(ContextUser);

	return (
		<Post
			{...props}
			postsLoading={postsLoading}
			leavePostLoading={leavePostLoading}
			joinPostLoading={joinPostLoading}
			user={user || props.user} // This helps the Post component know which guest gallery slide to concatenate locally uploaded files as well as the default key for the guest gallery

			guestVisible={guestVisible} setGuestVisible={setGuestVisible}
			menuVisible={menuVisible} setMenuVisible={setMenuVisible}
			modalVisible={modalVisible} setModalVisible={setModalVisible}
			autoplay={autoplay} setAutoplay={setAutoplay}
			currentSlide={currentSlide} setCurrentSlide={setCurrentSlide}

			comment={comment} setComment={setComment}
			saveCommentLoading={saveCommentLoading}
			selectedComment={selectedComment} setSelectedComment={setSelectedComment}
			editComment={editComment} setEditComment={setEditComment}

			uploadPhotoVisibility={uploadPhotoVisibility} setUploadPhotoVisibility={setUploadPhotoVisibility}
			fileToRemove={fileToRemove} setFileToRemove={setFileToRemove}

			guestGalleryPage={guestGalleryPage} setGuestGalleryPage={setGuestGalleryPage}
			savePostPhotoLoading={savePostPhotoLoading}
		/>
	);
}

export default Component;