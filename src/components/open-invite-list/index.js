import { useState, useRef } from "react";

import OpenInviteList from "./component";

function Component(props) {
	const [guestVisible, setGuestVisible] = useState();

	return (
		<OpenInviteList
			{...props}
			guestVisible={guestVisible} setGuestVisible={setGuestVisible}
		/>
	);
}

export default Component;

