import neo4j from 'neo4j-driver';
import { makeAugmentedSchema } from 'neo4j-graphql-js';
import { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';

const typeDefs = `
type Post {
	id: ID!
	title: String!
	body: String!
	created: DateTime!
	tags: [Tag] @relation(name: "HAS_TAG", direction: "IN")
	status: PostStatus
}
type Tag {
	id: ID!
	name: String!
	posts: [Post] @relation(name: "HAS_TAG", direction: "OUT")
}
type Status {
	name: String!
	posts: [PostStatus]
}
type PostStatus @relation(name: "HAS_STATUS") {
	from: Status
	to: Post
	created: DateTime!
}
`;

export function setupGraphQL(app: Application) {
	const driver = neo4j.driver(
		'bolt://localhost:7687',
		neo4j.auth.basic('imakethismeself-blog', 'imakethismeself-blog')
	);
	const schema = makeAugmentedSchema({ typeDefs });
	const server = new ApolloServer({ schema, context: { driver } });
	server.applyMiddleware({ app, path: '/' });
}
