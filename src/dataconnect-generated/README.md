# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListCommunities*](#listcommunities)
  - [*GetUserPosts*](#getuserposts)
- [**Mutations**](#mutations)
  - [*CreateCommunity*](#createcommunity)
  - [*JoinCommunity*](#joincommunity)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListCommunities
You can execute the `ListCommunities` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCommunities(): QueryPromise<ListCommunitiesData, undefined>;

interface ListCommunitiesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCommunitiesData, undefined>;
}
export const listCommunitiesRef: ListCommunitiesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCommunities(dc: DataConnect): QueryPromise<ListCommunitiesData, undefined>;

interface ListCommunitiesRef {
  ...
  (dc: DataConnect): QueryRef<ListCommunitiesData, undefined>;
}
export const listCommunitiesRef: ListCommunitiesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCommunitiesRef:
```typescript
const name = listCommunitiesRef.operationName;
console.log(name);
```

### Variables
The `ListCommunities` query has no variables.
### Return Type
Recall that executing the `ListCommunities` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCommunitiesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCommunitiesData {
  communities: ({
    id: UUIDString;
    name: string;
    description: string;
    imageUrl?: string | null;
  } & Community_Key)[];
}
```
### Using `ListCommunities`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCommunities } from '@dataconnect/generated';


// Call the `listCommunities()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCommunities();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCommunities(dataConnect);

console.log(data.communities);

// Or, you can use the `Promise` API.
listCommunities().then((response) => {
  const data = response.data;
  console.log(data.communities);
});
```

### Using `ListCommunities`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCommunitiesRef } from '@dataconnect/generated';


// Call the `listCommunitiesRef()` function to get a reference to the query.
const ref = listCommunitiesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCommunitiesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.communities);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.communities);
});
```

## GetUserPosts
You can execute the `GetUserPosts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserPosts(): QueryPromise<GetUserPostsData, undefined>;

interface GetUserPostsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserPostsData, undefined>;
}
export const getUserPostsRef: GetUserPostsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserPosts(dc: DataConnect): QueryPromise<GetUserPostsData, undefined>;

interface GetUserPostsRef {
  ...
  (dc: DataConnect): QueryRef<GetUserPostsData, undefined>;
}
export const getUserPostsRef: GetUserPostsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserPostsRef:
```typescript
const name = getUserPostsRef.operationName;
console.log(name);
```

### Variables
The `GetUserPosts` query has no variables.
### Return Type
Recall that executing the `GetUserPosts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserPostsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserPostsData {
  posts: ({
    id: UUIDString;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    createdAt: TimestampString;
  } & Post_Key)[];
}
```
### Using `GetUserPosts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserPosts } from '@dataconnect/generated';


// Call the `getUserPosts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserPosts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserPosts(dataConnect);

console.log(data.posts);

// Or, you can use the `Promise` API.
getUserPosts().then((response) => {
  const data = response.data;
  console.log(data.posts);
});
```

### Using `GetUserPosts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserPostsRef } from '@dataconnect/generated';


// Call the `getUserPostsRef()` function to get a reference to the query.
const ref = getUserPostsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserPostsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.posts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.posts);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateCommunity
You can execute the `CreateCommunity` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCommunity(vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;

interface CreateCommunityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
}
export const createCommunityRef: CreateCommunityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCommunity(dc: DataConnect, vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;

interface CreateCommunityRef {
  ...
  (dc: DataConnect, vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
}
export const createCommunityRef: CreateCommunityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCommunityRef:
```typescript
const name = createCommunityRef.operationName;
console.log(name);
```

### Variables
The `CreateCommunity` mutation requires an argument of type `CreateCommunityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCommunityVariables {
  name: string;
  description: string;
  rules?: string | null;
  imageUrl?: string | null;
}
```
### Return Type
Recall that executing the `CreateCommunity` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCommunityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCommunityData {
  community_insert: Community_Key;
}
```
### Using `CreateCommunity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCommunity, CreateCommunityVariables } from '@dataconnect/generated';

// The `CreateCommunity` mutation requires an argument of type `CreateCommunityVariables`:
const createCommunityVars: CreateCommunityVariables = {
  name: ..., 
  description: ..., 
  rules: ..., // optional
  imageUrl: ..., // optional
};

// Call the `createCommunity()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCommunity(createCommunityVars);
// Variables can be defined inline as well.
const { data } = await createCommunity({ name: ..., description: ..., rules: ..., imageUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCommunity(dataConnect, createCommunityVars);

console.log(data.community_insert);

// Or, you can use the `Promise` API.
createCommunity(createCommunityVars).then((response) => {
  const data = response.data;
  console.log(data.community_insert);
});
```

### Using `CreateCommunity`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCommunityRef, CreateCommunityVariables } from '@dataconnect/generated';

// The `CreateCommunity` mutation requires an argument of type `CreateCommunityVariables`:
const createCommunityVars: CreateCommunityVariables = {
  name: ..., 
  description: ..., 
  rules: ..., // optional
  imageUrl: ..., // optional
};

// Call the `createCommunityRef()` function to get a reference to the mutation.
const ref = createCommunityRef(createCommunityVars);
// Variables can be defined inline as well.
const ref = createCommunityRef({ name: ..., description: ..., rules: ..., imageUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCommunityRef(dataConnect, createCommunityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.community_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.community_insert);
});
```

## JoinCommunity
You can execute the `JoinCommunity` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
joinCommunity(vars: JoinCommunityVariables): MutationPromise<JoinCommunityData, JoinCommunityVariables>;

interface JoinCommunityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: JoinCommunityVariables): MutationRef<JoinCommunityData, JoinCommunityVariables>;
}
export const joinCommunityRef: JoinCommunityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
joinCommunity(dc: DataConnect, vars: JoinCommunityVariables): MutationPromise<JoinCommunityData, JoinCommunityVariables>;

interface JoinCommunityRef {
  ...
  (dc: DataConnect, vars: JoinCommunityVariables): MutationRef<JoinCommunityData, JoinCommunityVariables>;
}
export const joinCommunityRef: JoinCommunityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the joinCommunityRef:
```typescript
const name = joinCommunityRef.operationName;
console.log(name);
```

### Variables
The `JoinCommunity` mutation requires an argument of type `JoinCommunityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface JoinCommunityVariables {
  communityId: UUIDString;
}
```
### Return Type
Recall that executing the `JoinCommunity` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `JoinCommunityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface JoinCommunityData {
  communityMembership_insert: CommunityMembership_Key;
}
```
### Using `JoinCommunity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, joinCommunity, JoinCommunityVariables } from '@dataconnect/generated';

// The `JoinCommunity` mutation requires an argument of type `JoinCommunityVariables`:
const joinCommunityVars: JoinCommunityVariables = {
  communityId: ..., 
};

// Call the `joinCommunity()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await joinCommunity(joinCommunityVars);
// Variables can be defined inline as well.
const { data } = await joinCommunity({ communityId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await joinCommunity(dataConnect, joinCommunityVars);

console.log(data.communityMembership_insert);

// Or, you can use the `Promise` API.
joinCommunity(joinCommunityVars).then((response) => {
  const data = response.data;
  console.log(data.communityMembership_insert);
});
```

### Using `JoinCommunity`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, joinCommunityRef, JoinCommunityVariables } from '@dataconnect/generated';

// The `JoinCommunity` mutation requires an argument of type `JoinCommunityVariables`:
const joinCommunityVars: JoinCommunityVariables = {
  communityId: ..., 
};

// Call the `joinCommunityRef()` function to get a reference to the mutation.
const ref = joinCommunityRef(joinCommunityVars);
// Variables can be defined inline as well.
const ref = joinCommunityRef({ communityId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = joinCommunityRef(dataConnect, joinCommunityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.communityMembership_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.communityMembership_insert);
});
```

