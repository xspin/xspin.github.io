#include <stdio.h>
#include <stdlib.h>
#include "list.h"

struct node {
    int val;
    struct list_head list;
    int data;
};


void insert_node(struct list_head *head, int val) {
    struct node *new_node = (struct node *)malloc(sizeof(struct node));
    new_node->val = val;
    list_add_tail(&new_node->list, head);
}

void delete_node(struct node* node) {
    list_del(&node->list);
    free(node);
}

struct node* find_node(struct list_head *head, int val) {
    struct node *cur;
    list_for_each_entry(cur, head, list) {
        if (cur->val == val) {
            return cur;
        }
    }
    return NULL;
}

void print_list(struct list_head *head) {
    struct node *cur;
    list_for_each_entry(cur, head, list) {
        printf("%d, ", cur->val);
    }
    printf("\n");
}

int main() {
    struct list_head head;
    INIT_LIST_HEAD(&head);

    insert_node(&head, 1);
    insert_node(&head, 2);
    insert_node(&head, 3);
    insert_node(&head, 4);
    insert_node(&head, 5);

    struct node* n = list_first_entry(&head, struct node, list);
    printf("%d\n", n->val);

    print_list(&head);

    delete_node(find_node(&head, 3));
    print_list(&head);

    struct node *p;
    struct node *next;
    list_for_each_entry_safe(p, next, &head, list) {
        printf("del %d\n", p->val);
        list_del(&p->list);
        free(p);
    }
    printf("%d\n", list_empty(&head));
    return 0;
}