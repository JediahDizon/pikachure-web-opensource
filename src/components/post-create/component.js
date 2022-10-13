import { Component } from "react";
import { Image, Button, Tooltip, Tabs, Row, Col, Divider, Input, Carousel, Spin, List, Card, Typography, Avatar } from "antd";
import { SearchOutlined, LeftOutlined, QuestionCircleFilled, FileImageFilled, CloseOutlined, CaretLeftOutlined, CaretRightOutlined, LoadingOutlined, EnvironmentFilled, AimOutlined } from "@ant-design/icons";
import GoogleMapReact from "google-map-react";
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
export default class PostCreate extends Component {
	static defaultState = {
		files: []
	};
	state = PostCreate.defaultState;

	navPages = [{
		name: "Photos",
		tooltip: "Select the photos you want to upload"
	}, {
		name: "Details",
		tooltip: "Preview your post and add a description"
	}];
	
	render() {
		const { navPage } = this.props;

		return (
			<Tabs
				centered
				activeKey={`${navPage}`}
				renderTabBar={(tabProps, tabBar) => this.renderHeader(tabProps, tabBar)}
			>
				<Tabs.TabPane key="0" className="create-post-tab-container">
					{ this.renderUploadTab() }
				</Tabs.TabPane>

				<Tabs.TabPane key="1" className="create-post-tab-container">
					{ this.renderDetailsTab() }
				</Tabs.TabPane>
			</Tabs>
		);
	}

