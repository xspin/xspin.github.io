#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include "itest.h"

typedef struct mpool {
    size_t size;    /* 单个元素大小 */
    size_t length;  /* 总元素个数 */
    void *mem[0];   /* mem[0] 保存空闲链表的首地址 */
} mpool_t;

mpool_t *mpool_create(size_t size, size_t count) {
    if (size < sizeof(void*)) {
        size = sizeof(void*);
    }
    mpool_t *mp = (mpool_t *)malloc(sizeof(mpool_t) + size * count + 1);
    mp->size = size;
    mp->length = count + 1;
    void **prev = mp->mem;
    void **p = prev;
    for (size_t i=1; i<mp->length; i++) {
        p = (void**)((uint8_t *)p + size);
        *prev = p;
        prev = p;
    }
    *p = NULL;
    return mp;
}

void mpool_destroy(mpool_t *mp) {
    free(mp);
}

/**
 * 每次分配单个元素大小内存
 */
void *mpool_alloc(mpool_t *mp) {
    void *p = mp->mem[0];
    if (p) {
        mp->mem[0] = *(void **)p;
    }
    return p;
}

void mpool_free(mpool_t *mp, void *p) {
    *(void**)p = mp->mem[0];
    mp->mem[0] = p;
}

size_t mpool_free_count(mpool_t *mp) {
    size_t cnt = 0;
    void *p = mp->mem[0];
    while (p) {
        p = *(void**)p;
        cnt++;
    }
    return cnt;
}

void mpool_print(mpool_t *mp) {
    printf("========= %p ========\n", mp);
    printf("size: %lu, length: %lu\n", mp->size, mp->length);
    printf("head: %p\n", mp->mem[0]);
    for (size_t i=0; i < mp->length; i++) {
        void **p = (void**)((uint8_t *)mp->mem + mp->size*i);
        printf("%p [%lu]: %p\n", p, i, *p);
    }
}

void test() {
    mpool_t *mp = mpool_create(sizeof(char), 4);
    EXPECT_NE(mp, NULL);
    mpool_print(mp);
    EXPECT_EQ(mpool_free_count(mp), 4);

    char *p = mpool_alloc(mp);
    *p = 'p';
    EXPECT_NE(mp, NULL);
    EXPECT_EQ(mpool_free_count(mp), 3);
    mpool_print(mp);

    mpool_free(mp, p);
    EXPECT_EQ(mp->mem[0], p);
    mpool_print(mp);

    char *a = mpool_alloc(mp);
    char *b = mpool_alloc(mp);
    char *c = mpool_alloc(mp);
    char *d = mpool_alloc(mp);
    *a = 'a';
    *b = 'b';
    *c = 'c';
    *d = 'd';
    EXPECT_EQ(mpool_free_count(mp), 0);
    EXPECT_NE(d, NULL);
    char *e = mpool_alloc(mp);
    EXPECT_EQ(e, NULL);
    mpool_print(mp);

    mpool_free(mp, d);
    EXPECT_EQ(mp->mem[0], d);
    EXPECT_EQ(mpool_free_count(mp), 1);
    mpool_print(mp);

    mpool_free(mp, a);
    EXPECT_EQ(mp->mem[0], a);
    EXPECT_EQ(mpool_free_count(mp), 2);

    mpool_destroy(mp);
}

void test_more() {
    mpool_t *mp = mpool_create(17, 3);
    EXPECT_NE(mp, NULL);
    EXPECT_EQ(mpool_free_count(mp), 3);
    mpool_print(mp);

    char *p = mpool_alloc(mp);
    EXPECT_EQ(mpool_free_count(mp), 2);
    strcpy(p, "hello");
    mpool_print(mp);

    char *a = mpool_alloc(mp);
    EXPECT_EQ(mpool_free_count(mp), 1);
    mpool_free(mp, p);
    EXPECT_EQ(mpool_free_count(mp), 2);

    mpool_alloc(mp);
    mpool_alloc(mp);
    char *d = mpool_alloc(mp);
    EXPECT_EQ(d, NULL);

    mpool_destroy(mp);
}

void test_perf() {

#define ITERATIONS 100000
#define BLOCK_SIZE 1024 

    mpool_t *mp = mpool_create(BLOCK_SIZE, ITERATIONS);
    EXPECT_NE(mp, NULL);

    clock_t start = clock();
    for (int i = 0; i < ITERATIONS; i++) {
        char *p = mpool_alloc(mp);
        p[0] = 'x';
        // mpool_free(mp, p);
    }
    clock_t end = clock();
    mpool_destroy(mp);

    double mpool_time_taken = ((double)(end - start)) / 1000;

    start = clock();
    for (int i = 0; i < ITERATIONS; i++) {
        char *p = (char*)malloc(BLOCK_SIZE);
        p[0] = 'y';
        // free(p);
    }
    end = clock();

    double malloc_time_taken = ((double)(end - start)) / 1000;
    
    printf("[mpool]  Time taken for %d iterations: %f ms\n", ITERATIONS, mpool_time_taken);
    printf("[malloc] Time taken for %d iterations: %f ms\n", ITERATIONS, malloc_time_taken);

}

int main() {
    test();
    test_more();
    test_perf();
    return 0;
}