import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_HTTP || 'http://localhost:8080/v1/graphql';

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to make requests
export async function fetchGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  try {    
    return await graphqlClient.request<T>(query, variables);    
  } catch (error) {
    throw error;
  }
}