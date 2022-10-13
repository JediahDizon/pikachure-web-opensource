import { useRef, useState, useEffect, useContext } from "react";

import GoogleMapReact from "google-map-react";
import Plx from "react-plx";
import { Link } from "react-router-dom";
import { Typography, Row, Col, Button, Card, Modal, Collapse, Tooltip } from "antd";
import { CloseOutlined, TabletFilled, AppstoreFilled, CrownFilled, SearchOutlined } from "@ant-design/icons";
import Supercluster from "supercluster";
import { Marker } from "react-mapbox-gl";
import _ from "lodash";

import { Post, PostList, OpenInviteCreate, Map, PostCreate, PostMarker, ContextSelectedPost } from "src/components";

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

export default function Explore(props) {
	// Workaround for loading open invites refetch, as it does not updated `loading` state when refetching 
	const [openInviteMarkersLoading, setOpenInviteMarkersLoading] = useState(false);

	const [displayType, setDisplayType] = useState(_.isNumber(props.user?.layout) ? props.user?.layout : 0);
	const [openInviteCreateModal, setOpenInviteCreateModal]  = useState(false);
	const [openInviteEditModal, setOpenInviteEditModal] = useState(false);
	const [openInvitePostModal, setOpenInvitePostModal] = useState(false);
	const [mentionList, setMentionList] = useState([]);
	const [selectedPost, setSelectedPost] = useContext(ContextSelectedPost);
	const [zoom, setZoom] = useState(8);
	const [center, setCenter] = useState({});
	const centerRef = useRef(); // useEffect will use this variable on unmount instead of the `center` as the effect runs with outdated values
	const [selectedCollapse, setSelectedCollapse] = useState(!_.isEmpty(selectedPost));
	const {
		user, activeUser,
		posts, loading, 
		places, 
		searchUsers,
		openInviteMarkers
	} = props;

	
	useEffect(() => {
		props.userRefetch({ variables: { tag: props.match.params.tag }});
	}, [props.match.params.tag]);
	
	useEffect(() => {
		setDisplayType(props.user?.layout); // Since we use a Lazy Query, user may not exist yet for Display Type to get initiated wit hthe right value
	}, [user?.layout]);

	useEffect(() => {
		centerRef.current = center;
	}, [center])

	useEffect(() => {
		return async () => {
			const { lat, lng } = centerRef.current;
			// Save last map location
			if(lat && lng) await props.saveUser({ lat, lng });
		};
	}, []);

	// Cluster the map markers based on zoom value
	const clusterMarkers = new Supercluster({
		minZoom: 0,
		maxZoom: 20,
		radius: 70,
		extent: 512,
    map: props => ({ sum: 1, ids: [props.post.id] }),
    reduce: (accumulated, props) => { 
			accumulated.ids = _.concat(accumulated.ids, props.ids);
			accumulated.sum += props.sum;
		}
	});
	clusterMarkers.load(_.map(openInviteMarkers, post =>  ({
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [post.lng, post.lat] },
		"properties": { post }
  })));
	const markers = clusterMarkers.getClusters([-180, -85, 180, 85], zoom);
	
	// Based on permissions, pass functions for the Post to render
	const onPostClick = post => setSelectedCollapse(true) || setSelectedPost(post) || document.getElementById("explore-content-card").scrollIntoView({ behavior: "smooth" });
	const onPostDelete = async id => await props.onDelete(id);
	const onPostEdit = async post => {
		await props.onSearchPlaces({ lat: post.place?.lat || post.lat, lng: post.place?.lng || post.lng, radius: zoomDistanceMapping[zoom] }); 
		setOpenInviteEditModal(post);
	};
	const onPublish = async post => setSelectedCollapse(true) || setSelectedPost(post) || setOpenInvitePostModal(true);
	const onLeavePost = async id => await props.onLeavePost(id);
	const onJoinPost = async id => await props.onJoinPost(id);
	const onSavePostPhoto = async post => await props.savePostPhoto(post);
	const onComment = async (comment, post) => await props.onComment(comment, post);
	const onAddOpenInvite = () => setOpenInviteCreateModal(true);

	// Props to <Post /> depending on whether it is an open invite or a post
	const getPostProps = post => ({
		guestVisible: true, // Make guests visible by default on Explore page
		onPublish: activeUser && activeUser.sub !== "demo@pikachure-server.online" && (post.host?.id === activeUser?.sub) && onPublish,
		onEdit: activeUser && activeUser.sub !== "demo@pikachure-server.online" && (post.host?.id === activeUser?.sub) && onPostEdit,
		onDelete: activeUser && activeUser.sub !== "demo@pikachure-server.online" && (post.host?.id === activeUser?.sub) && onPostDelete,
		onLeave: activeUser && activeUser.sub !== "demo@pikachure-server.online" && (_.indexOf(_.map(post.guests, "id"), activeUser.sub) > -1) && onLeavePost,
		onJoin: activeUser && activeUser.sub !== "demo@pikachure-server.online" && post.host.id !== activeUser.sub && (_.indexOf(_.map(post.guests, "id"), activeUser.sub) === -1) && onJoinPost,
		onComment: activeUser && activeUser.sub !== "demo@pikachure-server.online" && onComment,
		onCommentsClick: async id => document.documentElement.scrollIntoView() || props.history.push(`/comments/${id}`), // Fix the Parallax rerender issue
		onCommentDelete: async (comment, post) => await props.onCommentDelete(comment, post),
		savePostPhoto: activeUser && activeUser.sub !== "demo@pikachure-server.online" && (_.indexOf(_(post.guests).concat(post.host).map("id").value(), activeUser.sub) > -1) && onSavePostPhoto,
		onClickProfile: async tag => props.history.push(`/profile/${tag}`),
		refresh: () => props.postRefetch()
	});

	// Selecting a post showcases it to the top. It has to come from the `posts` list and not from the state as it is not updated when data reloads
	const postToDisplay = _.find(posts, { id: selectedPost?.id });
	
	return (
		<div id="explore-container">
			<Row className="header" justify="space-between" align="middle">
				<Col>
					<Link to="/"><Typography.Title style={{ margin: 0, color: "var(--ant-primary-color)" }}>Pikachure</Typography.Title></Link>
				</Col>
				<Col>
					<Link to="/profile"><Button icon={<CrownFilled style={{ color: "var(--ant-primary-color)" }} />}>Profile</Button></Link>
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
				<Row justify="center">
					<Col span={24}>
						<div id="explore-map-container">
							{
								user?.lng && user?.lat && (
									<Map
										style="mapbox://styles/mapbox/outdoors-v11"
										containerStyle={{
											height: "100%",
											width: "100%"
										}}
										center={[center?.lng || user?.lng, center?.lat || user?.lat]}
										onZoomEnd={map => setCenter(map.getCenter()) || setZoom(Math.trunc(map.getZoom()))}
										onDragEnd={map => {
											const { lat, lng } = map.getCenter();
											setCenter({ lat, lng });
											map.easeTo({ center: [lng, lat] });
											
											// Set zoom value for search places
											const zoom = Math.trunc(map.getZoom());
											setZoom(zoom);
										}}
									>
										{ 
											_.map(markers, marker => {
												const { geometry: { coordinates }, properties, post } = marker;
												return (
													<Marker coordinates={[coordinates[0], coordinates[1]]}>
														<PostMarker
															key={`${coordinates[0]}${coordinates[1]}`}
															marker={marker}
															onClick={async () => {
																if(_.isEmpty(marker.properties.ids)) {
																	await props.postRefetch({ ids: [marker.properties.post.id] });
																} else {
																	await props.postRefetch({ ids: marker.properties.ids });
																}
																document.getElementById("explore-content-card").scrollIntoView({ behavior: "smooth" });
																setSelectedCollapse(true);
																setSelectedPost();
															}}
														/>
													</Marker>
												);
											})
										}
									</Map> 
								)
							}

							{/*<GoogleMapReact
								id="explore-map"
								bootstrapURLKeys={{ 
									key: "AIzaSyBBcToE4P-S9EF2A6pS3Ey-4tGj9SRkN54",
									libraries: ["places", "visualization"]
								}}
								center={[user?.lat, user?.lng]}
								zoom={zoom}
								options={{
									disableDefaultUI: true
								}}
								onBoundsChange={(center, zoom) => {
									setZoom(zoom);
									// Get the radius from the zoom value
									const searchRadius = zoomDistanceMapping[getZoomDistanceMapping(zoom)];

									clearTimeout(timeoutCode);
									timeoutCode = setTimeout(async () => props.openInviteMarkersRefetch({ lat: center[0], lng: center[1], radius: searchRadius }), 1000);
								}}
							>
								{ 
									_.map(markers, marker => {
										const { geometry: { coordinates }, properties, post } = marker;
										return (
											<PostMarker
												key={`${coordinates[0]}${coordinates[1]}`}
												lat={coordinates[1]} lng={coordinates[0]}
												marker={marker}
												onClick={async () => {
													if(_.isEmpty(marker.properties.ids)) {
														await props.postRefetch({ ids: [marker.properties.post.id] });
													} else {
														await props.postRefetch({ ids: marker.properties.ids });
													}
													document.getElementById("explore-content-card").scrollIntoView({ behavior: "smooth" });
													setSelectedCollapse(true);
													setSelectedPost();
												}}
											/>
										);
									})
								}
							</GoogleMapReact>*/}
						</div>

						{
							_.isFunction(props.openInviteMarkersRefetch) && (
								<div style={{ 
									fontSize: 40, color: "var(--ant-primary-color)",
									position: "absolute",
									top: "20px",
									left: "50%",
									transform: "translateX(-50%)",
									zIndex: 10
								}}>
									{
										_.isNumber(zoom) && (
											<Button
												loading={openInviteMarkersLoading}
												icon={<SearchOutlined />}
												onClick={async () => {
													try {
														setOpenInviteMarkersLoading(true);
														await props.openInviteMarkersRefetch({ lat: center.lat || user?.lat, lng: center.lng || user?.lat, radius: zoomDistanceMapping[getZoomDistanceMapping(zoom)] });
													} catch(error) {
														console.error({ error });
													} finally {
														setOpenInviteMarkersLoading(false);
													}
												}}
											>
												Open Invites
											</Button>
										)
									}
								</div>
							)
						}
					</Col>
				</Row>
			</Plx>

			<Card bordered={false} id="explore-content-card" style={{ marginTop: "min(calc(var(--vh, 1vh) * 100) - 135px, 576px)"  /* For the PLX library */ }}>
				<div id="explore-content-container">
					{/* <Typography.Text>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</Typography.Text> */}

					<Row justify="space-between" align="middle">
						<Col className="button-group">
							<Button type={displayType === 0 ? "primary" : "default"} onClick={() => setDisplayType(0)} size="large" icon={<AppstoreFilled />} />
							<Button type={displayType === 1 ? "primary" : "default"} onClick={() => setDisplayType(1)} size="large" icon={<TabletFilled />} />
						</Col>
						<Col>
							<Typography.Text>Open Invites</Typography.Text>
						</Col>
						<Col>
							<Button size="large" shape="circle" icon={<CloseOutlined />} onClick={() => setSelectedCollapse() || setTimeout(setSelectedPost, 500)} style={{ opacity: displayType === 0 && postToDisplay && selectedCollapse ? 1 : 0, pointerEvents: displayType === 0 && postToDisplay && selectedCollapse ? undefined : "none" }} />
						</Col>
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
				
				<PostList
					posts={posts}
					displayType={displayType} 
					onClick={displayType === 0 && onPostClick}
					postProps={getPostProps}
					onAdd={activeUser.sub !== "demo@pikachure-server.online" && onAddOpenInvite}
				/>
			</Card>

			{/* Modal for creating new Open Invite */}
			<Modal
				visible={openInviteCreateModal}
				confirmLoading={loading}
				onCancel={() => setOpenInviteCreateModal(false)}
				// maskClosable={false}
				// keyboard={false}
				footer={null}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
			>
				<OpenInviteCreate
					values={{ lat: user?.lat, lng: user?.lng }}
					mentionList={mentionList}
					setMentionList={setMentionList}
					onDraft={() => setOpenInviteCreateModal(false)}
					onSave={async post => {
						const toSelect = await props.onSave(post);
						setOpenInviteCreateModal(false);
						setSelectedCollapse(true);
						setSelectedPost(toSelect.data.savePost);
					}}
					
					places={places}
					onSearchPlaces={async search => await props.onSearchPlaces(search)}

					searchUsers={searchUsers}
					onSearchUsers={async search => await props.onSearchUsers(search)}
				/>
			</Modal>

			
			{/* Modal for editing existing Open Invite */}
			<Modal
				visible={openInviteEditModal}
				confirmLoading={loading}
				onCancel={() => setOpenInviteEditModal(false)}
				// maskClosable={false}
				// keyboard={false}
				footer={null}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
			>
				<OpenInviteCreate
					values={openInviteEditModal}
					mentionList={mentionList}
					setMentionList={setMentionList}
					onDraft={() => setOpenInviteEditModal(false)}
					onSave={async post => {
						await props.onSave(post);
						setOpenInviteEditModal(false);
					}}

					places={places}
					onSearchPlaces={async search => await props.onSearchPlaces(search)}

					searchUsers={searchUsers}
					onSearchUsers={async search => await props.onSearchUsers(search)}
				/>
			</Modal>


			{/* Modal for publishing Open Invites */}
			<Modal
				visible={openInvitePostModal}
				onCancel={() => setOpenInvitePostModal(false)}
				// maskClosable={false}
				// keyboard={false}
				footer={null}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
			>
				<PostCreate
					values={{ ...selectedPost, lat: selectedPost?.lat || user?.lat, lng: selectedPost?.lng || user?.lng }}
					onDraft={() => setOpenInvitePostModal(false)}
					onSave={async post => {
						await props.onSave({ ...post, id: selectedPost?.id });
						setOpenInvitePostModal(false);
					}}
					
					places={places}
					onSearchPlaces={async search => await props.onSearchPlaces(search)}
				/>
			</Modal>
		</div>
	);
}