	renderHeader() {
		const { mentionList, navPage, setNavPage, saveLoading } = this.props;

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
							disabled={navPage === 0}
							onClick={() => setNavPage(Math.max(navPage - 1, 0)) }
						>
							<LeftOutlined />
						</Button>

						<Button
							disabled={navPage === _.size(this.navPages) - 1 && _.isEmpty(this.props.values?.datePosted) && _.isEmpty(this.state.files)}
							loading={saveLoading}
							type="primary"
							onClick={async () => {
								if(navPage === _.size(this.navPages) - 1 ) {
									await this.props.onSave({ 
										...this.state, 
										datePosted: this.props.values.datePosted || new Date().toISOString() 
									});
									
									// Delay the tab transition for elegance
									setTimeout(() => {
										this.setState({ files: [], description: "" });
										setNavPage(0);
										document.getElementById("profile-content-card").scrollIntoView({ behavior: "smooth" });
									}, 1000);
								} else {
									setNavPage(Math.min(navPage + 1, 2))
								}
							}}
						>
							{ 
								navPage < _.size(this.navPages) - 1 ? 
									navPage === 1 && _.size(mentionList) === 0 ? "Skip" : "Next" : 
									_.isEmpty(this.props.values?.datePosted) ? "Publish" : "Save" 
							}
						</Button>
					</Col>
				</Row>
				<Divider style={{ margin: 0 }} />
			</>
		);
	}

	renderUploadTab() {
		const { 
			fileToRemove, setFileToRemove,
			zoom, setZoom,
			places, placesLoading,
			navPage, setNavPage, 
		} = this.props;
			
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

		// Append the `Post.gallery` to the `state.files` and append remaining spots out of 9 with placeholder
		const state = { ...this.props.values, ...this.state };
		const postPhotos = _(state.gallery)
			.concat(this.state.files)
			.compact()
			.concat(new Array(9))
			.slice(0, 9)
			.value();
		
		const allowUpload = _.isEmpty(state.datePosted);

		return (
			<Row justify="space-between" gutter={0}>
				<input 
					id="file-upload-input"
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
						this.setState({ files: _(stateFiles).concat(toAppend).slice(0, Math.min(9 - _.size(state.gallery)), 9).value() });
						
						// Clear Value of input to allow uploading of "same" file
						document.getElementById("file-upload-input").value = null;
					}}
				/>
				{
					_.map(postPhotos, (file, index) => (
						<Col key={index} span={8} style={{ height: "33vw", maxHeight: "173px" /* .33 width of modal where this component is rendered */ }}>
							{
								_.isEmpty(file?.name) ? ( // This means we show an empty image tha user can upload a file into
										<label htmlFor={allowUpload ? `file-upload-input` : null}>
											<Row justify="center" align="middle" className="post-upload-image">
												<FileImageFilled style={{ fontSize: 20, opacity: allowUpload ? 0.33 : 0 }} />
											</Row>
										</label>
								) : (
									<Row
										justify="center" align="middle" className="post-upload-image"
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
													justify="center" align="middle" className="post-upload-image"
													style={{
														backgroundColor: "#00000066",
														color: "white"
													}}
												>
													<Button 
														style={{ height: "60px", width: "60px", borderRadius: "50%" }}
														icon={<CloseOutlined style={{ fontSize: 30 }} />}
														onClick={() => this.setState({ files: _.filter(this.state.files, (a, index) => index !== this.props.fileToRemove)}, () => this.props.setFileToRemove(""))}
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

				<Col span={24}>
					<Divider plain orientation="left">
						<Tooltip placement="right" title="Set the photoshoot location">
							Set Location
							<QuestionCircleFilled style={{ marginLeft: "10px" }} />
						</Tooltip>
					</Divider>
				</Col>


				<Col id="post-create-map-container">
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
													//setTimeout(() => setNavPage(Math.min(navPage + 1, 2)), 500);
													document.getElementById("post-create-place-content").scrollIntoView({ behavior: "smooth" });
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
				</Col>

				<Col span={24} style={{ minHeight: "25vh" }}>
					<Spin spinning={placesLoading} indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />}>
						<List
							style={{ padding: "20px" }}
							split={false}
							dataSource={places}
							renderItem={place => (
								<List.Item 
									key={place.id}
									onClick={() => {
										this.setState({ place: place, lat: place.lat, lng: place.lng });
										setTimeout(() => setNavPage(Math.min(navPage + 1, 2)), 500);
										//document.getElementById("post-create-place-content").scrollIntoView({ behavior: "smooth" });
									}}
								>
									{
										!_.isEmpty(place.photos) ? (
											<Card bordered={false} className="search-places-item">
												{
													!_.isEmpty(place.photos) ? (
														<>
															<Image preview={false} alt="place-cover" className="search-places-cover" src={_.first(place.photos)} />
															<div className="search-places-content">
																<Typography.Title level={3} style={{ color: "white", margin: 0 }}>{place.name}</Typography.Title>
																<Typography.Text style={{ color: "white" }}>{place.openNow ? "Open" : ""}</Typography.Text>
															</div>
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
		);
	}

	renderDetailsTab() {
		const {
			values,
			places, placesLoading,
			navPage, setNavPage, 
			zoom, setZoom 
		} = this.props;

		const state = { ...this.props.values, ...this.state };
		const postPhotos = _(state.gallery)
			.concat(this.state.files)
			.compact()
			.value();

		return (
			<Row>
				<Col span={24}>
					<Col id="post-create-place-content">
						{
							!_.isEmpty(state.place) ? (
									<>
										<Typography.Title level={3} style={{ color: "white", margin: 0 }}>{state.place.name}</Typography.Title>
										<Typography.Text style={{ color: "white" }}>{state.place?.openNow ? "Open" : ""}</Typography.Text>
									</>
								) : null
						}
					</Col>
					<Carousel 
						// dots={minimal ? false : true}
						dotPosition="bottom"
						arrows
						prevArrow={<CaretLeftOutlined />}
						nextArrow={<CaretRightOutlined />}
					>
						{
							_.map(postPhotos, file => (
								<img
									alt="post" 
									key={file.name}
									className="post-upload-image-preview"
									src={!_.isEmpty(file.preview) ? file.preview : `https://firebasestorage.googleapis.com/v0/b/pikature.appspot.com/o/${file.name}?alt=media`}
								/>
							))
						}
						
						{
							navPage === 1 &&	(
								<div className="post-upload-image-preview">
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
								</div>
							)
						}
						
						{/* <div className="post-image-container"><img className="post-image" src="https://wallpaperaccess.com/full/2382371.jpg" /></div>
						<div className="post-image-container"><img className="post-image" src="https://cdn.wallpaperhub.app/cloudcache/4/5/5/4/c/a/4554cad45b7f8130176b0a2921c4748249a2ea9a.jpg" /></div>
						<div className="post-image-container"><img className="post-image" src="https://wallpapercave.com/wp/wp8139423.jpg" /></div> */}
					</Carousel>
					
					<Row justify="end" align="bottom" id="post-create-place-actions">
						<Col>
							<div className="button-group" style={{ textAlign: "right" }}>
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

				<Col span={24} style={{ padding: "20px" }}>
					<Input.TextArea
						style={{ padding: "20px" }}
						placeholder="Description"
						rows={1}
						defaultValue={state.description}
						onBlur={({ target: { value }}) => this.setState({ description: value })}
					/>
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

async function onPreview(file) {
	let src = file.url;
	if (!src) {
		src = await new Promise(resolve => {
			const reader = new FileReader();
			reader.readAsDataURL(file.originFileObj);
			reader.onload = () => resolve(reader.result);
		});
	}
	const image = new Image();
	image.src = src;
	const imgWindow = window.open(src);
	imgWindow.document.write(image.outerHTML);
};