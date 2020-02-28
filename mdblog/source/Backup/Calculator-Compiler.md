---
title: Calculator Compiler
date: 2020-01-01 15:03:17
tags: [lex, yacc, llvm, compile]
---


## 介绍


## lex 词法分析

```c
// C代码部分
%{
#include<string.h>
#include "y.tab.h"
%}

// 正则匹配
numbers ([0-9])+
plus "+"
minus "-"
times "*"
divide "/"
modulo "%"
lp "("
rp ")"
chars [A-Za-z]
words {chars}+
delim [ \n\t]
ws {delim}*

// 模式匹配规则及补充C代码处理
%%
{numbers} {
    sscanf(yytext, "%d", &yylval.val);
    return INTEGER;
}
{plus} {return PLUS;}
{minus} {return MINUS;}
{times} {return TIMES;}
{divide} {return DIVIDE;}
{modulo} {return MODULO;}
{lp} {return LP;}
{rp} {return RP;}
{ws}       ;
. {printf("Error");exit(1);}  
%%

```

## yacc 语法分析
```c
// c代码部分
%{
#include <stdio.h>
#include "lex.yy.c" //lex生成的分词c代码
#include "cal.h"  //自定义的数据结构
ExprAST *p;
%}

// 数据类型
%union {
    int val;
    ExprAST *ast;
}

// 声明项的返回数据
%type <val> INTEGER
%type <ast> expr factor

// 记号
%token BRACKET INTEGER PLUS MINUS TIMES DIVIDE MODULO LP RP 

%left PLUS MINUS
%left TIMES DIVIDE 
%left MODULO

// 语法规则及相应处理代码
%%
formula: 
    expr {printf("Expr_AST: \n"); std::vector<int> s; $1->print(s);};

expr: 
    expr PLUS expr {p = new ExprAST(PLUS); p->insert($1, $3); $$ = p;}
	| expr MINUS expr {p = new ExprAST(MINUS); p->insert($1, $3); $$ = p;}
	| expr TIMES expr {p = new ExprAST(TIMES); p->insert($1, $3); $$ = p;}
	| expr DIVIDE expr {p = new ExprAST(DIVIDE); p->insert($1, $3); $$ = p;}
	| expr MODULO expr {p = new ExprAST(MODULO); p->insert($1, $3); $$ = p;}
	| LP expr RP {p = new ExprAST(BRACKET); p->insert($2); $$ = p;}
    | factor {$$ = $1;}
	;

factor:
    INTEGER {p = new ExprAST($1); $$ = p;}
    ;

%%

// main及错误处理等函数
int main()
{
	return yyparse();
} 

void yyerror(char* s)
{
	fprintf(stderr,"%s",s);
} 

int yywrap()
{
	return 1;
}
```

**cal.h**

```c++
#ifndef __cal_H__
#define __cal_H__

#include <vector>
#include <cstdio>
#include <iostream>

class ExprAST {
    bool isleaf;
    int op;
    std::string mark;
    std::vector<ExprAST*> childs;

public:
    ExprAST(int op) {
        this->op = op;
        isleaf = true;
        switch(op) {
            case MINUS: mark = "MINUS"; break;
            case PLUS: mark = "PLUS"; break;
            case TIMES: mark = "TIMES"; break;
            case DIVIDE: mark = "DIVIDE"; break;
            case MODULO: mark = "MODULO"; break;
            case BRACKET: mark = "BRACKET"; break;
            default: mark = "UNK"; break;
        }
    }

    void insert(ExprAST* a=NULL, ExprAST* b=NULL) {
        if(a) childs.push_back(a);
        if(b) childs.push_back(b);
        if(a || b) isleaf = false;
    }

    void print(std::vector<int> &s, int d=0, bool isleaf=true) {
        std::cout << "  ";
        for(int i=1, k=1; i<s.size(); k++) {
            if(k == s[i]) {
                std::cout << "│   ";
                i++;
            } else {
                std::cout << "    ";
            }
            if(k == -s[i]) i++;
        }
        if(d>0) {
            if(isleaf) std::cout << "└── ";
            else std::cout << "├── ";
        }
        if(mark=="UNK") std::cout << op << std::endl;
        else std::cout << mark << std::endl;
        s.push_back(isleaf?-d:d);
        for(auto &a : childs) {
            a->print(s, d+1, a==childs.back());
        }
        s.pop_back();
    }

};

#endif

```

