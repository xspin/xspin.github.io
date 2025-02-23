import heapq as heapq

min_heap = [10, 8, 6, 32, 20]

heapq.heapify(min_heap)
print("Min-heap:", min_heap)

heapq.heappush(min_heap, 3)
print("After push:", min_heap)

heapq.heapreplace(min_heap, 7)
print("After replace", min_heap)

print("Pop:", heapq.heappop(min_heap))
print(min_heap)

print("pushpop:", heapq.heappushpop(min_heap, 5))
print(min_heap)

print("Top:", min_heap[0])
