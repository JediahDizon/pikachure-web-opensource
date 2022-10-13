import { useState, useContext } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Redirect } from "react-router";
import jwt from "jwt-decode";
import _ from "lodash";

import { Pikachure } from "src/services";
import { ContextUser, ContextLoading } from "src/components";
import Component from "./component";


const queryGetPost = gql`
	query post($id: String!) {
		post(id: $id) {
			id
			host {
				id
				name
				tag
				picture
			}
			description
			place {
				id
				lat
				lng
				photos
				name
				businessStatus
			}
			cover {
				id
				name
				dateCreated
				note
				exif
				size
				type
				owner {
					id
					name
					tag
				}
				note
				exif
			}
			gallery {
				id
				name
				dateCreated
				note
				exif
				size
				type
				owner {
					id
					name
					tag
				}
				note
				exif
			}
			guests {
				id
				name
				tag
				picture
			}
			comments {
				id
				user {
					id
					name
					tag
				}
				description
				dateCreated
				dateModified
			}
			dateCreated
			dateModified
			datePosted
			isVisible
			autoAccept
			byod

			# Geo
			lat
			lng
		}
	}
`;

const mutationLogin = gql`
	mutation
	saveUser(
		$ip: String
		$city: String
		$state: String
		$country: String
		$lat: Float
		$lng: Float
	) {
		saveUser(
			ip: $ip
			city: $city 
			state: $state 
			country: $country 
			lat: $lat 
			lng: $lng 
		) {
			id
			name
			email
			tag
			layout
			termsAgreed
		}
	}
`;

function Root(props) {
	const { data: queryPostData, loading, error, refetch } = useQuery(queryGetPost, { fetchPolicy: "no-cache", variables: { id: "vd6lCEa4BEVuksEvT2P3" }});
	const [saveUser, { data, loading: saveUserLoading, error: saveUserError }] = useMutation(mutationLogin, { fetchPolicy: "no-cache", awaitRefetchQueries: true });
	const [internalLoading, setInternalLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	// Redirect if the user is already logged in
	const [user, setUser] = useContext(ContextUser);
	if(!_.isEmpty(user)) return window.scrollTo(0, 0) || <Redirect to="/explore" />;

	const onLogin = async function(user) {
		if(_.isEmpty(user)) {
			// Guest Login
			setInternalLoading(true);
			user = await (await fetch(`${Pikachure.TOKEN_ENDPOINT}`)).json();
		} else {
			setGoogleLoading(true);
		}
		
		// Get the user IP to filter post list by location
		// const userLocation = await fetch("https://geolocation-db.com/json/").then(res => res.json()).catch(error => ({}));
		// const profile = {};
		// profile.ip = userLocation.IPv4;
		// profile.city = userLocation.city;
		// profile.state = userLocation.state;
		// profile.country = userLocation.country_code;
		// profile.lat = userLocation.latitude;
		// profile.lng = userLocation.longitude;
		
		// Set JWT for auto-login
		await localStorage.setItem("token", user.tokenId);
		// await saveUser({ variables: profile });
		await saveUser({ variables: user });
		
		// Set User to global store
		const activeUser = jwt(user.tokenId, { complete: true });
		setUser({ ...activeUser, id: activeUser.sub });
		setInternalLoading(false);
		setGoogleLoading(false);
	};

	const onError = async function(error) {
		console.error(error);
		await fetch(`${Pikachure.URL}/error`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(error)
		});
	}
	
	return (
		<ContextLoading.Provider value={{ userLoading: loading, postLoading: loading, internalLoading, googleLoading }}>
			<Component onLogin={onLogin} onError={onError} user={user} loginError={error} {...props} post={queryPostData?.post} />
		</ContextLoading.Provider>
	);
}

export default Root;