import { useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import Plx from "react-plx";
import GoogleLogin from "react-google-login";
import { Card, Typography, Button, Row, Col, List, Modal, Input, Rate } from "antd";
import Icon, { EnvironmentFilled, AppstoreFilled, CaretLeftOutlined, CaretRightOutlined, TabletFilled, FontColorsOutlined, CheckCircleFilled } from '@ant-design/icons';
import _ from "lodash";

import { ContextLoading, PrivacyPolicy, TermsAndConditions } from "src/components";
import "./style.css";

// For the Google Button
const GoogleIcon = props => <Icon component={() => getGoogleIcon()} {...props} />;

export default function Settings(props) {
	const modalRef = useRef(null);
	const { user } = props;
	const [modalVisible, setModalVisibility] = useState(false);
	const [name, setName] = useState();
	const [tag, setTag] = useState();
	const [ppModal, setPPModal] = useState(false);
	const [tsModal, setTSModal] = useState(false);
	const [feedbackModal, setFeedbackModal] = useState(false);
	const [feedback, setFeedback] = useState({});
	const { settingsLoading, connectUserLoading, sendFeedbackLoading } = useContext(ContextLoading);

	const settingKnobs = [
		{
			label: "Tag",
			hint: "Change your name tag",
			render: (
				<Input
					style={{ opacity: settingsLoading ? 0.33 : 1 }} addonBefore="@" placeholder={user.tag}
					value={!_.isNil(tag) ? tag : user.tag}
					onChange={event => setTag(_.split(`${event.target.value}`.trim().toLowerCase(), " ").join(""))}
					onBlur={async () => {
						const toSave = _.split(`${tag}`.trim().toLowerCase(), " ").join("");
						if(!_.isNil(toSave) && toSave !== user.tag) {
							await props.saveUser({ tag: toSave });
							setTag(null);
						}
					}}
				/>
			)
		},
		{
			label: "Name",
			hint: "Change your profile name",
			render: (
				<Input
					style={{ opacity: settingsLoading ? 0.33 : 1 }} addonBefore={<FontColorsOutlined />} placeholder={user.name}
					value={!_.isNil(name) ? name : user.name}
					onChange={event => setName(event.target.value)}
					onBlur={() => !_.isNil(name) && name !== user.name && props.saveUser({ name: `${name}`.trim() })}
				/>
			)
		},
		{
			label: "Layout",
			hint: "View posts in Compact or List format",
			render: (
				<Row>
					<Col className="button-group" style={{ opacity: settingsLoading ? 0.33 : 1, pointerEvents: settingsLoading ? "none" : undefined }}>
						<Button type={user.layout === 0 ? "primary" : "default"} icon={<AppstoreFilled />} onClick={() => props.saveUser({ layout: 0 })} />
						<Button type={user.layout === 1 ? "primary" : "default"} icon={<TabletFilled />} onClick={() => props.saveUser({ layout: 1 })} />
					</Col>
				</Row>
			)
		},
		{
			label: "About",
			hint: "News, updates, and contacts",
			render: <Button disabled={true} onClick={() => setModalVisibility(true)} icon={<CaretRightOutlined />}>Work in Progress</Button>
		},
		{
			label: "Feedback",
			hint: "Tell us your thoughts",
			render: <Rate value={6} onChange={value => setFeedback({ ...feedback, value }) || setFeedbackModal(true)} />
		},
		// {
		// 	label: "Disable Account",
		// 	hint: "Re-enable account by logging back in",
		// 	render: (
		// 		<Button 
		// 			loading={disableUserLoading}
		// 			type="danger"
		// 			onClick={() => Modal.confirm({
		// 				title: "Disable Account",
		// 				content: "Remove your presence and logout. You can recover your account by logging in again. Continue to logout?",
		// 				icon: null,
		// 				okText: "Disable Account",
		// 				cancelText: "Cancel",
		// 				onOk: async () => {
		// 					await props.disableUser();

		// 					// Clear token
		// 					await localStorage.removeItem("token");

		// 					// Clear cache
		// 					await props.apolloClient.cache.reset();

		// 					// Clear Providers
		// 					props.setUser();
		// 					props.history.replace("/");
		// 				}
		// 			})}
		// 		>
		// 			Disable and Logout
		// 		</Button>
		// 	)
		// }
	];

	if (_.size(_.split(user.sub, "_")) > 1) { // ID with underscore are anonymous
		// Anonymous users do not get to logout, instead, they can connect their account to Google or Apple instead
		settingKnobs.push({
			label: "Sign In",
			hint: "You are logged in as a guest. Connect your account to prevent loss of access",
			render: (
				<GoogleLogin
					clientId=""
					render={props => <Button disabled={connectUserLoading} loading={connectUserLoading} icon={<GoogleIcon />} size="large" {...props}>{"Connect with Google"}</Button>}
					onSuccess={async response => await props.connectUser(response.tokenId)}
					onFailure={async response => await props.onError(response)}
					cookiePolicy="single_host_origin"
				/>
			)
		});
	} else {
		settingKnobs.push({
			label: "Logout",
			hint: "Go to Login page",
			render: (
				<Button onClick={() => {
					Modal.confirm({
						title: "Logout",
						content: "You will have to sign-in again. Continue to logout?",
						icon: null,
						okText: "Logout",
						cancelText: "Cancel",
						onOk: async () => {
							// Clear token
							await localStorage.setItem("token", "");

							// Clear cache
							await props.apolloClient.cache.reset();

							// Clear Providers
							props.setUser();
							props.history.replace("/");
						}
					})
				}}>
					Logout
				</Button>
			)
		});
	}

	return (
		<div id="settings-container">
			<Row className="header" justify="space-between" align="middle">
				<Col>
					<Link to="/"><Typography.Title style={{ margin: 0, color: "var(--ant-primary-color)" }}>Pikachure</Typography.Title></Link>
				</Col>
				<Col>
					<Button shape="circle" icon={<CaretLeftOutlined />} style={{ marginRight: "10px" }} onClick={() => props.history.goBack()} />
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
				<Row justify="center">
					<Col span={24}>
						<Card bordered={false} id="settings-cover-card">
							<div id="settings-cover" />

							<div id="settings-cover-content">
								<Typography.Title
									style={{ color: "white", margin: 0 }}
								>
									Settings
								</Typography.Title>
							</div>
						</Card>
					</Col>
				</Row>
			</Plx>

			<Card bordered={false} id="settings-content-card" style={{ marginTop: "min(calc(100vw * 0.80 - 10px), calc(576px * 0.80 - 10px))" /* For the PLX library */ }}>
				<div id="settings-content-container">
					<List
						id="settings-list"
						dataSource={settingKnobs}
						renderItem={setting => (
							<List.Item>
								<List.Item.Meta
									title={setting.label}
									description={setting.hint}
								/>
								<div>{setting.render}</div>
							</List.Item>
						)}
					/>
				</div>
			</Card>

			<Row justify="end" align="middle" style={{ padding: "20px" }}>
				<Col className="button-group">
					<Button onClick={() => setPPModal(true)}>Privacy Policy</Button>
					<Button onClick={() => setTSModal(true)}>Terms and Conditions</Button>
				</Col>
			</Row>

			<Modal
				visible={feedbackModal}
				bodyStyle={{ padding: 0 }}
				footer={null}
			>
				<Row id="settings-feedback-container" align="middle" justify="space-around">
					<Col>
						<Rate value={feedback.value} onChange={value => setFeedback({ ...feedback, value })} />
					</Col>
					<Col span={24} style={{ marginTop: "20px" }}>
						<Input.TextArea
							onBlur={event => setFeedback({ ...feedback, description: event.target.value })}
							defaultValue={feedback.description}
							placeholder="Feedback"
						/>
					</Col>
					<Col span={24} className="button-group" style={{ marginTop: "20px", textAlign: "right" }}>
						<Button onClick={() => setFeedbackModal(false)}>Close</Button>
						<Button loading={sendFeedbackLoading} disabled={feedback.value === 0 && _.isEmpty(feedback.description)} type="primary" onClick={async () => { await props.sendFeedback(feedback) || setFeedback({}); setFeedbackModal(false); }}>Send</Button>
					</Col>
				</Row>
			</Modal>


			<Modal
				visible={ppModal}
				bodyStyle={{ padding: 0 }}
				footer={<Button onClick={() => setPPModal(false)}>Close</Button>}
			>
				<div id="pp-container">
					<PrivacyPolicy />
				</div>
			</Modal>

			<Modal
				visible={tsModal}
				bodyStyle={{ padding: 0 }}
				footer={<Button onClick={() => setTSModal(false)}>Close</Button>}
			>
				<div id="ts-container">
					<TermsAndConditions />
				</div>
			</Modal>
		</div>
	);
}

function getGoogleIcon() {
	return (
		<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
			<g fill="#000" fillRule="evenodd">
				<path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"></path>
				<path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"></path>
				<path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"></path>
				<path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"></path>
				<path fill="none" d="M0 0h18v18H0z"></path>
			</g>
		</svg>
	);
}