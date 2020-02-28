---
title: Key-Value Store
date: 2018-10-23 12:04:21
tags: [SQL, KV Store]
---


## [Implementing a Key-Value Store](http://codecapsule.com/2012/11/07/ikvs-implementing-a-key-value-store-table-of-contents/)

### What are key-value stores, and why implement one?

A quick overview of key-value stores

Interfaces:
- Get(key)
- Set(key, value)
- Delete(key)

Main characteristics:
- Do not use the SQL query language
- May not provide full support of the ACID paradigm 
- May offer a distributed, fault-tolerant architecture

Key-value stores and relational databases

Why implement a key-value store
- The C++ programming language
- Object-oriented design
- Algorithmics and data structures
- Memory management
- Concurrency control with multi-processors or multi-threading
- Networking with a server/client model
- I/O problems with disk access and use of the file system

<!--more-->

### Using existing key-value stores as models
Not reinventing the wheel
- Use models
- Start small

Model candidates and selection criteria
- DBM
- Berkeley DB
- Kyoto Cabinet
- Memcached and MemcacheDB
- LevelDB
- MongoDB
- Redis
- OpenLDAP
- SQLite

Overview of the selected key-value stores
- Berkeley DB
    - 26 years 
    - implemented in C
- Kyoto Cabinet
    - 2009
    - implemented in C++
    - a hash table, a B+ Tree, and other esoteric data structures
- LevelDB
    - developed by Google
    - not using hash table or B-tree but based on a Log-Structured Merge Tree (LSM) 
    - implemented in C++
    - LevelDB might not be the best choice for heavy load or large databases (1e6->1e9->) as often required by serious back-end projects

