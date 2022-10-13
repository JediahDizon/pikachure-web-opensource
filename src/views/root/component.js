import { useState, useContext } from "react";
import GoogleLogin from "react-google-login";
import { Divider, Card, Row, Col, Modal, Button, Typography, Image } from "antd";
import Icon, { CheckCircleFilled, EnvironmentFilled, CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";
import _ from "lodash";

import "./style.css";
import { PrivacyPolicy, TermsAndConditions, Post, ContextLoading } from "src/components";

function Root(props) {
	const { googleLoading, internalLoading } = useContext(ContextLoading);
	const [ppModal, setPPModal] = useState(false);
	const [tsModal, setTSModal] = useState(false);
	const { user, loading, error } = props;

	const GoogleIcon = props => <Icon component={() => getGoogleIcon()} {...props} />;
	
	return (
		<>
			<div>
				<Row justify="space-between">
					<Col span={24} style={{ background: "white", borderBottom: "5px solid var(--ant-primary-color)" }}>
						<Row id="root-banner-container" justify="center" align="middle" style={{ maxWidth: "1024px", margin: "auto" }}>
							<Col xs={24} sm={12} style={{ textAlign: "right", paddingRight: "40px" }}>
								<Typography.Title style={{ color: "var(--ant-primary-color)" }}>Pikachure</Typography.Title>
								<Typography.Title level={3}>
									Photoshoot for everyone,<br /><EnvironmentFilled  style={{ color: "var(--ant-primary-color)", marginBottom: "20px" }} /> anywhere
								</Typography.Title>
								<Typography.Text>Simply mark the map</Typography.Text>
								<br />

								<Button
									icon={<CaretDownOutlined />}
									style={{ marginTop: "20px" }} 
									size="large"
									type="primary"
									onClick={() => document.getElementById("login-content").scrollIntoView({ behavior: "smooth" })}
								>
									Let's Go!
								</Button>
							</Col>

							<Col xs={24} sm={12} style={{ marginBottom: "40px", textAlign: "center" }}>
								<img alt="banner" src="/banner.png" style={{ width: "100%", maxWidth: "400px", padding: "20px" }} />
							</Col>
						</Row>
					</Col>
				</Row>
			</div>
			
			<div id="root-container">
				<Row justify="center" align="middle">
					<Col xs={24} sm={12} className="root-content-left">
						<Typography.Title style={{ color: "var(--ant-primary-color)" }}>Hello <EnvironmentFilled  style={{ color: "var(--ant-primary-color)", marginBottom: "20px" }} /> </Typography.Title>
						<Typography.Title level={4}>
							Take Pikachure with you on your next photo trip.
						</Typography.Title>
					</Col>
					<Col xs={24} sm={12}>
						<Image 
							src="https://lh3.googleusercontent.com/pw/AM-JKLXdj6HWwKRY4mXmO72fjy9XdtWwVw7Yd1F1G_jCxBiQvnMXuOIR3t5tqqXkaQGrjfDysovu0WV2t6_T7sqZKoKnK42iO35RRVFDXi90IeZ-DlWZi1uLzUP2x1dJ6Iqgi3-lUC43W9EWOTDgZPf5xk2SkQ=w518-h709-no" 
							preview={false} 
							style={{ borderRadius: "20px" }}
						/>
					</Col>
				</Row>
				<Row justify="center" align="middle" style={{ marginTop: "40px" }}>
					<Col xs={24} sm={12} className="root-content-left">
						<Typography.Title style={{ color: "var(--ant-primary-color)" }}>Open Invite</Typography.Title>
						<Typography.Title level={4}>
							Create and join open invites made by the community.
						</Typography.Title>
					</Col>
					<Col xs={24} sm={12}>
						<Image 
							src="https://lh3.googleusercontent.com/pw/AM-JKLVVW81i3UMWsWH2nuZRKaYcreb4-adRwp8pVFY204WeX2GWLHL86OD_5MfsWQ_1KWI3TA7l2s_sRQj9NCInybrQWSukI-nRl39Q9Vg63xODZCHCdd1Fgh0Sk7GKvTG3XwDf0b7BCWw7nAXoruermF4w1w=w877-h759-no" 
							preview={false} 
							style={{ borderRadius: "20px" }}
						/>
					</Col>
				</Row>
				<Row justify="center" align="middle" style={{ marginTop: "40px" }}>
					<Col xs={24} sm={12} className="root-content-left">
						<Typography.Title style={{ color: "var(--ant-primary-color)" }}>Collab</Typography.Title>
						<Typography.Title level={4}>
							Collaborate with every joinees and share photos, all in one space.
						</Typography.Title>
					</Col>
					<Col xs={24} sm={12}>
						<video style={{ borderRadius: "20px", width: "90%" }} autoPlay muted loop playsInline>
							<source src="/post.mp4" type="video/mp4" />
							Your browser does not support the video tag.
						</video>
						<video style={{ borderRadius: "20px", width: "100%", position: "relative", top: "-120px" }} autoPlay muted loop playsInline>
							<source src="/open-invite.mp4" type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					</Col>
				</Row>
			</div>

			<div id="login-container">
				{/* <Row justify="space-around" style={{ marginBottom: "20vh" }}>
					<Col span={24} style={{ textAlign: "center", marginBottom: "40px" }}>
						<Typography.Title style={{ color: "var(--ant-primary-color)" }}>Try It</Typography.Title>
						<Typography.Title level={4}>
							Check out this featured Post:
						</Typography.Title>
						<i>Buttons not functional</i>
					</Col>

					<Col xs={24}>
						<Card>
							<Post
								autoPlay
								loading={postLoading}
								post={post}
								user={{
									"iss": "https://pikachure-server.online",
									"iat": 1622943493,
									"exp": 1654479493,
									"aud": "pikachure.com",
									"sub": "demo@pikachure-server.online",
									"givenName": "Demo",
									"familyName": "Pikachure",
									"email": "support@pikachure.com"
								}}

								onPublish={() => {}}
								onEdit={() => {}}
								onDelete={() => {}}
								onComment={() => {}}
								onCommentDelete={() => {}}
								onCommentsClick={() => {}}
								savePostPhoto={() => {}}
								onClickProfile={() => {}}
							/>
						</Card>
					</Col>
				</Row> */}
				
				<Card id="login-content">
					<Row align="middle" justify="space-around">
						<Col className="button-group" style={{ margin: "20px" }}>
							<GoogleLogin
								clientId=""
								render={props => <Button loading={googleLoading} icon={!_.isEmpty(user) ? <CheckCircleFilled style={{ color: "green" }} /> : <GoogleIcon />} size="large" {...props}>{ _.isError(error) ? error.message : !_.isEmpty(user) ? `${user.name}` : "Sign in with Google" }</Button>}
								onSuccess={async response => await props.onLogin(response)}
								onFailure={async response => await props.onError(response)}
								cookiePolicy="single_host_origin"
							/>
							<Button
								loading={internalLoading}
								type="primary"
								size="large"
								icon={<CaretRightOutlined />}
								onClick={() => props.onLogin()}
							>
								Guest
							</Button>
						</Col>

						<Col style={{ margin: "20px", marginBottom: 0 }}>
							<Typography.Text>By logging in, you indicate that you have read and agreed to both</Typography.Text>
						</Col>

						<Col span={24} style={{ margin: "20px 0", marginBottom: "40px" }} className="button-group">
							<Button onClick={() => setPPModal(true)}>Privacy Policy</Button>
							<Button onClick={() => setTSModal(true)}>Terms and Conditions</Button>	
						</Col>

						<Divider style={{ margin: 0 }} />
						
						<Col span={24} style={{ textAlign: "center", margin: "20px" }}>
							<Typography.Text>Made with ❤️ by <a href="https://github.com/JediahDizon" target="_blank" rel="noreferrer"><b>Jediah Dizon</b></a></Typography.Text>
						</Col>
					</Row>
				</Card>

				<Modal
					visible={ppModal}
					bodyStyle={{ padding: 0 }}
					footer={<Button onClick={() => setPPModal(false)}>Close</Button>}
					closable={true}
				>
					<div id="pp-container">
						<PrivacyPolicy />
					</div>
				</Modal>

				<Modal
					visible={tsModal}
					bodyStyle={{ padding: 0 }}
					footer={<Button onClick={() => setTSModal(false)}>Close</Button>}
					closable={true}
				>
					<div id="ts-container">
						<TermsAndConditions />
					</div>
				</Modal>
			</div>
		</>
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

export default Root;


// Zb: {
// 	token_type: 'Bearer',
// 	access_token: 'ya29.a0ARrdaM_1XpH1nJvHfwzcuvQNLbIj9WSmWpDxsFKnyqo…j6AHYI4-zBLLxKqj8Hkmg1H1-xjDZbhenP9z4GBE5Kr3bE95R',
// 	scope: 'email profile https://www.googleapis.com/auth/user…//www.googleapis.com/auth/userinfo.profile openid',
// 	login_hint: 'AJDLj6JUa8yxXrhHdWRHIV0S13cAI1g469-INMlO-IEuaQ8DN_H8CLMrWzL-OhfQ1MWkB6Efqvj83Wc6iHunV9qJcWMuM4IG2Q',
// 	expires_in: 3599
// }
// accessToken: "ya29.a0ARrdaM_1XpH1nJvHfwzcuvQNLbIj9WSmWpDxsFKnyqo-NjsU5qyMvJHtjSmed18GHPJynJ1smNTjLJtaogtSw0OxkWDnC9qpZU06MNLdzhMj6AHYI4-zBLLxKqj8Hkmg1H1-xjDZbhenP9z4GBE5Kr3bE95R"
// googleId: "103765462722386574998"
// it: Nw {
// 	hT: '103765462722386574998',
// 	Se: 'Jediah Dizon',
// 	wU: 'Jediah',
// 	NS: 'Dizon',
// 	SJ: 'https://lh3.googleusercontent.com/a-/AOh14Gjpbkn6_-L43NSeuGhbfM8hWslyibGE_ZananJcY6M=s96-c'
// }
// profileObj: {
// 	googleId: '103765462722386574998',
// 	imageUrl: 'https://lh3.googleusercontent.com/a-/AOh14Gjpbkn6_-L43NSeuGhbfM8hWslyibGE_ZananJcY6M=s96-c',
// 	email: 'jediahjosuah@gmail.com',
// 	name: 'Jediah Dizon',
// 	givenName: 'Jediah'
// }
// tokenId: "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg1ODI4YzU5Mjg0YTY5YjU0YjI3NDgzZTQ4N2MzYmQ0NmNkMmEyYjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiODk5NTU2OTQ1NzUwLTVoazdwZTRodXAwcW9iaTBuOXYzbHEwZWZ2bGdjbzlnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiODk5NTU2OTQ1NzUwLTVoazdwZTRodXAwcW9iaTBuOXYzbHEwZWZ2bGdjbzlnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAzNzY1NDYyNzIyMzg2NTc0OTk4IiwiZW1haWwiOiJqZWRpYWhqb3N1YWhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJQMDVTeFQyUUJrODg2X0UtYm1kd1V3IiwibmFtZSI6IkplZGlhaCBEaXpvbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHanBia242Xy1MNDNOU2V1R2hiZk04aFdzbHlpYkdFX1phbmFuSmNZNk09czk2LWMiLCJnaXZlbl9uYW1lIjoiSmVkaWFoIiwiZmFtaWx5X25hbWUiOiJEaXpvbiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjM2MTQ2ODI4LCJleHAiOjE2MzYxNTA0MjgsImp0aSI6IjM3ZDdjZGI0N2RjZWY4ODBmYjkyMmY0YjZjMWMzYmIwMDY2ZWYxMDYifQ.NGOCFNYHOsfQpmhcj508duum19_LK0mz_M7aVtUzLtEMdx3NQL2iCBWQWP80JH1mFus-ud6k04pKsYtZWW43fiLWG-GErnapDzAWrp28jaWGD3a6FeYeq9A8ToY-2B1WAe6M86bcpvhQCbD-4MRKhUx1qIBK5hecqzffw2xjh-UC4YowP8QewJa3bfwkoG29BlkzkW1xIG0iyuZA0erwj3co3G7YzhuO1QK1o9w7FzA2wznU20Jq4jBkNhgvDNtj3U539AzGgqs3kvOnnUcAAmEyaF2PDPgUFqoMMLk8bOeloWTR-Vp2Pc4eZtNYbTj2-HYaW3a4SAKPI7n64UFL8w"
// tokenObj: {
// 	token_type: 'Bearer',
// 	access_token: 'ya29.a0ARrdaM_1XpH1nJvHfwzcuvQNLbIj9WSmWpDxsFKnyqo…j6AHYI4-zBLLxKqj8Hkmg1H1-xjDZbhenP9z4GBE5Kr3bE95R',
// 	scope: 'email profile https://www.googleapis.com/auth/user…//www.googleapis.com/auth/userinfo.profile openid',
// 	login_hint: 'AJDLj6JUa8yxXrhHdWRHIV0S13cAI1g469-INMlO-IEuaQ8DN_H8CLMrWzL-OhfQ1MWkB6Efqvj83Wc6iHunV9qJcWMuM4IG2Q',
// 	expires_in: 3599
// }
// wa: "103765462722386574998"