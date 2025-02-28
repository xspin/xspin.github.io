# 大根堆和小根堆

堆是一种特殊的树形数据结构，每个节点都有一个值，堆通常分为两种类型：大根堆和小根堆。

- **大根堆**：在大根堆中，每个节点的值都大于或等于其子节点的值。因此，最大值总是位于堆的根节点。
- **小根堆**：在小根堆中，每个节点的值都小于或等于其子节点的值。因此，最小值总是位于堆的根节点。

堆常用于实现优先队列，并且在排序算法（如堆排序）中也有广泛应用。

可基于堆实现的技术：
- 优先队列（priority_queue）
- 排序：堆排序
- 对顶堆：维护数据中排行前k的元素，由一个大根堆与一个小根堆组成，小根堆维护大值即前 k 大的值（包含第 k 个），大根堆维护小值即比第 k 大数小的其他数

## 使用C实现

@import "assets/heap/heap.c"

## 使用Cpp实现

### make_heap

使用`make_heap`实现堆
https://en.cppreference.com/w/cpp/algorithm/make_heap

@import "assets/heap/heap.cpp"


### priority_queue

使用`priority_queue`，它就是一个堆
https://en.cppreference.com/w/cpp/container/priority_queue

@import "assets/heap/priority_queue.cpp"


## 使用Python实现

### 小根堆
@import "assets/heap/minheap.py"


使用优先队列实现

```python
from queue import PriorityQueue

heap = PriorityQueue()
heap.put(34)
heap.put(14)
heap.put(24)
heap.put(20)
heap.put(10)
heap.put(30)

while not heap.empty():
    val = heap.get()
    print(val)
```

### 大根堆
@import "assets/heap/maxheap.py"

## 参考资料
-  https://oi-wiki.org/ds/binary-heap/