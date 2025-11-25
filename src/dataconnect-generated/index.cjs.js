const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'echo88',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCommunity', inputVars);
}
createCommunityRef.operationName = 'CreateCommunity';
exports.createCommunityRef = createCommunityRef;

exports.createCommunity = function createCommunity(dcOrVars, vars) {
  return executeMutation(createCommunityRef(dcOrVars, vars));
};

const listCommunitiesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCommunities');
}
listCommunitiesRef.operationName = 'ListCommunities';
exports.listCommunitiesRef = listCommunitiesRef;

exports.listCommunities = function listCommunities(dc) {
  return executeQuery(listCommunitiesRef(dc));
};

const joinCommunityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'JoinCommunity', inputVars);
}
joinCommunityRef.operationName = 'JoinCommunity';
exports.joinCommunityRef = joinCommunityRef;

exports.joinCommunity = function joinCommunity(dcOrVars, vars) {
  return executeMutation(joinCommunityRef(dcOrVars, vars));
};

const getUserPostsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserPosts');
}
getUserPostsRef.operationName = 'GetUserPosts';
exports.getUserPostsRef = getUserPostsRef;

exports.getUserPosts = function getUserPosts(dc) {
  return executeQuery(getUserPostsRef(dc));
};
