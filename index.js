"use strict";

const fastifyPlugin = require("fastify-plugin");
const Influx = require("influx");

async function influxConnector(
  fastify,
  {
    host = "localhost",
    port = 8086,
    hosts,
    database,
    schema,
    username,
    password
  }
) {
  const connectionOptions = { database, port };

  if (hosts === undefined) connectionOptions.host = host;
  else connectionOptions.hosts = hosts;

  if (username !== undefined) {
    connectionOptions.username = username;
    connectionOptions.password = password;
  }

  if (schema !== undefined) {
    connectionOptions.schema = schema.map(schema => {
      Object.keys(schema.fields).forEach(
        field => (schema.fields[field] = Influx.FieldType[schema.fields[field]])
      );
      return schema;
    });
  }

  const influx = new Influx.InfluxDB(connectionOptions);

  if (database !== undefined) {
    const names = await influx.getDatabaseNames();

    if (!names.includes(database)) {
      await influx.createDatabase(database);
    }
  }

  Influx.instance = influx;
  delete Influx.InfluxDB;

  fastify.decorate("influxdb", Influx);
}

module.exports = fastifyPlugin(influxConnector);
