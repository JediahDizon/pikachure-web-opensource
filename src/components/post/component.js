import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import { Button, Row, Col, Carousel, Avatar, List, Modal, Typography, Input, Spin, Collapse, Tooltip, Image } from "antd";
import { AppstoreFilled, SendOutlined, SmileFilled, UserOutlined, CrownFilled, CheckCircleFilled, FileImageFilled, MessageFilled, QuestionCircleFilled, CaretLeftOutlined, CaretRightOutlined, MoreOutlined, DeleteFilled, EditFilled, CaretDownOutlined, CloseOutlined, LoadingOutlined, ReloadOutlined, FrownFilled, EnvironmentFilled, SettingFilled } from '@ant-design/icons';
import Resizer from "react-image-file-resizer";
import _ from "lodash";
import Moment from "moment";

import ReactMapGL from 'react-map-gl';

import { StaticMap } from "src/components";
import "./style.css";
export default class Post extends Component {
	state = {
		files: [] // Used for Open Invite posts that lets guests and host upload images
	};
	
	constructor(props) {
    super(props);
    this.guestGalleryRef = React.createRef();
  }

	render() {
		const { 
			user,
			post,
			minimal, 
			compact,
			autoplay, setAutoplay,
			guestVisible, setGuestVisible,
			menuVisible, setMenuVisible,
			currentSlide, setCurrentSlide,
			selectedComment, setSelectedComment,
			editComment, setEditComment,
			saveCommentLoading,
			fileToRemove, setFileToRemove
		} = this.props;

		if(_.isEmpty(post)) return null;
		
		// If this is an open-invite, show the `Post.cover` photos. Otherwise, show `Post.gallery` photos, `Post.place.photos` or map
		// This indicates that the Post is an open-invite
		let postPhotos = [];
		if(!_.isEmpty(post.datePosted)) {
			if(!_.isEmpty(post.gallery)) postPhotos = post.gallery;
		} else if(!_.isEmpty(post.cover)) {
			postPhotos = post.cover;
		} else if(!_.isEmpty(post.place?.photos)) {
			postPhotos = post.place?.photos;
		}

		// Show "Powered By GOogle" as per the Places API terms and conditions
		const isPBGVisible = false;
		
		return (
			<div id={post.id} className={`post-container ${minimal ? "post-container-minimal" : ""}`}>
				<Carousel 
					autoplay={false} 
					dots={minimal ? false : true}
					dotPosition="bottom"
					onSwipe={() => !minimal && setAutoplay(false)}
					arrows={minimal ? false : true}
					prevArrow={<CaretLeftOutlined />}
					nextArrow={<CaretRightOutlined />}
					beforeChange={(from, to) => setCurrentSlide(to)}
				>
					{ _.isEmpty(post.datePosted) && _.isEmpty(post.cover) && post?.lat && post?.lng ? this.renderMapSlide() : null }
					
					{
						_.map(postPhotos, photo => (
							<Image
								key={typeof photo === "string" ? photo : photo.name}
								alt="post" 
								className={`post-image ${minimal ? "post-image-minimal" : ""}`}
								//onLoad={() => _.isFunction(this.props.onLoad) && this.props.onLoad(post)}
								src={typeof photo === "string" ? photo : `https://firebasestorage.googleapis.com/v0/b/pikature.appspot.com/o/${photo.name}?alt=media`}
								preview={!minimal}
							/>
						))
					}
					
					{ (!_.isEmpty(post.cover) || !_.isEmpty(post.datePosted)) && post?.lat && post?.lng ? this.renderMapSlide() : null }
				</Carousel>

				{
					// This determines if the post is in a certain layout of `Postlist.DisplayTypes.GRID` or `Postlist.DisplayTypes.PANEL`
					minimal ? null : (
						<>
							{
								_.isObject(post.place) ? (
									<div className={`post-cover-content ${_.isEmpty(post.datePosted) && "post-cover-content-visible"}`}>
										<Row justify="space-between" align="start">
											<Col span={18}>
												<a href={`https://maps.google.com/?q=${post.place.lat || post.lat},${post.place.lng || post.lng}`}><Typography.Title level={3} style={{ color: "white", margin: 0 }}>{post.place.name}</Typography.Title></a>
												<Typography.Text style={{ color: "white" }}>{post.place.openNow ? "Open" : ""}</Typography.Text>
											</Col>
											<Col span={6}>
											{
												_.isEmpty(post.cover) && _.isEmpty(post.datePosted) && !_.isEmpty(post.place?.photos) && (
													<img 
														alt="powered-by-google"
														src="/powered-by-google.png" 
														style={{ width: "100%", opacity: _.isEmpty(post.datePosted) && _.indexOf([undefined, 0], currentSlide) === -1 ? 1 : 0, transition: "opacity .33s ease-in-out" }}
													/>
												)
											}
											</Col>
										</Row>
									</div>
								) : null
							}
							
							<div
								className={`guests-container ${minimal ? "guests-container-minimal" : ""}`}
								style={{ transform: `translate(${guestVisible ? 0 : 200 + "px"})`, opacity: guestVisible ? 1 : 0 }}
							>
								{ this.renderGuests() }
							</div>
				
							{
								!compact ? (
									<div className="post-content" style={{ transform: "translate(0, -15px)"}}>
										{ this.renderDetails() }
									</div>
								) : null
							}
						</>
					)
				}
				
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
					<Row style={{ padding: "20px", maxHeight: "calc(100vh - 75px)", overflow: "auto" }}>
						<Col span={18}>
								<b>{ selectedComment?.user.tag }</b>
								{ selectedComment?.user.id !== user.id ? " " + selectedComment?.description : null }
						</Col>
						<Col span={6} className="comment-date">
							<sub>{ Moment(selectedComment?.dateCreated).isValid() ? Moment(selectedComment?.dateCreated).fromNow() : null }</sub>
						</Col>
						{
							selectedComment?.user.id === user.id ? (
								<Col span={24} style={{ marginTop: "20px" }}>
									<Input.TextArea
										autoFocus
										className="comment-text"
										placeholder="Say something..."
										defaultValue={editComment}
										onBlur={({ target: { value }}) => setEditComment(value)}
									/>
								</Col>
							) : null
						}
					</Row>
					
					<div className="button-group" style={{ textAlign: "right", padding: "20px", overflow: "auto hidden" }}>
						<Button onClick={() => setSelectedComment()}>Close</Button>
						{
							selectedComment?.user.id !== user.id ? (
								<>
									{/*<Button>Report</Button>*/}
								</>
							) : (
								<>
									{
										_.isFunction(this.props.onCommentDelete) ? (
										<Button
											onClick={async () => {
												Modal.confirm({
													title: "Delete Comment",
													content: "Are you sure you want to delete this comment? This cannot be undone.",
													icon: null,
													okText: "Delete",
													cancelText: "Cancel",
													onOk: async () => {
														await this.props.onCommentDelete(selectedComment.id, post.id);
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
											await this.props.onComment({ id: selectedComment.id, description: editComment }, post.id);
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
			</div>
		);
	}

	renderMapSlide() {
		const { minimal, post } = this.props;

		return (
			<Row>
				<Col span={24} className={`post-map-container ${minimal ? "post-map-container-minimal" : ""}`}>
					<StaticMap
						lat={post?.lat}
						lng={post?.lng}
						{...minimal ? { height: 200, width: 200 } : {}}
					/>

					<EnvironmentFilled 
						style={{ 
							fontSize: 40, color: "var(--ant-primary-color)",
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							zIndex: 10
						}} 
					/>
				</Col>
			</Row>
		);

		return (
			<Row>
				<Col span={24} className={`post-map-container ${minimal ? "post-map-container-minimal" : ""}`}>
					<GoogleMapReact
						id="explore-map"
						bootstrapURLKeys={{ 
							key: "AIzaSyBBcToE4P-S9EF2A6pS3Ey-4tGj9SRkN54"
						}}
						center={[post?.lat, post?.lng]}
						zoom={minimal ? 12 : 13}
						draggable={!minimal}
						options={{
							disableDefaultUI: true
						}}
					>
						<EnvironmentFilled 
							lat={post?.lat} lng={post?.lng}
							style={{ fontSize: 40, color: "var(--ant-primary-color)", transform: "translate(-20px, -20px)" }} 
						/>
					</GoogleMapReact>
				</Col>
			</Row>
		);
	}
	 
	renderGuests() {
		const { post, user, currentSlide } = this.props;
		const guestList = _(post.host).concat(post.guests).compact().filter(user => !_.isEmpty(user.tag) /* Null tag names are disabled accounts */).value();
		return (
			<List
				split={false}
				dataSource={guestList}
				renderItem={user => (
					<List.Item key={user.id} style={{ justifyContent: "flex-end", padding: "20px 20px 0 0" }}>
						<Button 
							className="guests-name" 
							onClick={() => _.isFunction(this.props.onClickProfile) && this.props.onClickProfile(user.tag)}
							icon={user.id === post.host.id ? <CrownFilled style={{ color: "#ffde4c" }} /> : null}
						>
							{user.tag}
						</Button>
						<Avatar
							size={50}
							icon={<UserOutlined />}
							src={user.picture}
						/>
						
						{/* <List.Item.Meta
							style={{ justifyContent: "flex-end" }}
							className="guests-avatar"
							avatar={(
								<Avatar
									size={50}
									icon={<UserOutlined />}
									src={user.picture}
								/>
							)}
						/> */}
					</List.Item>
				)}
			/>
		);
	}

	renderDetails() {
		const {
			user,
			post, 
			guestVisible, setGuestVisible,
			menuVisible, setMenuVisible,
			comment, setComment,
			saveCommentLoading,
			uploadPhotoVisibility, setUploadPhotoVisibility,
			guestGalleryPage, setGuestGalleryPage,
			savePostPhotoLoading,
			postsLoading, 
			leavePostLoading, joinPostLoading,
			selectedComment, setSelectedComment,
			editComment, setEditComment
		} = this.props;

		const postAuthors = _(post.host).concat(post.guests).compact().filter(user => !_.isEmpty(user.tag)).value();
		const state = { ...post, ...this.state, gallery: !_.isNil(this.state.gallery) ? this.state.gallery : post.gallery };
		
		return (
			<>
				<Row justify="space-between" align="top" className={_.isEmpty(post.datePosted) ? "post-actions-visible" : "post-actions"} style={{ margin: "0 20px", flexWrap: "nowrap" /* Prevent overflow on tight screens */ }}>
					<div className="button-group">
					{
						_.isFunction(this.props.onJoin) ? (
							<Button type="primary" icon={<SmileFilled />} loading={joinPostLoading}
								onClick={async () => { await this.props.onJoin(post.id); setUploadPhotoVisibility(true); setMenuVisible(false); }}
							>
								Join
							</Button>
						) : null
					}
					{
						_.isFunction(this.props.savePostPhoto) ? (
							<Button icon={<AppstoreFilled />} onClick={() => (!uploadPhotoVisibility && this.guestGalleryRef.current?.goTo(_.indexOf(_.map(postAuthors, "id"), user.id))) || setUploadPhotoVisibility(!uploadPhotoVisibility)}><CaretDownOutlined style={{ transition: "transform .33s ease-in-out", transform: uploadPhotoVisibility ? "rotate(180deg)" : null }} /></Button>
						) : null
					}
					</div>
					
					<Col className="button-group">
						{
							_.isFunction(this.props.onCommentsClick) ? (
								<Button icon={<MessageFilled />} onClick={() => this.props.onCommentsClick(post.id)}>{ " " + _.size(post.comments) }</Button>
							) : null
						}
						{
							_.isFunction(setGuestVisible) ? (
								<Button icon={<SmileFilled />} onClick={() => setGuestVisible(!guestVisible)}>{ " " + _.size(_(post.host).concat(post.guests).filter(user => !_.isEmpty(user.tag)).value()) }</Button>
							) : null
						}
					</Col>
				</Row>

				<div  style={{ marginBottom: "20px" }}>
					<Collapse 
						ghost
						activeKey={_.isFunction(this.props.savePostPhoto) && uploadPhotoVisibility ? 1 : 0}
						expandIcon={props => null}
						style={{ marginBottom: "20px" }}
					>
						{/* Upload Photo Visibility indicates whether the Panel key is collapsed or not */}
						<Collapse.Panel key={1}>
							<div className="guest-gallery-container" style={{ overflow: "auto hidden", whiteSpace: "nowrap" }}>
								<span>
								{
									_.map(postAuthors, (guest, index) => (
										<Button
											shape="round"
											size="large"
											className="guest-gallery-button"
											type={guestGalleryPage === index ? "primary" : "default"}
											onClick={() => this.guestGalleryRef.current?.goTo(index)}
											icon={guest.id === post.host.id ? <CrownFilled style={{ color: guestGalleryPage === index ? "white" : "#ffde4c" }} /> : null}
										>
											{ guest.tag }
										</Button>
									))
								}
								</span>
								<span>
									<Tooltip placement="right" title="Upload your photos here and see what others have uploaded.">
										<QuestionCircleFilled className="guest-gallery-button" style={{ fontSize: 20, verticalAlign: "middle" }} />
									</Tooltip>
								</span>
							</div>
								
							<Spin spinning={!!(savePostPhotoLoading /* Double negation because undefined counts as true in this component */)} indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />}>
								<Carousel  
									ref={this.guestGalleryRef}
									dotPosition="bottom"
									arrows
									prevArrow={<CaretLeftOutlined />}
									nextArrow={<CaretRightOutlined />}
									beforeChange={(from, to) => setGuestGalleryPage(to)}
								>
									{ 
										_.map(postAuthors, guest => (
											<div id={guest.id}>
												{ this.renderGuestGallery(guest) }
											</div>
										))
									}
								</Carousel>
							</Spin>

							<Row justify="space-between" align="middle" style={{ margin: "20px 20px 0 20px" }}>
								<div className="button-group">
									{
										_.isFunction(this.props.onDelete || this.props.onEdit || this.props.onLeave) && (
											<Button
												shape="circle"
												onClick={() => {
													setMenuVisible(!menuVisible);
													clearTimeout(this.timeout);
													this.timeout = setTimeout(() => setMenuVisible(false), 5000);
												}}
												icon={<SettingFilled style={{ transition: "transform .33s ease-in-out", transform: menuVisible ? "rotate(45deg)" : null }} />}
											/>
										)
									}
									{
										!menuVisible ? null : (
											<>
												{
													_.isFunction(this.props.onDelete) ? (
														<Button shape="circle" type="danger" icon={<DeleteFilled />} onClick={() => {
															Modal.confirm({
																title: _.isEmpty(post.datePosted) ? "Delete Open Invite" : "Delete Post",
																content: `Are you sure you want to delete this ${_.isEmpty(post.datePosted) ? "Open Invite" : "Post"}? This cannot be undone.`,
																icon: null,
																okText: "Delete",
																cancelText: "Cancel",
																onOk: async () => {
																	this.props.onDelete(post.id);
																	setMenuVisible(false);
																}
															});
														}} />
													)	 : null
												}
												{
													_.isFunction(this.props.onEdit) ? (
														<Button icon={<EditFilled />} onClick={() => this.props.onEdit(post)}>
															Edit
														</Button>
													) : null
												}
												{
													_.isFunction(this.props.onLeave) ? (
														<Button icon={<FrownFilled />} loading={leavePostLoading} 
															onClick={async () => Modal.confirm({
																title: `Leave ${_.isEmpty(post.datePosted) ? "Open Invite" : "Post"}`,
																content: _.isEmpty(post.datePosted) ? "Your uploaded photos will be removed. This cannot be undone. Continue to leave?" : "Your uploaded photos will be removed and you will need to ask the host if you want to join back. This cannot be undone. Continue to leave?",
																okText: "Leave",
																onOk: async () => { 
																	await this.props.onLeave(post.id); 
																	setUploadPhotoVisibility(false); 
																	setMenuVisible(false); 
																}
															})}
														>
															Leave
														</Button>
													) : null
												}
											</>
										)
									}
									{
										_.isFunction(this.props.refresh) && (
											<Button
												icon={<ReloadOutlined />}
												loading={postsLoading}
												onClick={() => this.props.refresh()}
											>
												Refresh
											</Button>
										)
									}
								</div>

								{
									!_.isEmpty(this.state.files) || post.gallery !== state.gallery ? (
										<Row align="middle">
											<Tooltip placement="left" title="Upload your photos while host prepares to publish this post.">
												<QuestionCircleFilled style={{ fontSize: 20, marginRight: "10px" }} />
											</Tooltip>
											<Button
												// disabled={post.gallery === state.gallery /* This lets the user remove photos from the gallery */}
												loading={savePostPhotoLoading}
												type="primary"
												onClick={async () => {
													// Upload will save the uploaded photos which in turn, empties the `this.state.files` which enables the "Post" button
													await this.props.savePostPhoto({ files: this.state.files, id: post.id, gallery: state.gallery });
													this.setState({ files: [], gallery: undefined });
												}}
											>
												Save
											</Button>
										</Row>
									) : !_.isEmpty(post.datePosted) ? (
											<span>Posted { Moment(post.datePosted).fromNow() }</span>
										) : user.id === post.host.id ? ( /* If the user idhost, let them publish the post. Otherwise, let the guest ready up */
										<Button
											type="primary"
											onClick={async () => {
												await this.props.onPublish({ ...state, datePosted: new Date().toISOString() });
												this.setState({ files: [], gallery: undefined });
												setUploadPhotoVisibility(false);
											}}
										>
											Publish
										</Button>
									) : !_.isEmpty(_.concat(_.filter(state.gallery, photo => photo.owner.id === user.id), this.state.files)) ? ( // Determines what tooltip to display based on the content of the guest gallery
											<Tooltip placement="left" title="Ready to publish. Waiting for host.">
												<Row align="middle">
													<CheckCircleFilled style={{ fontSize: 20, marginRight: "10px", color: "#49cc90" }} />
													Ready
												</Row>
											</Tooltip>
										) : (
											<Tooltip placement="left" title="Upload your photos while host prepares to publish this post.">
												<Row align="middle">
													<QuestionCircleFilled style={{ fontSize: 20, marginRight: "10px" }} />
													<Button type="primary" disabled>
														Save
													</Button>
												</Row>
											</Tooltip>
										)
								}
							</Row>

						</Collapse.Panel>
					</Collapse>

					<Row justify="space-between" align="top" style={{ margin: "0 20px 0 20px" }}>
						<Col span={24}>
							<Row justify="space-between">
								<Col key={0} span={18}>
									<div><b>{ post.host.tag }</b>{" "}{ post.description }</div>
								</Col>
								<Col key={1} span={6} className="comment-date">
									<sub>{ Moment(post.dateCreated).isValid() ? Moment(post.dateCreated).format("LL") : null }</sub>
								</Col>
							</Row>

							{
								_.map(_.compact(post.comments), (comment, index) => (
									<Row justify="space-between" onClick={() => setSelectedComment(comment) || setEditComment(comment.description)}>
										<Col key={comment.id} span={18}>
											<div className="comment">
												<b>{ comment.user.tag }</b>
												{ " " + comment.description }
											</div>
										</Col>
										<Col key={comment.id + index} span={6} className="comment-date">
											<sub>{ Moment(comment.dateCreated).isValid() ? Moment(comment.dateCreated).fromNow() : null }</sub>
										</Col>
									</Row>
								))
							}
						</Col>
					</Row>
					{
						_.isFunction(this.props.onComment) ? (
							<Row justify="end" className="comment-form-container">
								<Input.TextArea
									className="comment-text"
									placeholder="Say something..."
									rows={1}
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
										await this.props.onComment({ description: comment }, post.id);
										setComment("")
									}}
								>
									Comment
								</Button>
							</Row>
						) : null
					}
				</div>
			</>
		);
	}

	renderGuestGallery(guest) {
		const { 
			user,
			post,
			fileToRemove, setFileToRemove
		} = this.props;
		
		const state = { ...post, ...this.state, gallery: !_.isNil(this.state.gallery) ? this.state.gallery : post.gallery };
		const allowUpload = guest.id === user.id && _.isEmpty(post.datePosted);
		
		let guestPhotos = _.filter(state.gallery, photo => photo.owner.id === guest.id);
		// If the guest is the active user, the gallery will contain the `this.state.files` list as well as upload placeholders 
		if(allowUpload) guestPhotos = _.concat(guestPhotos, this.state.files);
		guestPhotos = _(guestPhotos)
			.concat(new Array(9))
			.slice(0, 9)
			.value();

		return (
			<Col>
				{/* Hidden Input of type file that is trigered by the label below */}
				<input
					id={`file-upload-input-${post.id}`}
					style={{ display: "none" }}
					type="file" 
					accept="image/jpg, image/jpeg, image/png, image/gif, image/bmp, .heic"
					multiple
					onChange={async ({ target: { files } }) => {
						const stateFiles = this.state.files;
						const toConvert = []; // Resize all fils to a max dimentions of 300x300
						for(let file of _.slice(files, 0, 9 - _.size(_.concat(stateFiles, state.gallery)))) {
							toConvert.push(new Promise(resolve => {
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
							}));
						}

						const toAppend = await Promise.all(toConvert);
						this.setState({ files: _(stateFiles).concat(toAppend).slice(0, 9).value() });

						// Clear Value of input to allow uploading of "same" file
						document.getElementById(`file-upload-input-${post.id}`).value = null;
					}}
				/>

				{
					// Chunk the photos into a <Row> to fix collapse jumpy bug
					_(guestPhotos).chunk(3).map((guestPhotos, outerIndex) => (
						<Row key={outerIndex}>
							{
								_.map(guestPhotos, (file, index) => (
									<Col span={8} key={`${file?.name}${outerIndex}${index}`} style={{ height: "33vw", maxHeight: "192px" }}>
										{
											// For each gallery photo, only get those that belong to the current user
												_.isEmpty(file?.name) ? ( // This means we show an empty image tha user can upload a file into
												<label htmlFor={allowUpload ? `file-upload-input-${post.id}` : null}>
													<Row
														justify="center" align="middle" className="post-upload-image"
														style={{ pointerEvents: allowUpload ? "auto" : "none" }}
													>
														<FileImageFilled style={{ fontSize: 20, opacity: allowUpload ? 0.33 : 0 }} />
													</Row>
												</label>
											) : ( // This indicates that the photo is an Upload file
												<Row
													justify="center" align="middle" className="post-upload-image"
													style={{ pointerEvents: allowUpload && guest.id === user.id ? "auto" : "none", backgroundImage: !_.isEmpty(file.preview) ? `url("${file.preview}")` : `url("https://firebasestorage.googleapis.com/v0/b/pikature.appspot.com/o/${file.name}?alt=media")` }}
													onClick={() => {
														if(guest.id === user.id) {
															setFileToRemove(fileToRemove === file.name ? "" : file.name);
															clearTimeout(this.timeoutCode);
															this.timeoutCode = setTimeout(() => setFileToRemove(""), 3000);
														}
													}}
												>
													{
														allowUpload && fileToRemove === file.name ? (
															<Row
																justify="center" align="middle" className="post-upload-image"
																style={{
																	backgroundColor: "#00000066",
																	color: "white"
																}}
															>
																<Button 
																	style={{ height: "60px", width: "60px", borderRadius: "50%" }}
																	icon={<CloseOutlined style={{ fontSize: 30 }} />}
																	onClick={() => {
																		const toRemove = _.find(guestPhotos, { name: fileToRemove });
																		if(toRemove?.id) { // This means the photo to remove is found in the gallery
																			this.setState({ gallery: _.filter(state.gallery, photo => photo !== toRemove) });
																		} else if(toRemove?.name) {
																			this.setState({ files: _.filter(state.files, file => file !== toRemove) });
																		}
																	}}
																/>
															</Row>
														) : null
													}
												</Row>
											)
										}
									</Col>
								))
							}
						</Row>
					)).value()
				}
			</Col>
		);
	}
}
