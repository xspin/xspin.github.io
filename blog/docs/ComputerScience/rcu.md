# RCU 机制

## 简介
在计算机系统中，RCU（Read-Copy Update） 是一种高效的同步机制，主要用于读多写少的场景（例如内核数据结构、数据库、高并发服务）。它通过无锁读取和延迟更新来减少竞争，显著提升性能。

- RCU的优点：
  - 性能、不会死锁，以及良好的实时延迟。
- RCU的缺点：
  - 对于写者而言，他的开销很比读写锁大，他需要延迟数据结构的释放以及复制被修改的数据结构
  - 写者与写者之前还需要采取额外的锁机制来互斥其他写者的并行操作(一般都是 spinlock)


<p class="table-caption"> 对比 RCU vs 锁（Mutex/RW-Lock）</p>

特性  | RCU  | 读写锁|
------|-------|---------
读者开销 | 无锁，仅标记临界区	| 需原子操作或锁竞争|
写者开销 | 较高（需复制数据+延迟回收）|	直接修改，但需互斥|
适用场景 | 读多写少	| 写操作频繁|
内存安全 | 依赖宽限期机制 | 立即释放


![RCU](https://doc.dpdk.org/guides/_images/rcu_general_info.svg)

<p class="img-caption"> RCU状态图 </p>

如图所示，读线程1访问数据结构D1和D2。当它正在访问D1时，如果写线程需要从D1中删除一个元素，则写线程不能立即释放与该元素相关的内存。只有在读线程停止引用D1后，写线程才能将内存回收。换句话说，读线程1必须进入静默状态（quiescent state）。同样，由于读线程2也在访问D1，因此写线程必须等待直到线程2也进入静默状态。然而，写线程不需要等待读线程3进入静默状态，因为在删除操作发生时，读线程3并未访问D1。因此，读线程3不会对已删除的条目有任何引用。

值得注意的是，对于数据结构D2的临界区是数据结构D1的静默状态。即对于给定的数据结构Dx，在执行过程中任何不引用Dx的点都是一个静默状态。由于内存不是立即释放，因此根据应用需求可能需要额外配置内存。

## RCU 的核心思想

读者（Readers）：
- 无需加锁，直接访问数据。

写者（Writers）：
- 创建数据的副本并修改副本。
- 原子替换原数据指针，指向新副本。
- 延迟回收旧数据，直到所有读者退出临界区（Grace Period）。

## 实现 RCU 关键步骤

- 数据结构的定义
  - 使用指针指向共享数据，确保原子替换

```h
struct shared_data {
    int value;
    struct rcu_head rcu_head;
    // 其他字段...
};
struct shared_data *global_ptr = NULL; // 全局指针

```

- 读者的操作
  - 通过 `rcu_read_lock()` 和 `rcu_read_unlock()` 标记临界区
  - 直接读取数据指针（无锁）

```h
void reader() {
    rcu_read_lock();
    struct shared_data *local_ptr = rcu_dereference(global_ptr);
    // 安全读取 local_ptr->value
    rcu_read_unlock();
}
```

- 写者的操作
  - 创建副本，修改后原子替换指针
  - 使用 `rcu_assign_pointer` 替换指针
  - 使用 `call_rcu` 等待宽限期回收数据

```h
void writer(int new_value) {
    struct shared_data *new_ptr = malloc(sizeof(struct shared_data));
    new_ptr->value = new_value;
    
    // 替换全局指针（原子操作）
    struct shared_data *old_ptr = rcu_assign_pointer(global_ptr, new_ptr);
    
    // 安排旧数据回收（等待宽限期结束）
    call_rcu(&old_ptr->rcu_head, free_old_data);
}

void free_old_data(struct rcu_head *head) {
    struct shared_data *old_ptr = container_of(head, struct shared_data, rcu_head);
    free(old_ptr);
}
```

- 宽限期（Grace Period）
  - 确保所有活跃读者完成访问后，再回收旧数据。
  - 实现方式：
    - 基于线程注册/注销：记录所有读者的活动状态。
    - 基于时间戳或计数器：检测所有读者是否已退出临界区。
  - 例如，Linux 内核使用每 CPU 的计数器跟踪读者。

- 内存屏障（Memory Barriers）
  - 确保指针替换和读取操作的顺序性：
    - `rcu_dereference()`：插入读屏障，防止编译器/CPU 乱序优化。
    - `rcu_assign_pointer()`：插入写屏障，确保新指针对其他线程可见。

## RCU 数据回收
`call_rcu()` 和 `synchronize_rcu()` 是 RCU 机制中用于处理旧版本数据回收的两个不同方式，它们有以下区别：

- 阻塞行为：
  - synchronize_rcu() 会阻塞调用线程，直到所有正在进行的 RCU 读端临界区完成。
  - call_rcu() 不会阻塞调用线程，它只是注册一个回调函数，在未来合适的时机（当所有的 RCU 读端临界区完成后）执行。
- 适用场景：
  - synchronize_rcu() 适用于需要立即确保旧数据可以被安全回收的情况，通常在一些对时间要求严格或者后续操作依赖于旧数据回收完成的场景中使用。
  - call_rcu() 更适用于对实时性要求不那么高，或者希望在后台异步处理旧数据回收的情况。
- 性能影响：
  - 由于 synchronize_rcu() 会阻塞，可能会对系统的并发性和响应性产生一定的影响，特别是在 RCU 读端临界区持续时间较长或数量较多的情况下。
  - call_rcu() 因为不阻塞，对当前线程的性能影响较小，但需要注意回调函数的执行时机和可能的资源竞争。

总的来说，选择使用 call_rcu() 还是 synchronize_rcu() 取决于具体的应用场景和对性能、实时性的要求。



## 参考资料
- https://blog.csdn.net/lqy971966/article/details/118993557
- https://zhuanlan.zhihu.com/p/89439043
- [dpdk rcu](https://doc.dpdk.org/guides/prog_guide/rcu_lib.html)
- [用户态rcu库 liburcu](https://github.com/urcu/userspace-rcu)