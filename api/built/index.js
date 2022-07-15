"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-check
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const pg_1 = require("pg");
const moment_1 = __importDefault(require("moment"));
const postgresConnParams = {
    user: process.env.POSTGRES_USER || 'xxstats',
    host: process.env.POSTGRES_HOST || 'postgres',
    database: process.env.POSTGRES_DATABASE || 'xxstats',
    password: process.env.POSTGRES_PASSWORD || 'xxstats',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
};
const port = process.env.PORT || 8000;
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
const getClient = async () => {
    const client = new pg_1.Client(postgresConnParams);
    await client.connect();
    return client;
};
// transfers in the last 30 days
app.get('/api/v1/charts/transfers', async (_req, res) => {
    const history = 30;
    const timestamps = [];
    const timePeriods = [];
    const chartData = [];
    const now = (0, moment_1.default)();
    // today at 00:00:00.000
    const iterator = (0, moment_1.default)().set({
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
    timestamps.push([
        now.format('YYYY-MM-DD'),
        now.valueOf(), // timestamp in ms
    ]);
    for (let index = 0; index < timestamps.length - 1; index++) {
        timePeriods.push({
            date: timestamps[index][0],
            fromTimestamp: timestamps[index][1],
            toTimestamp: timestamps[index + 1][1],
        });
    }
    const client = await getClient();
    const query = 'SELECT count(block_number) AS transfers FROM transfer WHERE timestamp >= $1 AND timestamp < $2;';
    const transferData = await Promise.all(timePeriods.map((timePeriod) => client.query(query, [timePeriod.fromTimestamp, timePeriod.toTimestamp])));
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
app.listen(port, () => console.log(`xxstats API is listening on port ${port}.`));
