import { Component } from "react";
import { Button } from "antd";

import "./style.css";

export default class PlaceMarker extends Component {
	render() {
		const { marker: { place, properties }} = this.props;
		return (
			<Button
				type="primary" 
				size={properties?.sum > 0 ? "large" : undefined}
				className="place-marker"
				style={{ zIndex: Math.min(1, properties?.sum)  /* Render clusters on top of normal markers */ }}
				onClick={this.props.onClick}
			>
				{ properties?.sum || place.name }
			</Button>
		);
	}
}