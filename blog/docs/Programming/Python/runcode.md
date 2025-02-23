# 代码块支持运行

```json
// 请求数据示例
// POST http://host
{
    "lang": "python",
    "code": "cHJpbnQoJ0hlbGxvIFdvcmxkJyk="
}

// 响应数据示例
{
    "success": true,
    "output": "Hello World\n",
    "data": {},
    "elapsed": 10
}
```


## 后端
首先需要一个后端服务器用于处理和运行代码，下面是一个python实现的服务器：

@import "assets/codeserver.py"


## 插件
然后实现一个docsify插件：

@import "/assets/script/plugin-run-code.js"


## 示例

### 示例：运行python代码
```python
def add(a, b):
    return a + b

print(add(3, 4))
```

异常场景：

```python
print(add(3, 4))
```

### 示例：运行c代码
```c
#include <stdio.h>
int main() {
    printf("Hello World! from c");
}
```

异常场景 - 编译错误：
```c
#include <stdio.h>
int main() {
    printf("Hello World! %d", a);
}
```

异常场景 - 运行时错误：
```c
#include <stdio.h>
int main() {
    int *p = NULL;
    *p = 2;
}
```

### 示例：运行c++代码
```cpp
#include <iostream>

int main() {
    std::cout << "Hello World! from cpp" << std::endl;
}
```

### 示例：运行js代码
```javascript
function sum(a, b) {
    for (let i=0; i < 1000000; i++) {
        a += i;
    }
    return a + b;
}

const c = sum(1, 3);
console.log("c = " + c);
// alert("hi");
c
```

异常场景：
```javascript
var c = a + b;
```

### 示例：运行go代码
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```


### 示例：运行rust代码
```rust
fn main() {
    let x: i32 = 5;
    let mut y: i32 = 10;
    y = 20;
    println!("x: {}, y: {}", x, y);
}
```


### 示例：json 解析和格式化
```json
{ "data": {
        "a": 11, "b": "test",
        "c": ["test", "中文测试"]
    }
}
```