// 定义颜色代码
#define RED   "\x1B[31m"
#define GRN   "\x1B[32m"
#define RST   "\x1B[0m"

#define TAG "[ITEST] "

#define EXPECT_EQ(a, b) do { \
    if ((a) != (b)) { \
        printf(TAG RED "FAIL" RST " at %s:%d: " #a " == " #b "\n", \
               __FILE__, __LINE__); \
    } else { \
        printf(TAG GRN "PASS" RST " %s == %s\n", #a, #b); \
    } \
} while (0)

#define EXPECT_NE(a, b) do { \
    if ((a) == (b)) { \
        printf(TAG RED "FAIL" RST " at %s:%d: " #a " != " #b "\n", \
               __FILE__, __LINE__); \
    } else { \
        printf(TAG GRN "PASS" RST " %s != %s\n", #a, #b); \
    } \
} while (0)

#define EXPECT_FALSE(cond) do { \
    if (cond) { \
        printf(TAG RED "FAIL" RST " at %s:%d: " #cond " is true\n", __FILE__, __LINE__); \
    } else { \
        printf(TAG GRN "PASS" RST " %s is false\n", #cond); \
    } \
} while (0)

#define EXPECT_TRUE(cond) do { \
    if (!(cond)) { \
        printf(TAG RED "FAIL" RST " at %s:%d: " #cond " is false\n", __FILE__, __LINE__); \
    } else { \
        printf(TAG GRN "PASS" RST " %s is true\n", #cond); \
    } \
} while (0)