### Comparative Analysis of the Architectures of Kyoto Cabinet and LevelDB
![](http://codecapsule.com/wp-content/uploads/2012/12/kvstore_kyotocabinet.jpg)
![](http://codecapsule.com/wp-content/uploads/2012/12/kvstore_leveldb.jpg)

Overview of the Components of a Key-Value Store
- Interface
- Parametrization
- Data Storage
- Data Structure
- Memory Management
- Iteration
- String
- Lock Management
- Error Management
- Logging
- Transaction Management
- Compression
- Comparators
- Checksum
- Snapshot
- Partitioning
- Replication
- Testing Framework

Structural and conceptual analysis of Kyoto Cabinet and LevelDB

API Design
- General principles for API design
    - When in doubt, leave it out
    - Don’t make the client do anything the library could do

- Defining the functionalities for the public API of KingDB
    - Opening and closing a database
    - Reading and writing data to a database
    - Iterating over the full collection of keys and values in a database
    - Offer a way to tune parameters
    - Offer a decent error notification interface
- Comparing the APIs of existing databases
    - Opening and closing a database
        ```
        db.open(...)
        db.close(...)
        ```
    - Reads and Writes
        ```
        db.get(...)
        db.put(...)
        ```
    - Iteration
        ```
        for (it->SeekToFirst(); it->Valid(); it->Next()) {...}
        ```
    - Parametrization
        ```
        DB::Options option;
        option.a = ...; 
        option.b = ...;
        db.open(..., option);

        DB::WriteOptions write_options;
        db.put(..., write_options)
        ```
    - Error management
        ```
        DB::Status s = db->Put(DB::WriteOptions(), "key", "value");
        ```
### Hash table implementations
Hash tables
> Hashtables are arguably the single most important data structure known to mankind.
> — Steve Yegge

- Hash functions
    - it is clear that MurmurHash3 and CityHash are the best hash functions to use for hash tables at the time this article is being written

Implementations
- unordered_map from TR1
![](http://codecapsule.com/wp-content/uploads/2013/04/kvstore_unordered_map_web.jpg)
- dense_hash_map from SparseHash
    - quadratic internal probing
    - given that each pair is 16 bytes and that the cache line is 64 bytes on most processors, the probing steps are very likely to be on the same cache line
![](http://codecapsule.com/wp-content/uploads/2013/04/kvstore_hash_dense_hash_map_web.jpg)
- HashDB from Kyoto Cabinet
  ![](http://codecapsule.com/wp-content/uploads/2013/04/kvstore_hash_kyoto_cabinet_web.jpg)
![](http://codecapsule.com/wp-content/uploads/2013/04/kvstore_hash_kyoto_cabinet_record_web.jpg)

- When designing the data organization of a hash table, the preferred solution should be to store the collision data with the buckets and not with the entries

### Open-Addressing Hash Tables

Metrics
- DIB: Distance to Initial Bucket
- DFB: Distance to Free Bucket
- DMB: Distance to Missing Bucket
- DSB: Distance to Shift Bucket
![](http://codecapsule.com/wp-content/uploads/2014/05/kvstore-part6-metrics.png)
- Number of bucket swaps
- Aligned DIB, DFB, DMB, and DSB
- Other metrics of interest
    -  number of exact collisions
    -  cache misses

Results and Discussion
- Robin Hood hashing has the best DIB and DMB, and an acceptable DFB
- In Robin Hood hashing, the maximum DIB increases with the table size
- Robin Hood hashing has an acceptable rate of swapped buckets during insertions
- Hopscotch hashing uses bucket swaps only at high load factors
- Robin Hood hashing has an acceptable DSB

### Optimizing Data Structures for SSDs
Fast data structures on SSDs
- In-place updates are useless
- Metadata must be buffered or avoided
- Data is never really sequential
- Random writes are fast if they are large enough
- Random reads are fast
- Log-structured storage

File I/O optimizations
- Every syscall has a cost
- Memory maps
- Zero-copy

Done is better than perfect

### Architecture of KingDB
Database, Snapshots and Iterators

Architectural overview
![](http://codecapsule.com/wp-content/uploads/2015/05/Architecture-of-KingDB-vecto.svg)

Index

The ByteArray class: RAII and zero-copy buffering through memory maps

Multipart API


Write buffer and the Order class

Threads and synchronization
- Buffer Manager
- Entry Writer
- Index Updater
- Compactor
- System Statistics Poller
- 
Error management

Parametrization and Logging
- DatabaseOptions
- ReadOptions
- WriteOptions
- ServerOptions

Compression, checksum, and hashing

### Data Format and Memory Management in KingDB


----
## [The NoSQL Ecosystem](http://www.aosabook.org/en/nosql.html)

Roadmap of considerations
- Data and query model: Is your data represented as rows, objects, data structures, or documents? Can you ask the database to calculate aggregates over multiple records? 
- Durability: When you change a value, does it immediately go to stable storage? Does it get stored on multiple machines in case one crashes?
- Scalability: Does your data fit on a single server? Do the amount of reads and writes require multiple disks to handle the workload?
- Partitioning: For scalability, availability, or durability reasons, does the data need to live on multiple servers? How do you know which record is on which server?
- Consistency: If you've partitioned and replicated your records across multiple servers, how do the servers coordinate when a record changes?
- Transactional semantics: When you run a series of operations, some databases allow you to wrap them in a transaction, which provides some subset of ACID (Atomicity, Consistency, Isolation, and Durability) guarantees on the transaction and all others currently running. Does your business logic require these guarantees, which often come with performance tradeoffs?
- Single-server performance: If you want to safely store data on disk, what on-disk data structures are best-geared toward read-heavy or write-heavy workloads? Is writing to disk your bottleneck?
- Analytical workloads: We're going to pay a lot of attention to lookup-heavy workloads of the kind you need to run a responsive user-focused web application. In many cases, you will want to build dataset-sized reports, aggregating statistics across multiple users for example. Does your use-case and toolchain require such functionality?

NoSQL Data and Query Models
- Key-based NoSQL Data Models
    - Key-Value Stores
    - Key-Data Structure Stores
    - Key-Document Stores
    - BigTable Column Family Stores
- Graph Storage
- Complex Queries
- Transactions
- Schema-free Storage

Data Durability
- Single-server Durability
    - Control fsync Frequency
    - Increase Sequential Writes by Logging
    - Increase Throughput by Grouping Writes
- Multi-server Durability

Scaling for Performance
- Do Not Shard Until You Have To
  - Read Replicas
  - Caching

- Sharding Through Coordinators

- Consistent Hash Rings

- Range Partitioning

Consistency



http://blog.marc-seeger.de/2009/09/21/key-value-stores-a-practical-overview/