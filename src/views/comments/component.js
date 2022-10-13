import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Plx from "react-plx";
import { Card, Typography, Button, Row, Col, Spin, Input, Modal } from "antd";
import { EnvironmentFilled, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import _ from "lodash";
import Moment from "moment";

import { Post, ContextLoading } from "src/components";
import "./style.css";

export default function Comments(props) {
	const { saveCommentLoading, commentsLoading } = useContext(ContextLoading);
	const [comment, setComment] = useState();
	const [selectedComment, setSelectedComment] = useState();
	const [editComment, setEditComment] = useState("");
	const { post, comments, user } = props;

	useEffect(() => {
		props.commentsRefetch({ variables: { id: props.match.params.post }});
		props.postRefetch({ variables: { id: props.match.params.post }});
		document.documentElement.scrollIntoView();
	}, [props.match.params.post]);

	return (
		<div id="comments-container">
			<Row className="header" justify="space-between" align="middle">
				<Col style={{ height: "50px" }}>
					<Link to="/"><Typography.Title style={{ margin: 0, color: "var(--ant-primary-color)" }}>Pikachure</Typography.Title></Link>
				</Col>
				<Col>
					<Link to="/explore"><Button icon={<EnvironmentFilled style={{ color: "var(--ant-primary-color)" }} />}>Explore</Button></Link>
				</Col> 
			</Row>

				<Plx
					className="plx"
					parallaxData={[{
						start: "self",
						end: 1000,
						properties: [
							{
								startValue: -35,
								endValue: -400,
								property: "translateY"
							}
						]
					}]}
				>
					<Row justify="space-between">
						<Col span={24}>
							<Card bordered={false} id="comments-cover-card">
								{
									!_.isEmpty(post) ? (
											<Post post={{ ...post, comments: [] }} compact />
									) : <div style={{ height: "431px" }} />
								}
							</Card>
						</Col>
					</Row>
				</Plx>
			
			<Card bordered={false} id="comments-content-card" style={{ marginTop: "min(calc(100vw * 0.75), calc(576px * 0.75))", minHeight: "576px" }}>
				<Spin spinning={commentsLoading} indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />}>
					<Row justify="space-between" align="top" style={{ margin: "0 20px 0 20px" }}>
						<Col key={0} span={18}>
							<div className="comment"><b>{ post?.host?.tag }</b>{" "}{ post?.description }</div>
						</Col>
						<Col key={1} span={6} className="comment-date">
							<sub>{ Moment(post?.dateCreated).isValid() ? Moment(post?.dateCreated).fromNow() : null }</sub>
						</Col>
					</Row>

					<div id="comments-content-container">
						<Row justify="end" className="comment-form-container">
							<Input.TextArea
								className="comment-text"
								placeholder="Say something..."
								rows={2}
								value={comment}
								onChange={({ target: { value }}) => setComment(value)}
							/>
							<Button 
								disabled={_.size(comment) <= 0}
								className="comment-button"
								type="primary" icon={<SendOutlined />}
								loading={saveCommentLoading}
								style={{ opacity: _.size(comment) > 0 ? 1 : 0 }}
								onClick={async () => {
									await props.onComment({ description: comment }, post.id);
									setComment("")
								}}
							>
								Comment
							</Button>
						</Row>
						
						<Row justify="space-between" align="top" style={{ margin: "0 20px 0 20px" }}>
							<Col span={24}>
							{
								!_.isEmpty(comments) ? _.map(comments, (comment, index) => (
									<Row key={comment.id} justify="space-between" onClick={() => setSelectedComment(comment) || setEditComment(comment.description)}>
										<Col key={comment.id + index} span={16}>
											<div className="comment" ><b>{ comment.user.tag }</b>{" "}{ comment.description }</div>
										</Col>
										<Col key={comment.id + 2 + index} span={8} className="comment-date">
											<sub>{ comment.dateCreated !== comment.dateModified && <i>(edited) </i> }{ Moment(comment.dateCreated).isValid() ? Moment(comment.dateCreated).fromNow() : null }</sub>
										</Col>
									</Row>
								)) : null
							}
							</Col>
						</Row>
					</div>
				</Spin>
			</Card>
			
			{/* Modal for editing a comment */}
			<Modal
				visible={selectedComment}
				onCancel={() => setSelectedComment()}
				// maskClosable={false}
				// keyboard={false}
				footer={null}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
			>
				<Row style={{ padding: "20px" }}>
					<Col span={18}>
						<div>
							<b>{ selectedComment?.user.tag }</b>
							{ selectedComment?.user.id !== user?.id ? " " + selectedComment?.description : null }
						</div>
					</Col>
					<Col span={6} className="comment-date">
						<sub>{ Moment(selectedComment?.dateCreated).isValid() ? Moment(selectedComment?.dateCreated).fromNow() : null }</sub>
					</Col>
					{
						selectedComment?.user.id === user?.id ? (
							<Col span={24} style={{ marginTop: "20px" }}>
								<Input.TextArea
									autoFocus
									className="comment-text"
									placeholder="Say something..."
									value={editComment}
									onChange={({ target: { value }}) => setEditComment(value)}
								/>
							</Col>
						) : null
					}
				</Row>
				
				<div className="button-group" style={{ textAlign: "right", padding: "20px", overflow: "auto hidden" }}>
					<Button onClick={() => setSelectedComment()}>Close</Button>
					{
						selectedComment?.user.id !== user?.id ? (
							<>
								{/*<Button>Report</Button>*/}
							</>
						) : (
							<>
								{
									_.isFunction(props.onCommentDelete) ? (
									<Button
										onClick={async () => {
											Modal.confirm({
												title: "Delete Comment",
												content: "Are you sure you want to delete this comment? This cannot be undone.",
												icon: null,
												okText: "Delete",
												cancelText: "Cancel",
												onOk: async () => {
													await props.onCommentDelete(selectedComment.id, post.id);
													setSelectedComment();
												}
											})
										}}
									>
										Delete
									</Button>
									) : null
								}
								<Button 
									loading={saveCommentLoading}
									type="primary" 
									disabled={editComment === selectedComment?.description} 
									onClick={async () => {
										await props.onComment({ id: selectedComment.id, description: editComment }, post.id);
										setSelectedComment();
									}}
								>
									Save
								</Button>
							</>
						)
					}
				</div>
			</Modal>
			
			{/* <Modal
				visible={postCreateModalVisibility}
				onCancel={() => setPostCreateModalVisibility(false)}
				// maskClosable={false}
				// keyboard={false}
				footer={null}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
			>
				<PostCreate
					onDraft={() => setPostCreateModalVisibility(false)}
					onSave={async post => {
						await props.onSave(post);
						setPostCreateModalVisibility(false);
					}}
				/>
			</Modal> */}
		</div>
	);
}