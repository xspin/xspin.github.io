#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>

class Heap {
private:
    std::vector<int> heap;
    std::function<bool(int, int)> cmp;

public:
    Heap(std::function<bool(int, int)> cmp) : cmp(cmp) {}

    void insert(int value) {
        heap.push_back(value);
        std::push_heap(heap.begin(), heap.end(), cmp);
    }

    int pop() {
        if (heap.empty()) {
            throw std::out_of_range("Heap is empty");
        }
        std::pop_heap(heap.begin(), heap.end(), cmp);
        int top = heap.back();
        heap.pop_back();
        return top;
    }

    void buildHeap(const std::vector<int>& values) {
        heap = values;
        std::make_heap(heap.begin(), heap.end(), cmp);
    }

    void printHeap() {
        for (int value : heap) {
            std::cout << value << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    std::vector<int> values = {1, 2, 5, 3};

    Heap maxHeap((std::less<int>()));
    maxHeap.buildHeap(values);
    std::cout << "Max Heap: ";
    maxHeap.printHeap();
    maxHeap.insert(10);
    maxHeap.insert(20);
    maxHeap.insert(55);
    maxHeap.insert(30);

    maxHeap.printHeap();
    std::cout << "Max value: " << maxHeap.pop() << std::endl;
    maxHeap.printHeap();

    Heap minHeap((std::greater<int>()));
    minHeap.buildHeap(values);
    std::cout << "Min Heap: ";
    minHeap.printHeap();
    minHeap.insert(10);
    minHeap.insert(20);
    minHeap.printHeap();
    std::cout << "Min value: " << minHeap.pop() << std::endl;
    maxHeap.printHeap();

    return 0;
}
