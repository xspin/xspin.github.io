#include <iostream>
#include <queue>
#include <vector>

int main() {
    // Create a max-heap priority queue
    std::priority_queue<int> maxHeap;

    // Add elements to the priority queue
    maxHeap.push(10);
    maxHeap.push(30);
    maxHeap.push(20);
    maxHeap.push(5);

    // Display and remove elements from the priority queue
    std::cout << "Max-Heap priority queue elements: ";
    while (!maxHeap.empty()) {
        std::cout << maxHeap.top() << " ";
        maxHeap.pop();
    }
    std::cout << std::endl;

    // Create a min-heap priority queue
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

    // Add elements to the priority queue
    minHeap.push(10);
    minHeap.push(30);
    minHeap.push(20);
    minHeap.push(5);

    // Display and remove elements from the priority queue
    std::cout << "Min-Heap priority queue elements: ";
    while (!minHeap.empty()) {
        std::cout << minHeap.top() << " ";
        minHeap.pop();
    }
    std::cout << std::endl;

    return 0;
}