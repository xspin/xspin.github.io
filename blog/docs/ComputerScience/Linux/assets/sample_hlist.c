#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include "list.h"

#define M 7

typedef struct hash_node {
    int data;
    struct hlist_node hlist;
    
} hash_node_t;

typedef struct hash {
    int size;
    struct hlist_head hhead[0];
} hash_t;

hash_t *hash_create() {
    hash_t *h = (hash_t *) malloc(sizeof(hash_t) + sizeof(struct hlist_head) * M);
    assert(h);
    h->size = M;
    for (int i=0; i<h->size; i++) {
        INIT_HLIST_HEAD(h->hhead + i);
    }
    return h;
}

int hash_hash(int val) {
    return val % M;
}

void hash_free(hash_t *h) {
    free(h);
}

void hash_insert(hash_t *h, int val) {
    hash_node_t *node = (hash_node_t *)malloc(sizeof(hash_node_t));
    assert(node);
    node->data = val;
    INIT_HLIST_NODE(&node->hlist);
    hlist_add_head(&node->hlist, h->hhead + hash_hash(val));
}

hash_node_t *hash_find(hash_t *h, int val) {
    hash_node_t *node;
    int idx = hash_hash(val);
    hlist_for_each_entry(node, h->hhead + idx, hlist) {
        if (node->data == val) {
            return node;
        }
    }
    return NULL;
}

void hash_delete(hash_t *h, int val) {
    hash_node_t *node;
    struct hlist_node *next;
    int idx = hash_hash(val);
    hlist_for_each_entry_safe(node, next, h->hhead + idx, hlist) {
        if (node->data == val) {
            hlist_del(&node->hlist);
            free(node);
        }
    }
}

void hash_print(hash_t *h) {
    hash_node_t *node;
    printf("----- %p -----\n", h);
    for (int i=0; i<h->size; i++) {
        printf("[%d]: ", i);
        hlist_for_each_entry(node, h->hhead + i, hlist) {
            printf("%d, ", node->data);
        }
        printf("\n");
    }
}

int main() {
    hash_t *h = hash_create();
    hash_insert(h, 1);
    hash_insert(h, 1);
    hash_insert(h, 2);
    hash_insert(h, 5);
    hash_insert(h, 7);
    hash_insert(h, 9);
    hash_insert(h, 9);
    hash_node_t *node = hash_find(h, 9);
    printf("find %p: %d\n", node, node->data);

    hash_print(h);

    hash_delete(h, 9);
    hash_print(h);

    hash_free(h);

    return 0;
}