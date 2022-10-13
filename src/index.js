import React, { useState } from "react";
import ReactDOM from "react-dom";

// Libraries
import { HashRouter, BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import { Pikachure } from "src/services";

// Styles
import { ConfigProvider } from "antd";
import "antd/dist/antd.variable.min.css";
import "./style.css";
import "mapbox-gl/dist/mapbox-gl.css";

// Pages
import { Root, Explore, Comments, Home, Settings } from "src/views";

// Components
import { ContextUser, ContextSelectedPost } from "src/components";

// Apollo Setup
import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	ApolloProvider,
	HttpLink,
	defaultDataIdFromObject
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { createUploadLink } from "apollo-upload-client";

const authLink = setContext(async (_, { headers }) => {
	try {
		let token = await localStorage.getItem("token");
		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : "",
			}
		}
	} catch(error) {
		console.error(error);
	}
});

const errorLink = onError(({ graphQLErrors, networkError, forward, operation }) => {
  if (graphQLErrors) console.error(graphQLErrors);
  if (networkError) console.warn(networkError);
  forward(operation);
});

const httpLink = new HttpLink({
	uri: `${Pikachure.URL}/graphql`
});

const uploadLink = createUploadLink({
	uri: `${Pikachure.URL}/graphql`
 });

const client = new ApolloClient({
  uri: httpLink,
	defaultOptions: {
		//fetchPolicy: "no-cache"
	},
	
	/**
	 * Apollo Client can only have 1 terminating Apollo Link that sends the GraphQL requests; 
	 * if one such as HttpLink is already setup, remove it.
	 */
	link: ApolloLink.from([errorLink, authLink, uploadLink /* , httpLink */]),
  cache: new InMemoryCache({
		dataIdFromObject: (object) => {
			// return object.id;
			if (object.id) {
					// eslint-disable-next-line no-underscore-dangle
					return `${object.__typename}-${object.id}`;
			}
			if(object.email) {
				return `${object.__typename}-${object.email}`;
			}
			if (object.cursor) {
					// Cursor edge instead, fixes invalid duplicate
					// eslint-disable-next-line no-underscore-dangle
					return `${object.__typename}-${object.cursor}`;
			}
			// Use a fallback to default handling if neither id nor cursor
			return defaultDataIdFromObject(object);
		}
	})
});

// This function lets us use async/await syntax before rendering React components
async function start() {
	const localToken = await localStorage.getItem("token");
	let activeUser;
	if(localToken) {
		try {
			// Check if token is valid
			const verifyRequest = await fetch(`${Pikachure.AUTH_TOKEN_ENDPOINT}/?tokenId=${localToken}`);
			if(verifyRequest.status !== 200) {
				await localStorage.removeItem("token");
			} else {
				activeUser = await verifyRequest.json();
				activeUser = { ...activeUser, id: activeUser.sub };
			}
		} catch(error) {
			console.error(error);
			await localStorage.removeItem("token");
		}
	}
	
	function Routes(props) {
		// Set the User Context from the JWT token in storage
		const [user, setUser] = useState(activeUser);
		const [selectedPost, setSelectedPost] = useState();

		ConfigProvider.config({
			theme: {
				primaryColor: "#fdc541",
				/**
				 * @primary-color: #1890ff; // primary color for all components
				 * @link-color: #1890ff; // link color
				 * @success-color: #52c41a; // success state color
				 * @warning-color: #faad14; // warning state color
				 * @error-color: #f5222d; // error state color
				 * @font-size-base: 14px; // major text font size
				 * @heading-color: rgba(0, 0, 0, 0.85); // heading text color
				 * @text-color: rgba(0, 0, 0, 0.65); // major text color
				 * @text-color-secondary: rgba(0, 0, 0, 0.45); // secondary text color
				 * @disabled-color: rgba(0, 0, 0, 0.25); // disable state color
				 * @border-radius-base: 2px; // major border radius
				 * @border-color-base: #d9d9d9; // major border color
				 * @box-shadow-base: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
						0 9px 28px 8px rgba(0, 0, 0, 0.05); // major shadow for layers
				 */
			}
		});
		
		return (
			<ContextUser.Provider value={[user, setUser]}>
				<ContextSelectedPost.Provider value={[selectedPost, setSelectedPost]}>
					<HashRouter>
						<Switch>
							<Route exact path="/settings" component={Settings} />
							<Route exact path="/explore" component={Explore} />
							<Route path="/profile/:tag?" component={Home} />
							<Route path="/comments/:post" component={Comments} />
							<Route path="/" component={Root} />
						</Switch>
					</HashRouter>
				</ContextSelectedPost.Provider>
			</ContextUser.Provider>
		);
	}

	ReactDOM.render(
		<ApolloProvider client={client}>
			<ParallaxProvider>
				<Routes />
			</ParallaxProvider>
		</ApolloProvider>,
		document.getElementById("root")
	);

	
	// If you want to start measuring performance in your app, pass a function
	// to log results (for example: reportWebVitals(console.log))
	// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
	const reportWebVitals = onPerfEntry => {
		if (onPerfEntry && onPerfEntry instanceof Function) {
			import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
				getCLS(onPerfEntry);
				getFID(onPerfEntry);
				getFCP(onPerfEntry);
				getLCP(onPerfEntry);
				getTTFB(onPerfEntry);
			});
		}
	};

	reportWebVitals();
}

start();


