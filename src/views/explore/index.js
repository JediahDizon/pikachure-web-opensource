import { useState, useContext } from "react";
import { gql, useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { Redirect } from "react-router-dom";

import { ContextLoading, ContextUser } from "src/components";

import Post from "./post";
import Component from "./component";
import "./style.css";
import _ from "lodash";

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
			lat
			lng
		}
	}
`;

const queryPosts = gql`
	query
	OpenInvites($ids: [String]) {
		openInvites(ids: $ids) {
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

const openInviteMarkers = gql`
	query
	OpenInviteMarkers($lat: Float, $lng: Float, $radius: Float) {
		openInviteMarkers(lat: $lat, lng: $lng, radius: $radius) {
			id
			lat
			lng
			host {
				id
				name
				tag
				picture
			}
		}
	}
`;

const queryPlaces = gql`
 query places($lat: Float!, $lng: Float!, $radius: Float!) {
    places(lat: $lat, lng: $lng, radius: $radius) {
			id
			businessStatus
			lat
			lng
			icon
			name
			photos
    }
  }
`;

const querySearchUsers = gql`
	query searchUsers($name: String) {
		searchUsers(name: $name) {
			id
			tag
			picture
		}
	}
`;

const mutationSavePost = gql`
	mutation
	savePost(
		$id: String
		$description: String
		$files: [Upload]
		$gallery: [String]
		$coverFiles: [Upload]
		$cover: [String]
		$guests: [String]
		$lng: Float
		$lat: Float
		$place: String
		$country: String
		$city: String
		$region: String
		$datePosted: String
		$isVisible: Boolean
		$autoAccept: Boolean
		$byod: Boolean
	) {
		savePost(
			id: $id
			description: $description
			files: $files
			gallery: $gallery
			coverFiles: $coverFiles
			cover: $cover
			guests: $guests
			lng: $lng
			lat: $lat
			place: $place
			country: $country
			city: $city
			region: $region
			datePosted: $datePosted
			isVisible: $isVisible
			autoAccept: $autoAccept
			byod: $byod
		) {
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
				description
				dateCreated
				user {
					id
					name
					tag
				}
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

const mutationDeletePost = gql`
	mutation
	deletePost(
		$id: String!
	) {
		deletePost(id: $id) {
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
				description
				dateCreated
				user {
					id
					name
					tag
				}
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

const mutationSaveComment = gql`
	mutation
	saveComment($id: String, $description: String!, $post: String!) {
		saveComment(id: $id, description: $description, post: $post) {
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
	}
`;

const mutationDeleteComment = gql`
	mutation
	deleteComment($id: String!, $post: String!) {
		deleteComment(id: $id, post: $post) {
			id
		}
	}
`;

const mutationSavePostPhoto = gql`
	
	mutation
	savePostPhoto($files: [Upload], $id: String!, $gallery: [String]) {
		savePostPhoto(files: $files, id: $id, gallery: $gallery) {
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
				description
				dateCreated
				user {
					id
					name
					tag
				}
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

const mutationLeavePost = gql`
	mutation
	leavePost($id: String!) {
		leavePost(id: $id) {
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
				description
				dateCreated
				user {
					id
					name
					tag
				}
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

const mutationJoinPost = gql`
	mutation
	joinPost($id: String!) {
		joinPost(id: $id) {
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
				description
				dateCreated
				user {
					id
					name
					tag
				}
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

const mutationSaveUser = gql`
	mutation
	saveUser($lat: Float, $lng: Float) {
		saveUser(lat: $lat, lng: $lng) {
			id
			lat
			lng
		}
	}
`;

function Explore(props) {
	
	const { data: queryUserData, loading, error, refetch } = useQuery(queryUser, { fetchPolicy: "no-cache" });
	const { data: queryPostsData, loading: queryPostsLoading, error: queryPostsError, refetch: queryPostRefetch } = useQuery(queryPosts, { fetchPolicy: "cache-and-network" });
	const { data: queryOpenInviteMarkersData, loading: queryOpenInviteMarkersLoading, error: queryOpenInviteMarkersError, refetch: queryOpenInviteMarkersRefetch } = useQuery(openInviteMarkers);
	const [queryPlacesRefetch, { data: queryPlacesData, loading: queryPlacesLoading, error: queryPlacesError }] = useLazyQuery(queryPlaces);
	const [querySearchUserRefetch, { data: querySearchUsersData, loading: querySearchUsersLoading, error: querySearchUsersError }] = useLazyQuery(querySearchUsers);

	const [savePost, { data: mutationSavePostData, loading: mutationSavePostsLoading, error: mutationSavePostsError }] = useMutation(mutationSavePost, { fetchPolicy: "no-cache", refetchQueries: [queryPosts] });
	const [deletePost, { data: mutationDeletePostData, loading: mutationDeletePostsLoading, error: mutationDeletePostsError }] = useMutation(mutationDeletePost, { refetchQueries: [queryPosts] });
	const [saveComment, { data: mutationSaveCommentPostData, loading: mutationSaveCommentLoading, error: mutationSaveCommentPostsError }] = useMutation(mutationSaveComment, { refetchQueries: [queryPosts] });
	const [deleteComment, { data: mutationDeleteCommentPostData, loading: mutationDeleteCommentLoading, error: mutationDeleteCommentPostsError }] = useMutation(mutationDeleteComment, { refetchQueries: [queryPosts] });
	const [savePostPhoto, { data: mutationSavePostPhotoData, loading: mutationSavePostPhotoLoading, error: mutationSavePostPhotoError }] = useMutation(mutationSavePostPhoto, { fetchPolicy: "no-cache", refetchQueries: [queryPosts] });
	const [saveUser, { data: mutationSaveUserData, loading: mutationSaveUserLoading, error: mutationSaveUserError }] = useMutation(mutationSaveUser, { fetchPolicy: "no-cache", refetchQueries: [queryUser] });

	const [leavePost, { data: mutationLeavePostData, loading: mutationLeavePostLoading, error: mutationLeavePostError }] = useMutation(mutationLeavePost, { refetchQueries: [queryPosts] });
	const [joinPost, { data: mutationJoinPostData, loading: mutationJoinPostLoading, error: mutationJoinPostError }] = useMutation(mutationJoinPost, { refetchQueries: [queryPosts] });

	// Redirect if the user is not logged in
	const [user] = useContext(ContextUser);
	if(_.isEmpty(user)) return <Redirect to="/" />;

  return (
		<ContextLoading.Provider value={{ postsLoading: queryPostsLoading, saveLoading: mutationSavePostsLoading, saveCommentLoading: mutationSaveCommentLoading, deleteCommentLoading: mutationDeleteCommentLoading, openInviteMarkersLoading: queryOpenInviteMarkersLoading, placesLoading: queryPlacesLoading, searchUsersLoading: querySearchUsersLoading, savePostPhotoLoading: mutationSavePostPhotoLoading, leavePostLoading: mutationLeavePostLoading, joinPostLoading: mutationJoinPostLoading, saveUserLoadin: mutationSaveUserLoading }}>
			<Component
				{...props}
				activeUser={user}
				user={queryUserData?.user}
				userRefetch={refetch}
				saveUser={async user => await saveUser({ variables: user })}

				posts={queryPostsData?.openInvites}
				error={queryPostsError}
				onSave={async post => await savePost({ variables: { 
					...post, 
					cover: !_.isNil(post.cover) ? _.map(post.cover, "name") : undefined, 
					gallery: !_.isNil(post.gallery) ? _.map(post.gallery, "name") : undefined, 
					guests: !_.isNil(post.guests) ? _.map(post.guests, "id") : undefined,
					place: post.place?.id
				}})}
				onDelete={async id => await deletePost({ variables: { id } })}
				postRefetch={queryPostRefetch}
				onLeavePost={async id => await leavePost({ variables: { id }})}
				onJoinPost={async id => await joinPost({ variables: { id }})}

				openInviteMarkers={queryOpenInviteMarkersData?.openInviteMarkers}
				openInviteMarkersRefetch={queryOpenInviteMarkersRefetch}

				onComment={async (comment, post) => await saveComment({ variables: { id: comment.id, description: comment.description, post }})}
				onCommentDelete={async (id, post) => await deleteComment({ variables: { id, post }})}

				places={queryPlacesData?.places}
				onSearchPlaces={async location => await queryPlacesRefetch({ variables: location })}
				searchUsers={querySearchUsersData?.searchUsers}
				onSearchUsers={async name => await querySearchUserRefetch({ variables: { name }})}

				savePostPhoto={async post => await savePostPhoto({ variables: { 
					id: post.id, 
					gallery: _.map(post.gallery, "name"), 
					files: post.files,
					cover: !_.isNil(post.cover) ? _.map(post.cover, "name") : undefined
				}})}
			/>
		</ContextLoading.Provider>
  );
}

export default Explore;