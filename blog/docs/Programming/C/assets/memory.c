#include <stdio.h>
#include <stdlib.h>

// 全局/静态存储区
int global_var = 10;
static int static_var = 20;
int global_uninit_var;  // 未初始化的全局变量默认为0

// 常量存储区
const char *const_str = "Hello, World!";

// 函数原型
void demonstrate_memory_areas() {
    // 栈区
    int local_var = 50;
    printf("Local variable in function: %d, Address: %p\n", local_var, (void*)&local_var);
}

int main() {
    // 栈区
    int stack_var = 30;

    // 堆区
    int *heap_var = (int *)malloc(sizeof(int));
    if (heap_var == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        return 1;
    }
    *heap_var = 40;

    demonstrate_memory_areas();

    printf("Global variable: %d, Address: %p\n", global_var, (void*)&global_var);
    printf("Global uninit variable: %d, Address: %p\n", global_uninit_var, (void*)&global_uninit_var);
    printf("Static variable: %d, Address: %p\n", static_var, (void*)&static_var);
    printf("Stack variable: %d, Address: %p\n", stack_var, (void*)&stack_var);
    printf("Heap variable: %d, Address: %p\n", *heap_var, (void*)heap_var);
    printf("Constant string: %s, Address: %p\n", const_str, (void*)const_str);

    // 释放堆区内存
    free(heap_var);

    return 0;
}