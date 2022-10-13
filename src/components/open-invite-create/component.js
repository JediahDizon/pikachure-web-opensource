import { Component, createRef } from "react";
import ReactDOM from "react-dom";

import GoogleMapReact from "google-map-react";
import { Collapse, Divider, Avatar, Input, Row, Col, Button, Carousel, Typography, Space, List, Tabs, Card, Spin, Tooltip, Image, Empty } from "antd";
import { FileImageFilled, LeftOutlined,  CaretLeftOutlined, CaretRightOutlined, CaretUpOutlined, CloseCircleFilled, CloseOutlined, LoadingOutlined, QuestionCircleFilled, EnvironmentFilled, SearchOutlined } from "@ant-design/icons";
import Resizer from "react-image-file-resizer";
import Supercluster from "supercluster";
import { Marker } from "react-mapbox-gl";
import _ from "lodash";

import { PlaceMarker, Map, StaticMap } from "src/components";
import "./style.css";

// const google = window.google;
const zoomDistanceMapping = {
	17: 0.00375,
	15: 0.0075,
	13: 0.0375,
	12: 0.075,
	10: 0.1875,
	9: 0.375,
	8: 0.75,
	7: 1.875,
	6: 3.75,
	5: 7.5,
	4: 15,
};

// Nearest Neighbor algorithm for determining the closest zoom value
function getZoomDistanceMapping(zoom) {
	return _.map(zoomDistanceMapping, (value, key) => _.toNumber(key)).reduce((prev, curr) => 
		(Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev)
	);
}
export default class OpenInviteCreate extends Component {
	static defaultState = {
		files: [], // Gallery photo uploads (Not used?)
		coverFiles: [] // Cover photo uploads
	};
	state = { ...OpenInviteCreate.defaultState };

	navPages = [{
		name: "Photoshoot Site",
		tooltip: "Set the location of your open invite"
	}, {
		name: "Details",
		tooltip: "Perview open invite and add details"
	}];
	timeoutCode = 0;

  componentWillUnmount() {
    // https://developers.google.com/maps/documentation/javascript/events#removing
    // this.Maps && this.Maps.event.clearInstanceListeners(this.mapSearch);
		
		clearTimeout(this.timeoutCode);
  }

	render() {
		const { navPage } = this.props;

		return (
			<Tabs
				centered
				activeKey={`${navPage}`}
				renderTabBar={(tabProps, tabBar) => this.renderTabBar(tabProps, tabBar)}
			>
				<Tabs.TabPane key="0" className="open-invite-tab-container">
					{ this.renderMapTab() }
				</Tabs.TabPane>

				<Tabs.TabPane key="1" className="open-invite-tab-container">
					{ this.renderDetailsTab() }
				</Tabs.TabPane>
			</Tabs>
		);
	}

	renderTabBar() {
		const { mentionList, navPage, setNavPage, saveLoading, values } = this.props;

		return (
			<>
				<Row justify="space-between" align="middle" style={{ padding: "20px" }}>
					<Col><Button shape="circle" icon={<CloseOutlined />} onClick={() => this.props.onDraft() } /></Col>

					<Col>
						<Tooltip placement="bottom" title={this.navPages[navPage].tooltip}>
							{ this.navPages[navPage].name }
							<QuestionCircleFilled style={{ marginLeft: "10px" }} />
						</Tooltip>
					</Col>

					<Col className="button-group">
						<Button
							disabled={saveLoading || navPage === 0}
							onClick={() => setNavPage(Math.max(navPage - 1, 0)) }
						>
							<LeftOutlined />
						</Button>

						<Button
							loading={saveLoading}
							type="primary"
							onClick={async () => {
								if(navPage === _.size(this.navPages) - 1 ) {
									await this.props.onSave({
										...this.state,
										id: values?.id || this.state.id
									});
									// Delay the tab transition for elegance
									setTimeout(() => {
										this.setState(OpenInviteCreate.defaultState);
										setNavPage(0);
									}, 1000);
								} else {
									setNavPage(Math.min(navPage + 1, 2))
								}
							}}
						>
							{ navPage < _.size(this.navPages) - 1 ? (navPage === 1 && _.size(mentionList) === 0) ? "Skip" : "Next" : !_.isEmpty(values.id) ? "Save" : "Publish"}
						</Button>
					</Col>
				</Row>
				<Divider style={{ margin: 0 }} />
			</>
		);
	}

