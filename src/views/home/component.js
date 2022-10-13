import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Plx from "react-plx";
import { Collapse, Card, Typography, Button, Row, Col, Spin, Modal, Divider, Image, Tag } from "antd";
import { EnvironmentFilled, CaretDownOutlined, CaretUpOutlined, AppstoreFilled, SettingFilled, TabletFilled, EditFilled, CloseOutlined } from '@ant-design/icons';
import Resizer from "react-image-file-resizer";
import _ from "lodash";

import { Post, PostCreate, PostList, OpenInviteCreate, ContextLoading, ContextSelectedPost } from "src/components";

export default function Home(props) {
	const { saveUserLoading } = useContext(ContextLoading);
	const [displayType, setDisplayType] = useState(0);
	const [postCreateModal, setPostCreateModal] = useState(false);
	const [openInviteModal, setOpenInviteModal] = useState(false);
	const [selectedPost, setSelectedPost] = useContext(ContextSelectedPost);
	const [mentionList, setMentionList] = useState([]);
	const [selectedCollapse, setSelectedCollapse] = useState(!_.isEmpty(selectedPost));
	const { posts, user, activeUser, places, searchUsers } = props;
	
	useEffect(() => {
		props.userRefetch({ variables: { tag: props.match.params.tag }});
		document.documentElement.scrollIntoView({ behavior: "smooth" });
	}, [props.match.params.tag]);

	useEffect(() => {
		if(!_.isNil(props.user?.layout)) {
			setDisplayType(props.user?.layout); // Since we use a Lazy Query, user may not exist yet for Display Type to get initiated wit hthe right value
		}
	}, [props.user?.layout]);

	// We isolate the function from the props to allow the Post JSX to conditionally render action buttons based on permissions
	const onPostClick = post => setSelectedPost(post) || setSelectedCollapse(true) || document.getElementById("profile-content-card").scrollIntoView({ behavior: "smooth" });
	const onPostEdit = async post => setSelectedPost(post) || setSelectedCollapse(true) || setPostCreateModal(true);
	const onOpenInviteEdit = post => setSelectedPost(post) || setSelectedCollapse(true) || setOpenInviteModal(true);
	const onPostDelete = async id => await props.onDelete(id);
	const onLeavePost = async id => await props.onLeavePost(id) || setSelectedPost();
	const onJoinPost = async id => await props.onJoinPost(id);
	const onSavePostPhoto = async post => await props.savePostPhoto(post);

	const [postedPosts, openInvites] = _.reduce(
		posts, 
		(result, post) => {
			!_.isEmpty(post?.datePosted) ? result[0].push(post) : result[1].push(post);
			return result;
		}, 
		[[], []]
	);
	
	// Props to <Post /> depending on whether it is an open invite or a post
	const getPostProps = post => _.isEmpty(post?.datePosted) ? ({
		onPublish: activeUser && (post.host?.id === activeUser?.sub) && onPostEdit,
		onEdit: activeUser && (post.host?.id === activeUser?.sub) && onOpenInviteEdit,
		onDelete: activeUser && (post.host?.id === activeUser?.sub) && onPostDelete,
		onLeave: activeUser && (_.indexOf(_.map(post.guests, "id"), activeUser.sub) > -1) && onLeavePost,
		onJoin: activeUser && post.host.id !== activeUser.sub && (_.indexOf(_.map(post.guests, "id"), activeUser.sub) === -1) && onJoinPost,
		onComment: async (comment, post) => await props.onComment(comment, post),
		onCommentDelete: async (comment, post) => await props.onCommentDelete(comment, post),
		onCommentsClick: async id => document.documentElement.scrollIntoView() || props.history.push(`/comments/${id}`), // Fix the Parallax rerender issue,
		savePostPhoto: activeUser && (_.indexOf(_(post.guests).concat(post.host).map("id").value(), activeUser.sub) > -1) && onSavePostPhoto,
		onClickProfile: async tag => tag !== null && props.history.push(`/profile/${tag}`),
		refresh: () => props.userRefetch({ variables: { tag: props.match.params.tag }})
	}) : ({
		onPublish: activeUser && (post.host.id === activeUser?.sub) && onPostEdit,
		onEdit: activeUser && (post.host.id === activeUser?.sub) && onPostEdit,
		onDelete: activeUser && (post.host.id === activeUser?.sub) && onPostDelete,
		onLeave: activeUser && (_.indexOf(_.map(post.guests, "id"), activeUser.sub) > -1) && onLeavePost,
		onComment: async (comment, post) => await props.onComment(comment, post),
		onCommentDelete: async (comment, post) => await props.onCommentDelete(comment, post),
		onCommentsClick: async id => document.documentElement.scrollIntoView() || props.history.push(`/comments/${id}`), // Fix the Parallax rerender issue
		savePostPhoto: onSavePostPhoto,
		onClickProfile: async tag => tag !== null && props.history.push(`/profile/${tag}`),
		refresh: () => props.userRefetch({ variables: { tag: props.match.params.tag }})
	});

	// Selecting a post showcases it to the top. It has to come from the `posts` list and not from the state as it is not updated when data reloads
	const postToDisplay = _.find(posts, { id: selectedPost?.id });

	const onAddPost = () => setSelectedCollapse() || setSelectedPost() || setPostCreateModal(true);
	const onAddOpenInvite = () => setSelectedCollapse() || setSelectedPost() || setOpenInviteModal(true);

	return (
		<div id="profile-container">
			<Row className="header" justify="space-between" align="middle" style={{ whiteSpace: "nowrap" }}>
				<Col>
					<Link to="/"><Typography.Title style={{ margin: 0, color: "var(--ant-primary-color)" }}>Pikachure</Typography.Title></Link>
				</Col>
				<Col style={{ textAlign: "right" }}>
					<Link to="/settings" style={{ marginRight: "10px" }}><Button shape="circle" icon={<SettingFilled />} /></Link>
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
				<Spin spinning={saveUserLoading} indicator={null}>
					<Row justify="center">
						<Col span={24}>
							<Card bordered={false} id="profile-cover-card">
								<Image 
									alt="profile-cover" 
									id="profile-cover" 
									src={!_.isEmpty(user?.cover?.name) ? `https://firebasestorage.googleapis.com/v0/b/pikature.appspot.com/o/${user.cover.name}?alt=media` : "error"}
									fallback="/placeholder-image.png"
									preview={false}
								/>

								<div id="profile-cover-content">
									<Row justify="space-between" align="middle">
										<Col span={18}>
											<Typography.Title style={{ color: "white", margin: 0, textShadow: "5px 10px 25px #00000066" }}>{ user?.name }</Typography.Title>
											{/* <Typography.Text style={{ color: "white" }}>@{ user?.tag }</Typography.Text> */}
										</Col>
										{
											activeUser?.sub === user?.id ? (
												<Col span={6} className="profile-cover-actions">
													<label>
														<input 
															id="file-cover-upload-input"
															style={{ display: "none" }}
															type="file"
															accept="image/jpg, image/jpeg, image/png, image/gif, image/bmp, .heic"
															onChange={async ({ target: { files } }) => {
																if(_.isEmpty(files)) return;
		
																let file = _.first(files);
																file = await new Promise(resolve => {
																	Resizer.imageFileResizer(file,
																		1500, 1500, "JPEG", 90, 0,
																		file => {
																			// We normally use `type` property but this mimetype is for GraphQL Upload file object
																			file.mimetype = file.type;
																			if (!file.url && !file.preview) {
																				file.preview = URL.createObjectURL(file);
																			}
																			resolve(file);
																		},
																		"file"
																	);
																});
		
																props.saveUser({ file });
															}}
														/>
														<Button 
															icon={<EditFilled />} 
															onClick={() => document.getElementById("file-cover-upload-input").click()}
														>
															Edit
														</Button>
													</label>
												</Col>
											) : null
										}
									</Row>
								</div>
							</Card>
						</Col>
					</Row>
				</Spin>
			</Plx>
			
			<Card bordered={false} id="profile-content-card">
				<div id="profile-content-container">
					<Row justify="space-between">
						{
							!_.isEmpty(posts) ? (
							<Col className="button-group">
								<Button type={displayType === 0 ? "primary" : "default"} onClick={() => setDisplayType(0)} size="large" icon={<AppstoreFilled />} />
								<Button type={displayType === 1 ? "primary" : "default"} onClick={() => setDisplayType(1)} size="large" icon={<TabletFilled />} />
							</Col>
							) : <div />
						}
						{ displayType === 0 && postToDisplay && selectedCollapse ? <Button size="large" shape="circle" icon={<CloseOutlined />} onClick={() => setSelectedCollapse() || setTimeout(setSelectedPost, 500)} /> : null }
					</Row>
				</div>
			
				<Collapse 
					ghost
					activeKey={[displayType === 0 && postToDisplay && selectedCollapse]}
					expandIcon={props => null}
				>
					<Collapse.Panel key={true}> 
					{
						_.isEmpty(postToDisplay) ? (
							<div style={{ height: "576px" }} />
						) : (
							<Post 
								post={postToDisplay}
								{...getPostProps(postToDisplay)}
							/>
						)
					}
					</Collapse.Panel>
				</Collapse>
				
				<div style={{ marginBottom: "20px" }}>
					<Divider plain id="divider-open-invites" orientation="left">Open Invites</Divider>
					
					<PostList
						posts={openInvites}
						displayType={displayType} 
						onClick={displayType === 0 && onPostClick}
						postProps={getPostProps}
						onAdd={activeUser.sub !== "demo@pikachure-server.online" && (_.isEmpty(props.match.params.tag) ? onAddOpenInvite : user?.id === activeUser.id ? onAddOpenInvite : null)}
					/>
				</div>

				<div>
					<Divider plain id="divider-posts" orientation="left">Posts</Divider>
					
					<PostList
						posts={postedPosts} 
						displayType={displayType}
						onClick={displayType === 0 && onPostClick}
						postProps={getPostProps}
						onAdd={activeUser.sub !== "demo@pikachure-server.online" && (_.isEmpty(props.match.params.tag) ? onAddPost : user?.id === activeUser.id ? onAddPost : null)}
					/>
				</div>
			</Card>
			
			<Row justify="end" align="middle" 
				style={{
					position: "sticky",
					bottom: 0,
					padding: "20px",
					zIndex: 4 /* Goes on top of Ant Spin who has a ZIndex of 4 */
				}}
			>
				<Col className="button-group">
					<Button onClick={() => document.getElementById("divider-open-invites").scrollIntoView({ behavior: "smooth" })} icon={<CaretUpOutlined />}>Invites</Button>
					<Button onClick={() => document.getElementById("divider-posts").scrollIntoView({ behavior: "smooth" })}  icon={<CaretDownOutlined />}>Posts</Button>
				</Col>
			</Row>

			<Modal
				visible={postCreateModal}
				onCancel={() => setPostCreateModal(false)}
				// maskClosable={false}
				// keyboard={false}
				footer={null}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
			>
				<PostCreate
					values={{ ...selectedPost, lat: selectedPost?.lat || user?.lat, lng: selectedPost?.lng || user?.lng }}
					onDraft={() => setPostCreateModal(false)}
					onSave={async post => {
						await props.onSave({ ...post, id: selectedPost?.id });
						setPostCreateModal(false);
					}}
					
					places={places}
					onSearchPlaces={async search => await props.onSearchPlaces(search)}
				/>
			</Modal>
			<Modal
				visible={openInviteModal}
				onCancel={() => setOpenInviteModal(false)}
				// maskClosable={false}
				// keyboard={false}
				footer={null}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
			>
				<OpenInviteCreate
					values={{ ...selectedPost, lat: selectedPost?.lat || user?.lat, lng: selectedPost?.lng || user?.lng }}
					mentionList={mentionList}
					setMentionList={setMentionList}
					onDraft={() => setOpenInviteModal(false)}
					onSave={async post => {
						await props.onSave({ ...post, id: selectedPost?.id });
						setOpenInviteModal(false);
					}}
					
					places={places}
					onSearchPlaces={async search => await props.onSearchPlaces(search)}

					searchUsers={searchUsers}
					onSearchUsers={async search => await props.onSearchUsers(search)}
				/>
			</Modal>
		</div>
	);
}