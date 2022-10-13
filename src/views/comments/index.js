import { useContext } from "react";
import { gql, useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { Redirect } from "react-router-dom";

import { ContextLoading, ContextUser } from "src/components";

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

const queryPost = gql`
	query
	post($id: String!) {
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

const queryComments = gql`
	query
	comments($id: String!) {
		comments(id: $id) {
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

function Comments(props) {
	const { data: queryUserData, loading, error, refetch } = useQuery(queryUser, { fetchPolicy: "cache-and-network" });
	const [queryCommentsRefetch, { data: queryCommentsData, loading: queryCommentsLoading, error: queryCommentsError }] = useLazyQuery(queryComments, { fetchPolicy: "no-cache" });
	const [queryPostRefetch, { data: queryPostData, loading: queryPostLoading, error: queryPostError }] = useLazyQuery(queryPost, { fetchPolicy: "cache-and-network" });
	const [saveComment, { data: mutationSaveCommentPostData, loading: mutationSaveCommentLoading, error: mutationSaveCommentPostsError }] = useMutation(mutationSaveComment, { refetchQueries: [queryComments] });
	const [deleteComment, { data: mutationDeleteCommentPostData, loading: mutationDeleteCommentLoading, error: mutationDeleteCommentPostsError }] = useMutation(mutationDeleteComment, { refetchQueries: [queryUser] });
	
	// Redirect if the user is not logged in
	const [user] = useContext(ContextUser);
	if(_.isEmpty(user)) return <Redirect to="/" />;

  return (
		<ContextLoading.Provider value={{ userLoading: loading, postLoading: queryPostLoading, commentsLoading: queryCommentsLoading, saveCommentLoading: mutationSaveCommentLoading, deleteCommentLoading: mutationDeleteCommentLoading }}>
			<Component
				{...props}
				activeUser={user}
				user={queryUserData?.user}
				post={queryPostData?.post}
				postRefetch={queryPostRefetch}

				comments={queryCommentsData?.comments}
				onComment={async (comment, post) => await saveComment({ variables: { id: comment.id, description: comment.description, post }})}
				onCommentDelete={async (id, post) => await deleteComment({ variables: { id, post }})}
				commentsRefetch={queryCommentsRefetch}
			/>
		</ContextLoading.Provider>
  );
}

export default Comments;