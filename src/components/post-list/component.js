import { Component } from "react";

import GoogleMapReact from "google-map-react";
import { Spin, Empty, Input, Row, Col, Button, Breadcrumb, Typography, Space, List, Tabs, Card } from "antd";
import { LoadingOutlined, PlusOutlined, CameraFilled, PlusCircleFilled, CloseCircleFilled, CloseSquareFilled } from "@ant-design/icons";
import _, { min } from "lodash";
import Moment from "moment";

import { Post, ContextLoading } from "src/components";
import "./style.css";

export default class PostList extends Component {
	static DisplayTypes = {
		GRID: 0,
		PANEL: 1
	};

	navPages = ["Photoshoot Site", "Invite", "Upload"];
	timeoutCode = 0;

	render() {
		const { displayType, loading = false, style } = this.props;
		let { posts } = this.props;
		// Pre-pend the add button if there is an onAdd function in props
		if(_.isEmpty(posts)) {
			if(!loading && _.isFunction(this.props.onAdd)) posts = [{}].concat(posts);
		} else if(_.isFunction(this.props.onAdd)) {
			posts = [{}].concat(posts);
		}
		
		switch(displayType) {
			case PostList.DisplayTypes.GRID: {
				return (
					<Spin spinning={_.isEmpty(posts) ? false : loading} indicator={!_.isEmpty(posts) ? null : <LoadingOutlined style={{ fontSize: 60 }} spin />}>
						{
							_.isEmpty(posts) ? this.renderPostsPlaceholder() : (
								<List
									style={style}
									split={false}
									dataSource={_.chunk(posts, 3)}
									renderItem={(chunkedPosts, index) => (
										<List.Item key={index} className="postlist-post-container">
											<Row>
											{
												// We separate the posts in chunks to fix layout issues with post Carousel by surrounding the Post in Row objects and discreetly limiting Cols into groups of 3
												_.map(chunkedPosts, post => post?.id ? (
													<Col span={8} key={post.id} className={_.isFunction(this.props.onClick) ? "postlist-post" : ""} onClick={() => _.isFunction(this.props.onClick) && this.props.onClick(post)}>
														<Post
															autoplay={_.isEmpty(post.cover) && _.isEmpty(post.datePosted) && Math.floor(Math.random() * 2)}
															{...this.props.postProps(post)}
															minimal
															post={post}
															isGuestVisible={post.id === this.props.guestVisible}
														/>
													</Col>
												) : /* Render a placeholder if the post has no ID (This means the post is a placeholder) */ (
													<Col span={8} className={_.isFunction(this.props.onAdd) ? "postlist-post" : ""} onClick={() => _.isFunction(this.props.onAdd) && this.props.onAdd(post)}>
														<Row justify="center" align="middle" className="post-upload-image" style={{ height: "min(33vw, 191px)" }}>
															<PlusOutlined style={{ fontSize: 60, opacity: 0.33 }} />
														</Row>
													</Col>
												))
											}
											</Row>
										</List.Item>
									)}
								/>
							)
						}
					</Spin>
				);
			}
			
			case PostList.DisplayTypes.PANEL:
			default: {
				return (
					<Spin spinning={_.isEmpty(posts) ? false : loading} indicator={!_.isEmpty(posts) ? null : <LoadingOutlined style={{ fontSize: 60 }} spin />}>
						{
							_.isEmpty(posts) ? this.renderPostsPlaceholder() : (
								<List
									style={style}
									split={false}
									dataSource={posts}
									renderItem={post => post?.id ? (
										<List.Item key={post.id} className={`postlist-post-container ${_.isFunction(this.props.onClick) ? "postlist-post" : ""}`} onClick={() => _.isFunction(this.props.onClick) && this.props.onClick(post)}>
											<Post
												{...this.props.postProps(post)}
												key={post.id}
												post={post}
												isGuestVisible={post.id === this.props.guestVisible}
											/>
										</List.Item>
									) : null
									//(
									//	<Row
									//		className={`post-upload-image ${_.isFunction(this.props.onAdd) ? "postlist-post" : ""}`}
									//		justify="center" align="middle"
									//		style={{ marginBottom: "30px" }}
									//		onClick={() => _.isFunction(this.props.onAdd) && this.props.onAdd(post)}
									//	>
									//		<PlusOutlined style={{ fontSize: 60, opacity: 0.33, margin: "20px" }} />
									//	</Row>
									//)
									}
								/>
							)
						}
					</Spin>
				);
			}
		}
	}

	renderPostsPlaceholder() {
		const { loading } = this.props;

		if(!loading) {
			return (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No posts yet" />
			);
		}
	
		return (
			<Row>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
				<Col span={8} className="post-placeholder-grid"></Col>
			</Row>
		);
	}
}