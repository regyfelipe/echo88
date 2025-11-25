import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'echo88',
  location: 'us-east4'
};

export const createCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCommunity', inputVars);
}
createCommunityRef.operationName = 'CreateCommunity';

export function createCommunity(dcOrVars, vars) {
  return executeMutation(createCommunityRef(dcOrVars, vars));
}

export const listCommunitiesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCommunities');
}
listCommunitiesRef.operationName = 'ListCommunities';

export function listCommunities(dc) {
  return executeQuery(listCommunitiesRef(dc));
}

export const joinCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'JoinCommunity', inputVars);
}
joinCommunityRef.operationName = 'JoinCommunity';

export function joinCommunity(dcOrVars, vars) {
  return executeMutation(joinCommunityRef(dcOrVars, vars));
}

export const getUserPostsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserPosts');
}
getUserPostsRef.operationName = 'GetUserPosts';

export function getUserPosts(dc) {
  return executeQuery(getUserPostsRef(dc));
}

