	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 12, 0	sdk_version 12, 3
	.globl	_demonstrate_memory_areas       ## -- Begin function demonstrate_memory_areas
	.p2align	4, 0x90
_demonstrate_memory_areas:              ## @demonstrate_memory_areas
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movl	$50, -4(%rbp)
	movl	-4(%rbp), %esi
	leaq	-4(%rbp), %rdx
	leaq	L_.str.1(%rip), %rdi
	movb	$0, %al
	callq	_printf
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_main                           ## -- Begin function main
	.p2align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movl	$0, -4(%rbp)
	movl	$30, -8(%rbp)
	movl	$4, %edi
	callq	_malloc
	movq	%rax, -16(%rbp)
	cmpq	$0, -16(%rbp)
	jne	LBB1_2
## %bb.1:
	movq	___stderrp@GOTPCREL(%rip), %rax
	movq	(%rax), %rdi
	leaq	L_.str.2(%rip), %rsi
	movb	$0, %al
	callq	_fprintf
	movl	$1, -4(%rbp)
	jmp	LBB1_3
LBB1_2:
	movq	-16(%rbp), %rax
	movl	$40, (%rax)
	callq	_demonstrate_memory_areas
	movl	_global_var(%rip), %esi
	leaq	L_.str.3(%rip), %rdi
	leaq	_global_var(%rip), %rdx
	movb	$0, %al
	callq	_printf
	movq	_global_uninit_var@GOTPCREL(%rip), %rax
	movl	(%rax), %esi
	leaq	L_.str.4(%rip), %rdi
	movq	_global_uninit_var@GOTPCREL(%rip), %rdx
	movb	$0, %al
	callq	_printf
	movl	_static_var(%rip), %esi
	leaq	L_.str.5(%rip), %rdi
	leaq	_static_var(%rip), %rdx
	movb	$0, %al
	callq	_printf
	movl	-8(%rbp), %esi
	leaq	-8(%rbp), %rdx
	leaq	L_.str.6(%rip), %rdi
	movb	$0, %al
	callq	_printf
	movq	-16(%rbp), %rax
	movl	(%rax), %esi
	movq	-16(%rbp), %rdx
	leaq	L_.str.7(%rip), %rdi
	movb	$0, %al
	callq	_printf
	movq	_const_str(%rip), %rsi
	movq	_const_str(%rip), %rdx
	leaq	L_.str.8(%rip), %rdi
	movb	$0, %al
	callq	_printf
	movq	-16(%rbp), %rdi
	callq	_free
	movl	$0, -4(%rbp)
LBB1_3:
	movl	-4(%rbp), %eax
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__DATA,__data
	.globl	_global_var                     ## @global_var
	.p2align	2
_global_var:
	.long	10                              ## 0xa

	.section	__TEXT,__cstring,cstring_literals
L_.str:                                 ## @.str
	.asciz	"Hello, World!"

	.section	__DATA,__data
	.globl	_const_str                      ## @const_str
	.p2align	3
_const_str:
	.quad	L_.str

	.section	__TEXT,__cstring,cstring_literals
L_.str.1:                               ## @.str.1
	.asciz	"Local variable in function: %d, Address: %p\n"

L_.str.2:                               ## @.str.2
	.asciz	"Memory allocation failed\n"

L_.str.3:                               ## @.str.3
	.asciz	"Global variable: %d, Address: %p\n"

L_.str.4:                               ## @.str.4
	.asciz	"Global uninit variable: %d, Address: %p\n"

	.comm	_global_uninit_var,4,2          ## @global_uninit_var
L_.str.5:                               ## @.str.5
	.asciz	"Static variable: %d, Address: %p\n"

	.section	__DATA,__data
	.p2align	2                               ## @static_var
_static_var:
	.long	20                              ## 0x14

	.section	__TEXT,__cstring,cstring_literals
L_.str.6:                               ## @.str.6
	.asciz	"Stack variable: %d, Address: %p\n"

L_.str.7:                               ## @.str.7
	.asciz	"Heap variable: %d, Address: %p\n"

L_.str.8:                               ## @.str.8
	.asciz	"Constant string: %s, Address: %p\n"

.subsections_via_symbols
