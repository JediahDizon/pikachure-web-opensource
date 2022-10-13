import { useContext } from "react";
import { gql, useMutation, useQuery, useApolloClient } from "@apollo/client";
import { Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import _ from "lodash";

import { Pikachure } from "src/services";
import { ContextUser, ContextLoading } from "src/components";
import Component from "./component";

const queryUser = gql`
	query
	User($tag: String) {
		user(tag: $tag) {
			id
			name
			email
			tag
			layout
			termsAgreed
		}
	}
`;

const mutationSaveSettings = gql`
	mutation
	saveUser($tag: String, $name: String, $layout: Int) {
		saveUser(tag: $tag, name: $name, layout: $layout) {
			id
			name
			email
			tag
			layout
			termsAgreed
		}
	}
`;

const mutationSendFeedback = gql`
	mutation
	sendFeedback($value: Int, $description: String) {
		sendFeedback(value: $value, description: $description) {
			id
			value
			description
			user {
				id
			}
		}
	}
`;

const mutationDisableUser = gql`
	mutation
	disableUser {
		disableUser {
			id
			disabled
		}
	}
`;

const mutationConnectUser = gql`
	mutation
	connectUser($tokenId: String!) {
		connectUser(tokenId: $tokenId) {
			id
		}
	}
`;

const mutationCreateUser = gql`
	mutation
	saveUser($ip: String, $city: String, $state: String, $country: String, $lat: Float, $lng: Float) {
		saveUser(ip: $ip, city: $city , state: $state , country: $country , lat: $lat , lng: $lng) {
			id
			name
			email
			tag
			layout
			termsAgreed
		}
	}
`;


function Settings(props) {
	const { data: queryUserData, loading: queryUserLoading, error: queryUserError, refetch: queryUserRefetch } = useQuery(queryUser, { fetchPolicy: "no-cache" });
	const [saveUser, { data, loading, error }] = useMutation(mutationSaveSettings, { fetchPolicy: "no-cache" });
	const [createUser, { data: mutationCreateUserData, loading: mutationCreateUserLoading, error: mutationCreateUserError }] = useMutation(mutationCreateUser, { fetchPolicy: "no-cache" });
	const [sendFeedback, { data: mutationSendFeedbackData, loading: mutationSendFeedbackLoading, error: mutationSendFeedbackError }] = useMutation(mutationSendFeedback, { fetchPolicy: "no-cache" });
	const [disableUser, { data: mutationDisableUserData, loading: mutationDisableUserLoading, error: mutationDisableUserError }] = useMutation(mutationDisableUser, { fetchPolicy: "no-cache" });
	const [connectUser, { data: mutationConnectUserData, loading: mutationConnectUserLoading, error: mutationConnectUserError }] = useMutation(mutationConnectUser, { fetchPolicy: "no-cache" });
	const history = useHistory(); 
	const apolloClient = useApolloClient(); // Used for logging out

	// Redirect if the user is not logged in
	const [user, setUser] = useContext(ContextUser);
	if(_.isEmpty(user)) return <Redirect to="/" />;

	const activeUser = { ...user, ...queryUserData?.user, ...data?.saveUser };
	
	return (
		<ContextLoading.Provider value={{ settingsLoading: loading, disableUserLoading: mutationDisableUserLoading, sendFeedbackLoading: mutationSendFeedbackLoading, connectUserLoading: mutationConnectUserLoading }}>
			<Component 
				history={history}
				apolloClient={apolloClient}
				
				user={activeUser} 
				setUser={setUser}
				saveUser={async user => await saveUser({ variables: user })}
				disableUser={disableUser}
				connectUser={async tokenId => {
					// Verify the token of the new user
					const newUser = await (await fetch(`${Pikachure.AUTH_TOKEN_ENDPOINT}/?tokenId=${tokenId}`)).json();
					if(_.isEmpty(newUser)) throw new Error("Invalid token");

					await connectUser({ variables: { tokenId }});
					await localStorage.setItem("token", tokenId);
					await createUser(newUser);
					
					window.location.reload();
				}}

				sendFeedback={async feedback => await sendFeedback({ variables: feedback })}

				{...props} 
			/>
		</ContextLoading.Provider>
	);
}

export default Settings;