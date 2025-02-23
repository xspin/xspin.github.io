#include <stdio.h>
#include <stdbool.h>
#include <math.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

bool greater(int a, int b) {
    return a > b;
}

bool less(int a, int b) {
    return a < b;
}

void heapify(int arr[], int n, int i, bool (*cmp)(int, int)) {
    while (i < n) {
        int top = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < n && cmp(arr[i], arr[left])) {
            i = left;
        }
        if (right < n && cmp(arr[i], arr[right])) {
            i = right;
        }
        if (top != i) {
            swap(&arr[top], &arr[i]);
        } else {
            break;
        }
    }
}

void push_heap(int arr[], int n, bool (*cmp)(int, int)) {
    int i = n - 1;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (cmp(arr[i], arr[parent])) {
            swap(&arr[parent], &arr[i]);
            i = parent;
        } else {
            break;
        }
    }
}

int pop_heap(int arr[], int n, bool (*cmp)(int, int)) {
    swap(&arr[0], &arr[n - 1]);
    heapify(arr, n - 1, 0, cmp);
    return arr[n - 1];
}

void make_heap(int arr[], int n, bool (*cmp)(int, int)) {
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i, cmp);
    }
}

void heap_sort(int arr[], int n, bool (*cmp)(int, int)) {
    make_heap(arr, n, cmp);
    for (int i = n - 1; i > 0; i--) {
        int top = pop_heap(arr, i + 1, cmp);
        arr[i] = top;
    }
}


void printArray(const char* msg, int arr[], int n) {
    printf("%s ", msg);
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (i == (int)pow(2, k) - 1) {
            printf("\n");
            k++;
        }
        printf("%2d ", arr[i]);
    }
    printf("\n");
}

#define N 100

int main() {
    int arr[N] = {4, 10, 3, 5, 1, 3, 9, 8};
    int n = 8;
    make_heap(arr, n, less);
    printArray("Max Heap:", arr, n);

    // pop the top element
    pop_heap(arr, n--, less);
    printArray("After pop:", arr, n);

    // push 7 to the heap
    arr[n++] = 7;
    push_heap(arr, n, less);
    printArray("After push:", arr, n);

    // make min heap
    make_heap(arr, n, greater);
    printArray("Min Heap:", arr, n);

    // sort the array
    heap_sort(arr, n, less);
    printArray("Sorted array:", arr, n);
    return 0;
}