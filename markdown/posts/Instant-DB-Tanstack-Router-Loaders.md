---
layout: post
title: InstantDB & Tanstack Router Loaders
date: "2025-07-24"
author: Jeff Chen
tags: code,tanstack,instantdb
---

I've been playing with [InstantDB](https://www.instantdb.com/) and [Tanstack Router](https://tanstack.com/router/latest) recently.
InstantDB exposes a hook [useQuery](https://www.instantdb.com/docs) to fetch data, with a fairly typical `{ data, error, isLoading }` return value.

Using `useQuery` directly in page components means that the component has to handle loading and error states directly, instead of using `pendingComponent` and `errorComponent` in the router.

One naive approach is to use `db.queryOnce` inside a [data loader](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading).
This works, but means that the component will not be aware of any updates to the data—InstantDB's most important feature.

Instead, we can combine `db.queryOnce` and `db.useQuery` to 1) fetch any initial data in the loader, and 2) use `db.useQuery` to subscribe to updates in the component:

<!-- excerpt -->

```tsx
// lib/db.ts
import schema, { type AppSchema } from "@/instant.schema.ts";

const APP_ID = "<placeholder>";
const _db = init({
  appId: APP_ID,
  schema,
});

// A version of db.queryOnce that only throws when 1) the user is offline and 2) query data isn't in local cache
export function tryQueryOnce<Q extends InstaQLParams<AppSchema>>(
  query: Q
): Promise<InstaQLLifecycleState<Q>> {
  return new Promise((resolve, _reject) => {
    const unsubscribe = db._core.subscribeQuery(query, resp => {
      try {
        if (resp.error) {
          return resolve({
            status: "error",
            isLoading: false,
            isError: true,
            isSuccess: false,
            isPlaceholderData: false,
            error: { message: resp.error.message },
            data: undefined,
            pageInfo: undefined,
          });
        }

        if (resp.data) {
          return resolve({
            status: "success",
            isLoading: false,
            isError: false,
            isSuccess: true,
            isPlaceholderData: false,
            error: undefined,
            data: resp.data,
            pageInfo: resp.pageInfo,
          });
        }

        return resolve({
          status: "error",
          isLoading: false,
          isError: true,
          isSuccess: false,
          isPlaceholderData: false,
          error: { message: "Data not in local cache and user is not online" },
          data: undefined,
          pageInfo: undefined,
        });
      } finally {
        unsubscribe?.();
      }
    });
  });
}

export type InstaQLLifecycleState<Q extends InstaQLParams<AppSchema>> =
  | {
      status: "error";
      isLoading: false;
      isError: true;
      isSuccess: false;
      isPlaceholderData: false;
      error: {
        message: string;
      };
      data: undefined;
      pageInfo: undefined;
    }
  | {
      status: "loading";
      isLoading: true;
      isError: false;
      isSuccess: false;
      isPlaceholderData: false;
      error: undefined;
      data: undefined;
      pageInfo: undefined;
    }
  | {
      status: "success";
      isLoading: false;
      isError: false;
      isSuccess: true;
      isPlaceholderData: boolean;
      error: undefined;
      data: InstaQLResponse<AppSchema, Q>;
      pageInfo: PageInfoResponse<Q>;
    };

// Wrapper around db.useQuery that returns `placeholderData` when 1) the query is loading and 2) placeholder data is provided.
export function useQuery<Q extends InstaQLParams<AppSchema>>(
  query: Q,
  placeholderData?: InstaQLResponse<AppSchema, Q>,
  options?: InstaQLOptions
): InstaQLLifecycleState<Q> {
  const result = _db.useQuery(query, options);
  const status = result.isLoading
    ? placeholderData
      ? "success"
      : "loading"
    : result.error
    ? "error"
    : "success";

  switch (status) {
    case "error":
      return {
        status,
        isError: true,
        // biome-ignore lint/style/noNonNullAssertion: handled by switch
        error: result.error!,
        isSuccess: false,
        isPlaceholderData: false,
        isLoading: false,
        data: undefined,
        pageInfo: undefined,
      };
    case "success": {
      const isPlaceholderData = result.isLoading && !!placeholderData;
      return {
        status,
        isError: false,
        error: undefined,
        isSuccess: true,
        isPlaceholderData,
        isLoading: false,
        // biome-ignore lint/style/noNonNullAssertion: handled by switch
        data: isPlaceholderData ? placeholderData : result.data!,
        pageInfo: isPlaceholderData
          ? getPlaceholderPageInfo(placeholderData)
          : // biome-ignore lint/style/noNonNullAssertion: handled by switch
            result.pageInfo!,
      };
    }
    case "loading": {
      return {
        status,
        isError: false,
        error: undefined,
        isSuccess: false,
        isPlaceholderData: false,
        isLoading: true,
        data: undefined,
        pageInfo: undefined,
      };
    }
  }
}

export async function getPreloadedQuery<T, Q extends InstaQLParams<AppSchema>>(
  params: T,
  getQuery: (params: T) => Q,
  getParams?: (data: InstaQLResponse<AppSchema, Q>) => T
) {
  const query = getQuery(params);
  const { data, pageInfo, error } = await tryQueryOnce(query);

  if (error || !data) {
    throw new Error(
      `Failed to load query: ${error?.message ?? "No data returned"}`
    );
  }

  const useRouteQuery = (data: InstaQLResponse<AppSchema, Q>) => {
    const newParams = getParams ? getParams(data) : params;
    const newQuery = getQuery(newParams);

    return useQuery(newQuery, data);
  };

  return {
    initialData: data,
    pageInfo,
    useRouteQuery,
  };
}
```

Then, in a page:

```tsx
export const Route = createFileRoute("/_authenticated/login")({
  loader: async ({ context }) => {
    const { authenticated, user } = context;

    if (authenticated) {
      // If already authenticated, redirect to home
      throw redirect({ to: "/" });
    }

    return await getPreloadedQuery(user?.id, userId => baseUserQuery(userId));
  },
  component: LoginPage,
  pendingComponent: <>Loading...</>,
});

function LoginPage() {
  const { initialData, useRouteQuery } = Route.useLoaderData();
  const { data, error } = useRouteQuery(initialData);

  if (!data) {
    throw new Error(error?.message ?? "Data not found");
  }

  // `data` will auto-update
  return <Login data={data} />;
}
```

The result is a page that:

1. pauses to load its required data, showing a `pendingComponent` if necessary
2. shows an error component if the data loader fails
3. automatically updates the page when data changes