	renderMapTab() {
		const { 
			values,
			navPage, setNavPage, 
			places, placesLoading, 
			zoom, setZoom 
		} = this.props;

		// Merge original values to state values
		const state = { ...this.props.values, ...this.state };

		// Cluster the map markers based on zoom value
		const clusterMarkers = new Supercluster({
			minZoom: 0,
			maxZoom: 20,
			radius: 30,
			extent: 512,
			map: props => ({ sum: 1 }),
			reduce: (accumulated, props) => { accumulated.sum += props.sum; }
		});
		clusterMarkers.load(_.map(places, place =>  ({
			"type": "Feature",
			"geometry": { "type": "Point", "coordinates": [place.lng, place.lat] },
			place
		})));
		const markers = clusterMarkers.getClusters([-180, -85, 180, 85], zoom);

		return (
			<>
				<Row id="invite-map-container">
					<Map
						style="mapbox://styles/mapbox/outdoors-v11"
						containerStyle={{
							height: "100%",
							width: "100%"
						}}
						center={[state.lng, state.lat]}
						onZoomStart={map => setZoom(Math.trunc(map.getZoom()))}
						onDragEnd={(map, event) => {
							const { lat, lng } = map.getCenter();
							this.setState({ lat, lng });
							map.easeTo({ center: [lng, lat] });
							
							// Get Zoom value for places search
							const zoom = Math.trunc(map.getZoom());
							setZoom(zoom);
						}}
					>
						{ 
							_.map(markers, marker => {
								const { geometry: { coordinates }, properties, post } = marker;
								return (
									<Marker coordinates={[coordinates[0], coordinates[1]]}>
										<PlaceMarker
											marker={marker}
											onClick={() => {
												const { place } = marker;
												if(_.isEmpty(place)) return;
												this.setState({ place: place, lat: place.lat, lng: place.lng });
												setTimeout(() => setNavPage(Math.min(navPage + 1, 2)), 500);
											}}
										/>
									</Marker>
								);
							})
						}

						{/*<Marker coordinates={[state.lng, state.lat]}>
							<EnvironmentFilled 
								lat={state.lat} lng={state.lng}
								style={{ fontSize: 40, color: "var(--ant-primary-color)" }} 
							/>
						</Marker>*/}

						<EnvironmentFilled 
							style={{ 
								fontSize: 40, color: "var(--ant-primary-color)",
								position: "absolute",
								top: "calc(50% - 20px)",
								left: "50%",
								transform: "translate(-50%, -50%)",
								zIndex: 10
							}} 
						/>

						{
							_.isFunction(this.props.onSearchPlaces) && (
								<div style={{ 
									fontSize: 40, color: "var(--ant-primary-color)",
									position: "absolute",
									bottom: "20px",
									left: "50%",
									transform: "translateX(-50%)",
									zIndex: 10
								}}>
									{
										_.isNumber(zoom) && zoom < 12 ? (
											<Tooltip title="Zoom Closer">
												<Button 
													disabled={_.isNumber(zoom) && zoom < 12}
													icon={<SearchOutlined />}
													onClick={() => this.props.onSearchPlaces({ lat: state.lat, lng: state.lng, radius: zoomDistanceMapping[getZoomDistanceMapping(zoom)] })}
												>
													Parks
												</Button>
											</Tooltip>
										) : (
											<Button
												loading={placesLoading}
												icon={<SearchOutlined />}
												onClick={() => this.props.onSearchPlaces({ lat: state.lat, lng: state.lng, radius: zoomDistanceMapping[getZoomDistanceMapping(zoom)] })}
											>
												Parks
											</Button>
										)
									}
								</div>
							)
						}
					</Map>
				</Row>
					
				<Row id="search-places-container">
					<Col span={24}>
						<Divider plain orientation="left">
							<Tooltip placement="right" title="Set the photoshoot location">
								Set Location
								<QuestionCircleFilled style={{ marginLeft: "10px" }} />
							</Tooltip>
						</Divider>

						<Spin spinning={placesLoading} indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />}>
							<List
								id="search-places-list"
								split={false}
								dataSource={places}
								renderItem={place => (
									<List.Item 
										key={place.id}
										onClick={() => {
											this.setState({ place: place, lat: place.lat, lng: place.lng });
											setTimeout(() => setNavPage(Math.min(navPage + 1, 2)), 500);
										}}
									>
										{
											!_.isEmpty(place.photos) ? (
												<Card bordered={false} className="search-places-item">
													{
														!_.isEmpty(place.photos) ? (
															<>
																<Image preview={false} alt="place-cover" className="search-places-cover" src={_.first(place.photos)} />
																<Row justify="space-between" align="start" className="search-places-content">
																	<Col span={18}>
																		<Typography.Title level={3} style={{ color: "white", margin: 0 }}>{place.name}</Typography.Title>
																		<Typography.Text style={{ color: "white" }}>{place.openNow ? "Open" : ""}</Typography.Text>
																	</Col>
																	<Col span={6}>
																		<img 
																			alt="powered-by-google"
																			src="/powered-by-google.png" 
																			style={{ width: "100%" }}
																		/>
																	</Col>
																</Row>

																{/*<div className="search-places-content">
																	<Typography.Title level={3} style={{ color: "white", margin: 0 }}>{place.name}</Typography.Title>
																	<Typography.Text style={{ color: "white" }}>{place.openNow ? "Open" : ""}</Typography.Text>
																</div>*/}
															</>
														) : null
													}
													<Row className="gradient-overlay-inverted"></Row>
												</Card>
											) : (
												<List.Item.Meta
													className="search-places-item"
													avatar={<Avatar src={place.icon} />}
													title={place.name}
													description={place.openNow ? "Open" : ""}
												/>
											)
										}
									</List.Item>
								)}
							/>
						</Spin>
					</Col>
				</Row>
			</>
		);
	}

	renderDetailsTab() {
		const { 
			mentionList, setMentionList,
			mentionToRemove, setMentionToRemove,
			fileToRemove, setFileToRemove,
			searchUsers, searchUsersLoading,
			uploadPhotoVisibility, setUploadPhotoVisibility,
			navPage,
			currentSlide, setCurrentSlide,
		} = this.props;

		// Merge original values to state values
		const state = { ...this.props.values, ...this.state };

		// Merge cover gallery with uploaded photos and trim to 3 items
		const postPhotos = _(state.cover)
			.concat(this.state.coverFiles)
			.compact()
			.concat(new Array(3))
			.slice(0, 3)
			.value();

		return (
			<Row justify="center">
				<Col id="invite-details-container">
					<Col>
						<Row justify="space-between" align="start" className="search-places-content">
							<Col span={18}>
								<Typography.Title level={3} style={{ color: "white", margin: 0 }}>{state.place?.name}</Typography.Title>
								<Typography.Text style={{ color: "white" }}>{state.place?.openNow ? "Open" : ""}</Typography.Text>
							</Col>
							<Col span={6}>
								<img 
									alt="powered-by-google"
									src="/powered-by-google.png" 
									style={{ width: "100%", opacity: _.isEmpty(state.cover) && !_.isEmpty(state.place?.photos) && currentSlide !== _.size(state.place?.photos) ? 1 : 0, transition: "opacity .33s ease-in-out" }}
								/>
							</Col>
						</Row>
					
						<Carousel 
							dotPosition="bottom"
							arrows
							prevArrow={<CaretLeftOutlined />}
							nextArrow={<CaretRightOutlined />}
							afterChange={currentSlide => setCurrentSlide(currentSlide)}
						>
							{
								!_.isEmpty(_.compact(postPhotos)) ? _.map(_.compact(postPhotos), file => ( // This tells react to render images from the `state.coverFiles`
									<div className="gallery-item">
										<Image
											alt="post" 
											key={file.name || file.id}
											className="gallery-cover"
											src={file.preview || `https://firebasestorage.googleapis.com/v0/b/pikature.appspot.com/o/${file.name}?alt=media`}
										/>
									</div>
								)) : _.map(!_.isEmpty(state.cover) ? state.cover : state?.photos || state.place?.photos, photo => ( // This tells React whether to render images from `Post.places (original value)`, `state.place (newly-set value)`, or from the cover gallery
									<div className="gallery-item">
										<Image preview={false} alt="post-cover" className="gallery-cover" src={typeof photo === "string" ? photo : `https://firebasestorage.googleapis.com/v0/b/pikature.appspot.com/o/${photo.name}?alt=media`} />
									</div>
								))
							}
							<div className="gallery-item">
								{
									navPage === 1 &&	(
										<>
											<StaticMap
												lat={state.lat}
												lng={state.lng}
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
										</>
									)
								}
							</div>
						</Carousel>
						
						<Row justify="end" align="bottom" id="search-places-actions">
							<Col>
								<div className="button-group" style={{ textAlign: "right" }}>
									<Button icon={uploadPhotoVisibility ? <CaretUpOutlined /> : <FileImageFilled />} onClick={() => setUploadPhotoVisibility(!uploadPhotoVisibility) || (!uploadPhotoVisibility && document.getElementById("search-places-actions").scrollIntoView({ behavior: "smooth" }))}>Cover</Button>
									{
										!_.isEmpty(state.place) ? (
											<Button icon={<CloseOutlined />} onClick={() => { this.setState({ place: null /* Don't erase lat/lng */ }); }}>Unmark</Button>
										) : null
									}
								</div>
							</Col>
						</Row>

						<Row className="gradient-overlay-inverted"></Row>
					</Col>

					<Collapse 
						ghost
						activeKey={[uploadPhotoVisibility ? 1 : 0]}
						expandIcon={props => null}
					>
						{/* Upload Photo Visibility indicates whether the Panel key is collapsed or not */}
						<Collapse.Panel key={1}> 
							<Row justify="space-between" gutter={0}>
								<input 
									id="file-upload-input"
									style={{ display: "none" }}
									type="file" 
									accept="image/jpg, image/jpeg, image/png, image/gif, image/bmp, .heic"
									multiple
									onChange={async ({ target: { files } }) => {
										const stateFiles = this.state.coverFiles;
										const toConvert = []; // Resize all fils to a max dimentions of 300x300
										for(let file of _.slice(files, 0, 3 - _.size(_.concat(stateFiles, this.state.cover)))) {
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
										this.setState({ coverFiles: _(stateFiles).concat(toAppend).slice(0, 3).value() });
						
										// Clear Value of input to allow uploading of "same" file
										document.getElementById("file-upload-input").value = null;
									}}
								/>

								{
									postPhotos.map((file, index) => (
										<Col span={8} key={file?.name || index} style={{ height: "33vw", maxHeight: "192px" }}>
											{
												_.isEmpty(file?.name) ? ( // This indicates that the photo comes from the original `Post.cover`
														<label htmlFor="file-upload-input">
															<Row
																justify="center" align="middle" className="invite-upload-image"
																style={{ backgroundColor: "#00000010", border: "1px dashed #00000010" }}
															>
																<FileImageFilled style={{ fontSize: 20, opacity: 0.33 }} />
															</Row>
														</label>
												) : ( // This indicates that the photo is an Upload file
													<Row
														justify="center" align="middle" className="invite-upload-image"
														style={{ backgroundImage: !_.isEmpty(file.preview) ? `url("${file.preview}")` : `url("https://firebasestorage.googleapis.com/v0/b/pikature.appspot.com/o/${file.name}?alt=media")` }}
														onClick={() => {
															setFileToRemove(fileToRemove === index ? "" : index);
															clearTimeout(this.timeoutCode);
															this.timeoutCode = setTimeout(() => setFileToRemove(""), 3000);
														}}
													>
														{
															fileToRemove === index ? (
																<Row
																	justify="center" align="middle" className="invite-upload-image"
																	style={{
																		backgroundColor: "#00000066",
																		color: "white"
																	}}
																>
																	<Button 
																		style={{ height: "60px", width: "60px", borderRadius: "50%" }}
																		icon={<CloseOutlined style={{ fontSize: 30 }} />}
																		onClick={() => {
																			const toRemove = _.get(postPhotos, fileToRemove);
																			if(toRemove?.id) { // This means the photo to remove is found in the gallery
																				this.setState({ cover: _.filter(state.cover, photo => photo !== toRemove )});
																			} else if(toRemove?.name) {
																				this.setState({ coverFiles: _.filter(state.coverFiles, file => file !== toRemove) });
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
						</Collapse.Panel>
					</Collapse>
					
					<Row style={{ padding: "20px" }}>
						<Input.TextArea
							style={{ padding: "20px" }}
							placeholder={`${[
								"Meetup at 5:30pm. Be there or be square", 
								"Saturday-night photo trip around this area",
								"Bring your pet!"
							][Math.floor(_.random(0, 2))]}`}
							rows={4}
							value={state.description}
							onChange={({ target: { value }}) => this.setState({ description: value })}
						/>
					</Row>

					{
						!_.isEmpty(state.id) && (
							<>
								<Divider plain orientation="left">
									<Tooltip placement="right" title="Collaborate! People listed here have joined this Open Invite">
										Guests
										<QuestionCircleFilled style={{ marginLeft: "10px" }} />
									</Tooltip>
								</Divider>

								<Row>
									{
										!_.isEmpty(state.guests) ? (
											<Space id="invite-people-guests" size={10} direction="horizontal" align="center">
												{
													_.map(state.guests, guest => (
														<div
															className="invite-prople-profile-selected"
															style={{ position: "relative", width: "50px", borderRadius: "50%", overflow: "hidden" }}
															onClick={() => {
																setMentionToRemove(guest);
																clearTimeout(this.timeoutCode);
																this.timeoutCode = setTimeout(setMentionToRemove, 3000, null);
															}}
														>
															{
																mentionToRemove?.id === guest.id ? (
																	<Button
																		style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#00000066" }}
																		icon={(
																		<CloseCircleFilled
																			style={{ color: "white", fontSize: 30 }}
																			onClick={event => {
																				event.stopPropagation();  // Prevent the parent `onClick` into calling the mentionToRemove function
																				setMentionToRemove(null);
																				this.setState({ guests: _.filter(state.guests, user => user.id !== mentionToRemove.id) });
																			}}
																		/>
																		)}
																	/>
																) : null
															}
															<img
																alt="profile"
																src={guest?.picture}
																style={{ width: "100%", margin: "auto" }}
															/>
														</div>
													)) 
												}
											</Space>
										) : (
											<Col span={24}>
												<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No guests yet" />
											</Col>
										)
									}
								</Row>

								{
									false && (
										<>
											<Row style={{ padding: "20px" }}>
												<Input
													id="invite-people-search"
													placeholder="Search"
													addonBefore="@"
													onChange={({ target: { value: search }}) => {
														clearTimeout(this.timeoutCode);
						
														if(!search) return;
														setMentionList([]);
														this.timeoutCode = setTimeout(() => this.props.onSearchUsers(search), 1000);
													}}
												/>
											</Row>
						
											<Row style={{ padding: "0 20px" }}>
												<Col span={24} style={{ minHeight: "25vh" }}>
													<Spin spinning={searchUsersLoading} indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />}>
														<List
															split={false}
															dataSource={_.filter(searchUsers, user => _.indexOf(_.map(state.guests, "id"), user.id) === -1)}
															renderItem={user => (
																<List.Item
																	key={user.id}
																	style={{ cursor: "pointer" }}
																	onClick={() => this.setState({ guests: [..._.filter(state.guests, guest => guest.id !== user.id), user] })}
																>
																	<List.Item.Meta
																		avatar={(
																			<Avatar
																				size={50}
																				icon={<img alt="profile" src={user.picture} />} />
																		)}
																		title={<Typography.Text style={{ margin: 0 }}>{ user.tag }</Typography.Text>}
																		//description={<Typography.Paragraph>{ _.find(state.guests, { id: user.id }) ? "Added" : "" }</Typography.Paragraph>}
																	/>
																</List.Item>
															)}
														/>
													</Spin>
												</Col>
											</Row>
										</>
									)
								}
							</>
						)
					}
				</Col>
			</Row>
		);
	}
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}