# Fastify InfluxDB Plugin using the Official InfluxDB Driver

[![NPM](https://nodei.co/npm/fastify-influxdb.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fastify-influxdb/)

[![CircleCI](https://circleci.com/gh/alex-ppg/fastify-influxdb.svg?style=svg)](https://circleci.com/gh/alex-ppg/fastify-influxdb)

## Installation

```bash
npm i fastify-influxdb -s
```

## Usage

```javascript
const fastify = require("fastify")();
// Should be first declaration
fastify.register(require("fastify-influxdb"), {
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
```

## Description

This plugin adds an InfluxDB driver made available to all routes via the `decorate` function. It should be used whenever an InfluxDB instance needs to communicate with a Fastify API instance.

## Options

| Option     | Description                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| `host`     | Optional, the host to connect to. Defaults to `localhost`                                                   |
| `hosts`    | Optional, the multiple hosts to connect to. If specified, multi-cluster setup will be passed on to `influx` |
| `database` | Optional, the database to connect to                                                                        |
| `schema`   | Optional, the schema of the database we are connecting to                                                   |
| `username` | Optional, the username to use for authorization if any                                                      |
| `password` | Optional, the password to use for authorization if any                                                      |

Any schemas declared should follow the following format:

```javascript
{
  measurement: "name_of_measurement",
  fields: {
    "level description": "STRING",
    water_level: "FLOAT"
  },
  tags: ["location"]
}
```

The above schema should be created according to the [InfluxDB Node.JS Library Schema Specification](https://node-influx.github.io/typedef/index.html#static-typedef-ISchemaOptions).

One should note that instead of `Influx.FieldType.TYPE` and `FieldType.TYPE` he/she should specify the `TYPE` in string format instead. For example, the default schema presented in the above documentation link can be converted as follows:

```javascript
// Before
{
  measurement: 'perf',
  tags: ['hostname'],
  fields: {
    memory_usage: FieldType.INTEGER,
    cpu_usage: FieldType.FLOAT,
    is_online: FieldType.BOOLEAN,
  }
}

// After
{
  measurement: 'perf',
  tags: ['hostname'],
  fields: {
    memory_usage: 'INTEGER',
    cpu_usage: 'FLOAT',
    is_online: 'BOOLEAN',
  }
}
```

The `Influx` object of the `influx` npm package is also provided by default in the decorator while the InfluxDB instance can be accessed via `fastify.influxdb.instance`.

## Author

[Alex Papageorgiou](alex.ppg@pm.me)

## License

Licensed under [GPLv3](./LICENSE).
