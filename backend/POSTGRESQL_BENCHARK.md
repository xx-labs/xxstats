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

# Init pgbench

```
docker exec backend_postgres_1 pgbench -i -p 5432 -d xxstats -U xxstats
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
docker exec backend_postgres_1 pgbench -c 10 -d xxstats -U xxstats
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
latency average = 9.900 ms
initial connection time = 17.445 ms
tps = 1010.080604 (without initial connection time)
```


# References

https://severalnines.com/blog/benchmarking-postgresql-performance/

https://www.postgresql.org/docs/devel/pgbench.html