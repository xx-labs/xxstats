// @ts-check
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { Client } from 'pg';
import moment from 'moment';

const postgresConnParams = {
  user: process.env.POSTGRES_USER || 'xxstats',
  host: process.env.POSTGRES_HOST || 'postgres',
  database: process.env.POSTGRES_DATABASE || 'xxstats',
  password: process.env.POSTGRES_PASSWORD || 'xxstats',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
};
const port = process.env.PORT || 8000;
const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

const getClient = async (): Promise<Client> => {
  const client = new Client(postgresConnParams);
  await client.connect();
  return client;
};

// transfers in the last 30 days
app.get('/api/v1/charts/transfers', async (_req, res) => {

  const history = 30;
  const timestamps = [];
  const timePeriods = [];
  const chartData = [];
  const now = moment();

  // today at 00:00:00.000
  const iterator = moment().set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  iterator.subtract(history, 'days');
  for (let offset = 1; offset <= history; offset++) {
    iterator.add(1, 'days');
    timestamps.push([
      iterator.format('YYYY-MM-DD'),
      iterator.valueOf(), // timestamp in ms
    ]);
  }
  // timestamps.push([
  //   now.format('YYYY-MM-DD'),
  //   now.valueOf(), // timestamp in ms
  // ]);

  for (let index = 0; index < timestamps.length - 1; index++) {
    timePeriods.push({
      date: timestamps[index][0],
      fromTimestamp: timestamps[index][1],
      toTimestamp: timestamps[index + 1][1],
    });
  }

  const client = await getClient();
  const query =
    'SELECT count(block_number) AS transfers FROM transfer WHERE timestamp >= $1 AND timestamp < $2;';

  const transferData = await Promise.all(
    timePeriods.map((timePeriod) =>
      client.query(query, [timePeriod.fromTimestamp, timePeriod.toTimestamp]),
    ),
  );

  for (let index = 0; index < timestamps.length - 1; index++) {
    chartData.push({
      date: timePeriods[index].date,
      fromTimestamp: timePeriods[index].fromTimestamp,
      toTimestamp: timePeriods[index].toTimestamp,
      transfers: transferData[index].rows[0].transfers,
    });
  }
  await client.end();
  res.send({
    status: true,
    message: 'Request was successful',
    data: chartData,
  });
});

// Start app
app.listen(port, () =>
  console.log(`xxstats API is listening on port ${port}.`),
);
