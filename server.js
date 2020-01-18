var express = require("express");
var graphqlHTTP = require("express-graphql");
var { buildSchema } = require("graphql");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    video(id: ID!): Video
    timestamp(id: ID!): Timestamp
  }
  type Mutation {
    createVideo(id: ID!, length: Int!): Video
    createTimestamp(videoId: ID!, time: Int!, name: String): Timestamp
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

var fakeVideoTable = {};
var fakeTimestampTable = {};

// The root provides a resolver function for each API endpoint
var root = {
  createVideo: ({ id, length }) => {
    fakeVideoTable[id] = { id: id, length: length, timestamps: [] };
    return fakeVideoTable[id];
  },
  video: ({ id }) => {
    return fakeVideoTable[id];
  },
  createTimestamp: ({ videoId, time, name }) => {
    let id = require("crypto")
      .randomBytes(10)
      .toString("hex");
    const timestampObject = {
      id: id,
      video: fakeVideoTable[videoId],
      time: time,
      name: name
    };
    fakeTimestampTable[id] = timestampObject;
    fakeVideoTable[videoId].timestamps.push(timestampObject);
    return timestampObject;
  },
  timestamp: ({ id }) => {
    return fakeVideoTable[id];
  }
};

var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
