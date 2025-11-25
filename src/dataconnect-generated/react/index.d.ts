import { CreateCommunityData, CreateCommunityVariables, ListCommunitiesData, JoinCommunityData, JoinCommunityVariables, GetUserPostsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateCommunity(options?: useDataConnectMutationOptions<CreateCommunityData, FirebaseError, CreateCommunityVariables>): UseDataConnectMutationResult<CreateCommunityData, CreateCommunityVariables>;
export function useCreateCommunity(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCommunityData, FirebaseError, CreateCommunityVariables>): UseDataConnectMutationResult<CreateCommunityData, CreateCommunityVariables>;

export function useListCommunities(options?: useDataConnectQueryOptions<ListCommunitiesData>): UseDataConnectQueryResult<ListCommunitiesData, undefined>;
export function useListCommunities(dc: DataConnect, options?: useDataConnectQueryOptions<ListCommunitiesData>): UseDataConnectQueryResult<ListCommunitiesData, undefined>;

export function useJoinCommunity(options?: useDataConnectMutationOptions<JoinCommunityData, FirebaseError, JoinCommunityVariables>): UseDataConnectMutationResult<JoinCommunityData, JoinCommunityVariables>;
export function useJoinCommunity(dc: DataConnect, options?: useDataConnectMutationOptions<JoinCommunityData, FirebaseError, JoinCommunityVariables>): UseDataConnectMutationResult<JoinCommunityData, JoinCommunityVariables>;

export function useGetUserPosts(options?: useDataConnectQueryOptions<GetUserPostsData>): UseDataConnectQueryResult<GetUserPostsData, undefined>;
export function useGetUserPosts(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserPostsData>): UseDataConnectQueryResult<GetUserPostsData, undefined>;
