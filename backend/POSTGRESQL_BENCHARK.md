# Hardware specs

Heztner	AX41-NVMe

https://www.hetzner.com/dedicated-rootserver/ax41-nvme

CPU:        AMD Ryzen 5 3600
RAM:	    64 GB DDR4
Disk:	    2 x 512 GB NVMe SSD (software-RAID 1)
Connection:	1 GBit/s port

# Pgtune suggested config

https://pgtune.leopard.in.ua/#/

```
# DB Version: 14
# OS Type: linux
# DB Type: web
# Total Memory (RAM): 64 GB
# CPUs num: 12
# Connections num: 200
# Data Storage: ssd

max_connections = 200
shared_buffers = 16GB
effective_cache_size = 48GB
maintenance_work_mem = 2GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 20971kB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 12
max_parallel_workers_per_gather = 4
max_parallel_workers = 12
max_parallel_maintenance_workers = 4
```

# Stop web server and dockers 

```
systemctl stop nginx
docker stop backend_crawler_1 backend_api_1 backend_graphql-engine_1
```

# Init pgbench

```
docker exec backend_postgres_1 pgbench -p 5432 -d postgres -U xxstats -i
```

```
dropping old tables...
NOTICE:  table "pgbench_accounts" does not exist, skipping
NOTICE:  table "pgbench_branches" does not exist, skipping
NOTICE:  table "pgbench_history" does not exist, skipping
NOTICE:  table "pgbench_tellers" does not exist, skipping
creating tables...
generating data (client-side)...
100000 of 100000 tuples (100%) done (elapsed 0.05 s, remaining 0.00 s)
vacuuming...
creating primary keys...
done in 0.20 s (drop tables 0.00 s, create tables 0.01 s, client-side generate 0.10 s, vacuum 0.05 s, primary keys 0.04 s).

```

# 10 client test

```
docker exec backend_postgres_1 pgbench -d postgres -U xxstats -c 10
```

```
...
transaction type: <builtin: TPC-B (sort of)>
scaling factor: 1
query mode: simple
number of clients: 10
number of threads: 1
number of transactions per client: 10
number of transactions actually processed: 100/100
latency average = 10.668 ms
initial connection time = 20.115 ms
tps = 937.382827 (without initial connection time)
```

# 100 client test

```
docker exec backend_postgres_1 pgbench -d postgres -U xxstats -c 100
```

```
...
transaction type: <builtin: TPC-B (sort of)>
scaling factor: 1
query mode: simple
number of clients: 100
number of threads: 1
number of transactions per client: 10
number of transactions actually processed: 1000/1000
latency average = 124.522 ms
initial connection time = 184.773 ms
tps = 803.071588 (without initial connection time)
```

# 200 client test

```
docker exec backend_postgres_1 pgbench -d postgres -U xxstats -c 200
```

```
...
transaction type: <builtin: TPC-B (sort of)>
scaling factor: 1
query mode: simple
number of clients: 200
number of threads: 1
number of transactions per client: 10
number of transactions actually processed: 2000/2000
latency average = 258.616 ms
initial connection time = 377.055 ms
tps = 773.346161 (without initial connection time)
```


# read-only work loads

```
docker exec backend_postgres_1 pgbench -d postgres -U xxstats -c 100 -T 300 -S -n
```

```
...
transaction type: <builtin: select only>
scaling factor: 1
query mode: simple
number of clients: 100
number of threads: 1
duration: 300 s
number of transactions actually processed: 1908415
latency average = 15.772 ms
initial connection time = 189.914 ms
tps = 6340.416632 (without initial connection time)
```


# References

https://severalnines.com/blog/benchmarking-postgresql-performance/

https://www.postgresql.org/docs/devel/pgbench.html