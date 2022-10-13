import { Component } from "react";
import { Button } from "antd";

import "./style.css";

export default class PostMarker extends Component {
	render() {
		const { marker: { properties }} = this.props;
		return (
			<Button
				type="primary" 
				size={properties?.sum > 0 ? "large" : undefined}
				className="post-marker"
				style={{ zIndex: Math.min(1, properties?.sum)  /* Render clusters on top of normal markers */ }}
				onClick={this.props.onClick}
			>
				{
					properties?.post?.host.picture ? (
						<img
							alt="profile"
							src={properties?.post?.host.picture}
							style={{ width: "20px", borderRadius: "50%", marginRight: "10px" }}
						/>
					) : null
				}
				{ properties?.post?.host.tag || properties?.sum }
			</Button>
		);
	}
}