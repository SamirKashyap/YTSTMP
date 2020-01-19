var { buildSchema } = require("graphql");
// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    videos: [Video]
    video(id: ID!): Video
    timestamps: [Timestamp]
    timestamp(id: ID!): Timestamp
  }

  type Mutation {
    createVideo(id: ID!, length: Int!): Video
    createTimestamp(video_id: ID!, time: Int!, name: String): Timestamp
  }

  type Video {
    id: ID!
    length: Int!
    timestamps: [Timestamp]
  }

  type Timestamp {
    id: ID!
    video: Video!
    time: Int!
    name: String
  }
`);

module.exports = schema;
