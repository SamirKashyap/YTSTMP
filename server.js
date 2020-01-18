var express = require("express");
var graphqlHTTP = require("express-graphql");
var { buildSchema } = require("graphql");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
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

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "ytstmp.c4z3dnircpx7.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "tubestamp",
  database: "ytstmp",
  port: "3306"
});

const queryDB = query =>
  new Promise((resolve, reject) => {
    connection.query(query, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });

// The root provides a resolver function for each API endpoint
var root = {
  createVideo: async ({ id, length }) => {
    const rows = await queryDB(
      `INSERT INTO videos(id, length) VALUES ("${id}", ${length})`
    );
    return { id: id, length: length, timestamps: [] };
  },
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
