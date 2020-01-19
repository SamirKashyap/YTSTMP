const { ApolloServer, gql } = require("apollo-server-express");

var fs = require("fs");
var https = require("https");
var express = require("express");

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Admin123",
  database: "ytstmp"
});

const queryDB = query =>
  new Promise((resolve, reject) => {
    connection.query(query, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });

const typeDefs = gql`
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
`;

const resolvers = {
  Query: {
    video: async ({ id }) => {
      const [video] = await queryDB(`SELECT * FROM videos WHERE id="${id}"`);
      const timestamps = await queryDB(
        `SELECT * FROM timestamps WHERE video_id="${id}"`
      );
      return { id: video.id, length: video.length, timestamps: timestamps };
    },
    videos: async () => {
      const rows = await queryDB("SELECT * FROM videos");
      return rows;
    },
    timestamp: async ({ id }) => {
      const [timestamp] = await queryDB(
        `SELECT * FROM timestamps WHERE id="${id}"`
      );
      const [video] = await queryDB(
        `SELECT * FROM videos WHERE id="${timestamp.video_id}"`
      );
      return {
        id: timestamp.id,
        video: video,
        time: timestamp.time,
        name: timestamp.name
      };
    },
    timestamps: async () => {
      const rows = await queryDB("SELECT * FROM timestamps");
      return rows;
    }
  },
  Mutation: {
    createVideo: async ({ id, length }) => {
      const rows = await queryDB(
        `INSERT INTO videos(id, length) VALUES ("${id}", ${length}) `
      );
      return { id: id, length: length, timestamps: [] };
    },
    createTimestamp: async ({ video_id, time, name }) => {
      const [video] = await queryDB(
        `SELECT * FROM videos WHERE id="${video_id}"`
      );
      let id = require("crypto")
        .randomBytes(10)
        .toString("hex");
      if (name) {
        await queryDB(
          `INSERT INTO timestamps(id, video_id, time, name) VALUES ("${id}", "${video_id}", ${time}, "${name}")`
        );
      } else {
        await queryDB(
          `INSERT INTO timestamps(id, video_id, time) VALUES ("${id}", "${video_id}", ${time})`
        );
      }
      return { id: id, video: video, time: time, name: name };
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const apollo = new ApolloServer({ typeDefs, resolvers });

const app = express();
apollo.applyMiddleware({ app });

server = https.createServer(
  {
    key: fs.readFileSync(`./ssl/server.key`),
    cert: fs.readFileSync(`./ssl/server.crt`)
  },
  app
);
// The `listen` method launches a web server.
server.listen({ port: 443 }, () =>
  console.log("🚀 Server ready at", `https://localhost:443/graphql`)
);
