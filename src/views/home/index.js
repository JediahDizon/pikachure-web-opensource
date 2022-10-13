import { useContext } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { Redirect, useHistory } from "react-router-dom";
import _ from "lodash";

import { ContextLoading, ContextUser } from "src/components";

import Component from "./component";
import "./style.css";

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
			posts {
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
				dateCreated
				note
				exif
			}
			
			guests {
				id
				name
				tag
				picture
			}
			lat
			lng
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
	saveUser($tag: String, $layout: Int, $file: Upload, $cover: String) {
		saveUser(tag: $tag, layout: $layout, file: $file, cover: $cover) {
			id
			name
			email
			tag
			layout
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
			termsAgreed
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


function Home(props) {
	const [userRefetch, { data, loading, error }] = useLazyQuery(queryUser, { fetchPolicy: "cache-and-network" });
	const [savePost, { data: mutationSavePostData, loading: mutationSavePostsLoading, error: mutationSavePostsError }] = useMutation(mutationSavePost, { refetchQueries: [queryUser] });
	const [deletePost, { data: mutationDeletePostData, loading: mutationDeletePostsLoading, error: mutationDeletePostsError }] = useMutation(mutationDeletePost, { refetchQueries: [queryUser] });
	const [saveComment, { data: mutationSaveCommentPostData, loading: mutationSaveCommentLoading, error: mutationSaveCommentPostsError }] = useMutation(mutationSaveComment, { refetchQueries: [queryUser] });
	const [deleteComment, { data: mutationDeleteCommentPostData, loading: mutationDeleteCommentLoading, error: mutationDeleteCommentPostsError }] = useMutation(mutationDeleteComment, { refetchQueries: [queryUser] });
	const [savePostPhoto, { data: mutationSavePostPhotoData, loading: mutationSavePostPhotoLoading, error: mutationSavePostPhotoError }] = useMutation(mutationSavePostPhoto, { refetchQueries: [queryUser] });
	const [saveUser, { data: mutationSaveUserData, loading: mutationSaveUserLoading, error: mutationSaveUserError }] = useMutation(mutationSaveUser, { fetchPolicy: "no-cache", refetchQueries: [queryUser] });
	const [querySearchUserRefetch, { data: querySearchUsersData, loading: querySearchUsersLoading, error: querySearchUsersError }] = useLazyQuery(querySearchUsers);
	const [queryPlacesRefetch, { data: queryPlacesData, loading: queryPlacesLoading, error: queryPlacesError }] = useLazyQuery(queryPlaces, { fetchPolicy: "no-cache" });
	
	const [leavePost, { data: mutationLeavePostData, loading: mutationLeavePostLoading, error: mutationLeavePostError }] = useMutation(mutationLeavePost, { refetchQueries: [queryUser] });
	const [joinPost, { data: mutationJoinPostData, loading: mutationJoinPostLoading, error: mutationJoinPostError }] = useMutation(mutationJoinPost, { refetchQueries: [queryUser] });

	const history = useHistory(); 

	// Redirect if the user is not logged in
	const [user] = useContext(ContextUser);
	if(_.isEmpty(user)) return <Redirect to="/" />;

  return (
		<ContextLoading.Provider value={{ userLoading: loading, saveUserLoading: mutationSaveUserLoading, postsLoading: loading, saveLoading: mutationSavePostsLoading, saveCommentLoading: mutationSaveCommentLoading, deleteCommentLoading: mutationDeleteCommentLoading, savePostPhotoLoading: mutationSavePostPhotoLoading, leavePostLoading: mutationLeavePostLoading, joinPostLoading: mutationJoinPostLoading, placesLoading: queryPlacesLoading, searchUsersLoading: querySearchUsersLoading }}>
			<Component 
				{...props} 
				history={history}
				activeUser={user}

				error={error}
				posts={data?.user.posts}
        user={data?.user}
				saveUser={async user => await saveUser({ variables: user })}
				onSave={async post => await savePost({ variables: { 
					// ...DefaultValues.POST_PUBLIC, // We now ambiguously save Open Invite and Posts in this function
					...post, 
					gallery: !_.isNil(post.gallery) ? _.map(post.gallery, "name") : undefined, 
					cover: !_.isNil(post.cover) ? _.map(post.cover, "name") : undefined,
					guests: !_.isNil(post.guests) ? _.map(post.guests, "id") : undefined,
					place: _.isNull(post.place) ? null : post.place?.id /* Null means the post place was erased */
				}})}
				onDelete={async id => await deletePost({ variables: { id }})}
				onEdit={async post => await savePost({ variables: { 
					...post, 
					gallery: !_.isEmpty(post.gallery) ? _.map(post.gallery, "name") : undefined, 
					cover: !_.isNil(post.cover) ? _.map(post.cover, "name") : undefined,
					guests: !_.isEmpty(post.guests) ? _.map(post.guests, "id") : undefined 
				}})}
				onLeavePost={async id => await leavePost({ variables: { id }})}
				onJoinPost={async id => await joinPost({ variables: { id }})}
				onComment={async (comment, post) => await saveComment({ variables: { id: comment.id, description: comment.description, post }})}
				onCommentDelete={async (id, post) => await deleteComment({ variables: { id, post }})}

				userRefetch={userRefetch}

				savePostPhoto={async post => await savePostPhoto({ variables: { 
					id: post.id, 
					gallery: _.map(post.gallery, "name"), 
					files: post.files,
					cover: !_.isNil(post.cover) ? _.map(post.cover, "name") : undefined
				}})}
				
				places={queryPlacesData?.places}
				onSearchPlaces={async location => await queryPlacesRefetch({ variables: location })}
				searchUsers={querySearchUsersData?.searchUsers}
				onSearchUsers={async name => await querySearchUserRefetch({ variables: { name }})}
			/>
		</ContextLoading.Provider>
  );
}

export default Home;

const DefaultValues = {
	POST_PUBLIC: { 
		datePosted: new Date().toISOString(), 
		isVisible: true 
	}
}