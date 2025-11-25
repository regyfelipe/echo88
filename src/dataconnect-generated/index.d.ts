import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CommunityMembership_Key {
  userId: UUIDString;
  communityId: UUIDString;
  __typename?: 'CommunityMembership_Key';
}

export interface Community_Key {
  id: UUIDString;
  __typename?: 'Community_Key';
}

export interface CreateCommunityData {
  community_insert: Community_Key;
}

export interface CreateCommunityVariables {
  name: string;
  description: string;
  rules?: string | null;
  imageUrl?: string | null;
}

export interface GetUserPostsData {
  posts: ({
    id: UUIDString;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    createdAt: TimestampString;
  } & Post_Key)[];
}

export interface JoinCommunityData {
  communityMembership_insert: CommunityMembership_Key;
}

export interface JoinCommunityVariables {
  communityId: UUIDString;
}

export interface ListCommunitiesData {
  communities: ({
    id: UUIDString;
    name: string;
    description: string;
    imageUrl?: string | null;
  } & Community_Key)[];
}

export interface Post_Key {
  id: UUIDString;
  __typename?: 'Post_Key';
}

export interface Reaction_Key {
  id: UUIDString;
  __typename?: 'Reaction_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateCommunityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
  operationName: string;
}
export const createCommunityRef: CreateCommunityRef;

export function createCommunity(vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;
export function createCommunity(dc: DataConnect, vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;

interface ListCommunitiesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCommunitiesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCommunitiesData, undefined>;
  operationName: string;
}
export const listCommunitiesRef: ListCommunitiesRef;

export function listCommunities(): QueryPromise<ListCommunitiesData, undefined>;
export function listCommunities(dc: DataConnect): QueryPromise<ListCommunitiesData, undefined>;

interface JoinCommunityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: JoinCommunityVariables): MutationRef<JoinCommunityData, JoinCommunityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: JoinCommunityVariables): MutationRef<JoinCommunityData, JoinCommunityVariables>;
  operationName: string;
}
export const joinCommunityRef: JoinCommunityRef;

export function joinCommunity(vars: JoinCommunityVariables): MutationPromise<JoinCommunityData, JoinCommunityVariables>;
export function joinCommunity(dc: DataConnect, vars: JoinCommunityVariables): MutationPromise<JoinCommunityData, JoinCommunityVariables>;

interface GetUserPostsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserPostsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserPostsData, undefined>;
  operationName: string;
}
export const getUserPostsRef: GetUserPostsRef;

export function getUserPosts(): QueryPromise<GetUserPostsData, undefined>;
export function getUserPosts(dc: DataConnect): QueryPromise<GetUserPostsData, undefined>;

