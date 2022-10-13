import { useState, useEffect, useContext } from "react";
import { ContextLoading } from "src/components";
import PostList from "./component";

export default function Component(props) {
	const { postsLoading, userLoading } = useContext(ContextLoading);
	return (
		<PostList {...props} loading={postsLoading || userLoading} />
	);
}

// https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return { width, height };
}

function useWindowDimensions() {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowDimensions;
}