"use strict";

const fastify = require("fastify")();
const tap = require("tap");
const fastifyInfluxDB = require("./index");
const Influx = require("influx");
const influx = new Influx.InfluxDB();

tap.test("fastify influxDB is correctly injected", async test => {
  test.plan(1);

  // Pre-cursory database creation
  await influx.createDatabase("NOAA_water_database");
  // End of pre-cursory code

  fastify.register(fastifyInfluxDB, {
    host: "localhost",
    database: "NOAA_water_database",
    schema: [
      {
        measurement: "average_temperature",
        fields: {
          "level description": "STRING",
          water_level: "FLOAT"
        },
        tags: ["location"]
      },
      {
        measurement: "h2o_pH",
        fields: {
          "level description": "STRING",
          water_level: "FLOAT"
        },
        tags: ["location"]
      },
      {
        measurement: "h2o_quality",
        fields: {
          "level description": "STRING",
          water_level: "FLOAT"
        },
        tags: ["location"]
      },
      {
        measurement: "h2o_temperature",
        fields: {
          "level description": "STRING",
          water_level: "FLOAT"
        },
        tags: ["location"]
      }
    ]
  });

  fastify.get("/", async (request, reply) => {
    const { instance } = fastify.influxdb;
    await instance.writePoints([
      {
        measurement: "h2o_temperature",
        tags: { location: "athens" },
        fields: { "level description": "Medium", water_level: 2.4324 }
      }
    ]);
    reply.send({
      rows: await instance.query(`
                    select * from h2o_temperature
                    where location = ${fastify.influxdb.escape.stringLit(
                      "athens"
                    )}
                    order by time desc
                    limit 10
                  `)
    });
  });

  fastify.ready(err => {
    test.error(err);
    fastify.inject(
      {
        method: "GET",
        url: "/"
      },
      (err, res) => {
        console.log(res);
        fastify.close(() => {
          test.end();
          process.exit(0);
        });
      }
    );
  });
});