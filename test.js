"use strict";

const fastify = require("fastify")();
const tap = require("tap");
const fastifyInfluxDB = require("./index");

tap.test("fastify influxDB is correctly injected", async test => {
  test.plan(4);

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

  try {
    await fastify.ready();

    const { payload } = await fastify.inject({
      method: "GET",
      url: "/"
    });

    const [fetchedRow] = JSON.parse(payload).rows;
    test.strictEqual(fetchedRow["level description"], "Medium");
    test.strictEqual(fetchedRow.location, "athens");
    test.strictEqual(fetchedRow.water_level, 2.4324);
  } catch (e) {
    test.error(e);
  }
});
