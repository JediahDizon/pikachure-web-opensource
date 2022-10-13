import React, { Component } from "react";
import { View, Text } from "react-native";
import { Tooltip } from "react-native-elements";
import { Input, Icon } from "@ui-kitten/components";


import _ from "lodash";

export default class InputDescription extends Component {
	state = {
		isActive: false
	};

	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	render() {
		const { containerProps, name, description } = this.props

		if(description) {
			return (
				<View {...containerProps} style={containerProps?.style}>
					<Input
						{...this.props}
						accessoryRight={props => (
							<Tooltip
								popover={description}
								backgroundColor="transparent"
								overlayColor="rgba(255, 255, 255, 0.90)"
								width={300}
								height={150}
							>
								<Icon {...props} name={name ? name : "question-mark-circle"} />
							</Tooltip>
						)}
					/>
				</View>
			);
		} else {
			return (
				<View {...containerProps} style={containerProps?.style}>
					<Input {...this.props} />
				</View>
			);
		}
	}
}