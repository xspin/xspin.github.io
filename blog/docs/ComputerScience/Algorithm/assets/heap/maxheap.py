import heapq as heapq

values = [10, 8, 6, 32, 20]

# Convert the min-heap to a max-heap by inverting the values
max_heap = [-x for x in values]
heapq.heapify(max_heap)
print("Max-heap:", [-x for x in max_heap])

# Push a new value to the max-heap
heapq.heappush(max_heap, -15)
print("After push:", [-x for x in max_heap])

# Replace the root of the max-heap
heapq.heapreplace(max_heap, -25)
print("After replace:", [-x for x in max_heap])

# Pop the root of the max-heap
print("Pop:", -heapq.heappop(max_heap))
print("After pop:", [-x for x in max_heap])

# Push and pop in one operation
print("Pushpop:", -heapq.heappushpop(max_heap, -5))
print("After pushpop:", [-x for x in max_heap])

# Get the largest element (which is the smallest in the inverted heap)
print("Largest element:", -max_heap[0])

