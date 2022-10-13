import { Component } from "react";

import GoogleMapReact from "google-map-react";
import { Divider, Avatar, Input, Row, Col, Button, Breadcrumb, Typography, Space, List, Tabs, Upload } from "antd";
import { FileImageFilled, PushpinFilled, LeftOutlined, PlusCircleFilled, CloseCircleFilled, CloseSquareFilled } from "@ant-design/icons";
import _ from "lodash";
import Moment from "moment";

import { Post } from "src/components";
import "./style.css";

export default class OpenInviteList extends Component {
	static DisplayTypes = {
		GRID: 0,
		PANEL: 1
	};

	navPages = ["Photoshoot Site", "Invite", "Upload"];
	timeoutCode = 0;

	render() {
		const { displayType, posts } = this.props;
		
		switch(displayType) {
			case OpenInviteList.DisplayTypes.GRID: {
				return (
					<List
						dataSource={posts}
						renderItem={post => (
							<Post
								post={post}
								isGuestVisible={post.id === this.props.guestVisible}
							/>
						)}
					/>
				);
			}
			
			case OpenInviteList.DisplayTypes.PANEL: {
				return (
					<List
						dataSource={posts}
						renderItem={post => (
							<Post
								post={post}
								isGuestVisible={post.id === this.props.guestVisible}
							/>
						)}
					/>
				);
			}
			default: 
				return (
					<List
						dataSource={posts}
						renderItem={post => (
							<Post
								post={post}
								isGuestVisible={post.id === this.props.guestVisible}
							/>
						)}
					/>
				)
		}
	}
}