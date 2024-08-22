---
tags:
  - notes
  - cybersecurity
  - operating-systems
---

---

This note goes over **buffer overflow vulnerabilities**, and how exploits can be conducted using them. If you wish to go over **security mechanisms** to mitigate attacks using buffer overflows (aka **dynamic protection**), please check [this note](/docs/Operating%20Systems/Cybersecurity/Security%20Mechanisms/Dynamic%20Protection.md).

---

Buffer overflows are anomalies in computers, that happen when a program tries to write to a certain **contiguous memory space** (buffer) more data than the **allocated data** to that buffer (resulting in a **buffer overflow**).

But why are buffer overflows dangerous? Buffer overflows can happen accidentally (due to bugs), and its effects have **no impact security-wise**. However, an attacker can intentionally cause a buffer overflow, with the objective of **running code with superuser privileges.** An attacker can also use this to **steal data** (buffer overread in this case).

## Cause

The cause for buffer overflows has to do with how the **C/C++** languages work; <mark>these languages do not verify if data being written exceeds the capacity of a buffer/array/vector.</mark> Buffer overflows cannot be exploited in languages like **Java/C#**, as these languages do this type of verifications at runtime.

The problem, whilst being related with C/C++, is present in a **set of vulnerable functions** that should never be used, like:

- _gets()_
- _strcpy()_
- _sprintf()_
- _scanf()_

## Defending against BOs

The solution against buffer overflows attacks is simple: <mark>always perform bounds checking</mark>. This can be done manually, or through replacing unsafe functions (the one above) by **safe functions** (these perform bounds checking).

### Example: _gets()_

**Wrong:**
Never use _gets()_ !

```c
char buf[1024];
gets (buf);
```

**Right:**

```c
char buf [BUFSIZE];
fgets (buf, BUFSIZE, stdin);
```

### Example: _strcpy()_

**Solution 1:**

```c
if (strlen (src) >= dst_size) {
	/* throw an error */
} else
	strcpy (dst, src)
```

**Solution 2:**

```c
strncpy (dst, src, dst_size - 1);
dst [dst_size - 1] = ‘\0’;
```

**Solution 3:**

```c
dst = (char *) malloc (strlen(src) + 1);
strcpy (dst, src)
```

## Stack Smashing

Stack smashing is the classical buffer overflow attack. Here is an example of code that is vulnerable to this attack:

<pre>
<code>
void test(char *<span class="lightgreen">s</span>) {'{'}
&emsp;&emsp;char <span class="lightSkyBlue"><b>buf</b></span>[10]; &emsp;&nbsp;&nbsp;// gcc stores extra space
&emsp;&emsp;<b><span class="orange">strcpy(</span><span class="lightSkyBlue">buf</span><span class="orange">, </span><span class="lightgreen">s</span><span class="orange">); &emsp;// does not check buffer’s limit</span></b>
&emsp;&emsp;printf("&s = %p\n&buf[0] = %p\n\n", &s, buf);
} 

main(int argc, char **argv){'{'}
&emsp;&emsp;test(argv[1]);
}
</code>
</pre>
**Example Code 1:** Stack Smashing vulnerable code

Here, _strcpy_ simply copies the content of **<span class="lightgreen">s</span>** into **<span class="lightSkyBlue">buf</span>**, without checking the length of <span class="lightgreen">s</span>, which can lead to content being written **after** the allocated space for **<span class="lightSkyBlue">buf</span>**. These writes are used in stack smashing attacks, and the attacker can use this for several effects; to understand what can the attacker do, we first need to understand **the stack layout**.

### Stack Layout

The following image depicts the general layout of the stack:

![Stack Layout with arrows.png](../img/Stack%20Layout%20with%20arrows.png)<br></br>
**Fig.1:** Stack Layout; the red arrows point to the "targets" of stack smashing attacks

In stack smashing attacks, the overflow can happen in two places:

- **Local vars**
- **Saved EIP**

The possible effects that this can have are:

- **Change state of program**
- **Crash program**
- **Execute code**

Now that we know the general layout of the stack, we will take a look at the assembly code of the code presented above (**Example Code 1**).

### Stack Smashing Attack

<pre>
<code>
test 
	push ebp
	mov ebp,esp
	sub esp,0x14    &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;// <span class="orange">allocate buffer</span>
	
	----------------------------------------------------- <span class="orange">strcpy part</span>

	mov eax,DWORD PTR [ebp+0x8] &emsp;&emsp;&nbsp;// <span class="orange">corresponds to the loading of </span><span class="lightSkyBlue">s</span><span class="orange">.
	                            &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Notice that </span><span class="lightSkyBlue">s</span> <span class="orange"> is 8 chars below
	                            &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;the ebp (return address)</span>
	
	sub esp,0x8 
	push eax &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;//<span class="orange"> add &s to stack </span>
	
	lea eax,[ebp-0x12] &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;// <span class="orange">corresponds to the loading of </span><span class="lightgreen">buf</span><span class="orange">.
						&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Notice that </span><span class="lightgreen">buf</span> <span class="orange"> is 0x12 = 18 chars above
						&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;the ebp (return address)</span>
	
	push eax &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;//<span class="orange"> add &buf to stack </span>
	call strcpy

	\-----------------------------------------------------
	
	... 
	ret &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;// <span class="orange">jumps to return address</span>
main: 
	... 
	call test
</code>
</pre>

:::note[Important]
 Notice how memory space for <span class="lightgreen">buf</span> is allocated _**above**_ the return address, and memory space of <span class="lightSkyBlue">s</span> is _**below**_ return address. This is because of the **stack layout presented in Fig.1**: if you look at that figure, in the stack frame for the first function, we can see that <span class="green">local vars function</span> is above the return address, and <span class="orange">parameters function</span> in the main stack frame (which is the case of <span class="lightSkyBlue">s</span>), is below the return address of 1st function.
:::

There are a couple of important things we can take from this assembly code. In the first two lines we can see that we "save" the previous function's (_`main()`_) stack pointer in the **`ebp`** register. Then, we proceed to allocate 18 bytes for <span class="lightgreen">buf</span> (right above the saved **`ebp`** and **return address** (saved **`eip`**)). Therefore, when we **overflow** <span class="lightgreen">buf</span>, the first affected memory locations correspond to **`ebp`** and **`eip`**.

Up next is an image that makes this much clearer:

![Stack layout in allocation of variables.png](../img/Stack%20layout%20in%20allocation%20of%20variables.png)<br></br>
**Fig.2:** Location of variables in stack

From this we can take the following conclusion: <mark>by overflowing <span class="lightgreen">buf</span>, we can alter the content of **ebp**, and potentially the **return address** of the function</mark>. But what is the purpose of changing the return address to an attacker? The answer is that, if the attacker provides the right input, he can effectively **call other functions** that wouldn't be called in the normal execution of the program, thus **controlling the flow** of the program.

Let's take a modified version of the **Example Code 1:**

<pre><code>
<span class="red">
void cannot(){'{'} 
	puts("This function cannot be executed!\n");
	 exit(0);
} 
</span>

void test(char *<span class="lightgreen">s</span>) {'{'} 
	char <b><span class="lightSkyBlue">buf</span></b>[10]; // gcc stores extra space
	<b><span class="orange">strcpy(</span><span class="lightSkyBlue">buf</span><span class="orange">, </span><span class="lightgreen">s</span><span class="orange">); // does not check buffer’s limit</span></b>
	printf("&s = %p\n&buf[0] = %p\n\n", &s, buf);
} 

main(int argc, char **argv){'{'}
	<span class="red">printf("&cannot = %p\n", &cannot);</span>
	test(argv[1]);
}
</code>
</pre>

The question is: **are we able to call _cannot()_ ?** Here is what we are trying to achieve, in a shortened version of the assembly code of this program:

![return address subversion.png](../img/return%20address%20subversion.png)<br></br>
**Fig.3:** Can we call <span class="red">cannot</span>?

To call <span class="red">cannot</span>, we first need to know its address (can try to guess). If the address of <span class="red">cannot</span> is, for example, **`0x80484b6`**, we can successfully redirect the flow of the program with the following input:

```python
b"x"*22 + b”\xb6\x84\x04\x08"
```

Here we assume we know the address, but in a real world scenario, how can an attacker know the address? It depends whether the attacker **has access to the code:**

- **With the code:** Analyze memory (_gdb_)
- **Without the code:** Trial and error

#### Code Injection

In the [previous chapter](#stack-smashing-attack) we saw how we could use stack smashing to alter the **control flow** of a program; however, this is not the only thing we can do, as it is possible to **inject shell code**. To way we do this depends on the OS:

- In Unix, make program give a **shell:** _/bin/sh_
- In Windows, install rootkit/RAT

##### Code Injection in Unix

In Unix, the following code can span a shell:

```c
char *args[] = {“/bin/sh”, NULL};
execve(“/bin/sh”, args, NULL};
```

This corresponds to the following assembly code:

<pre>
<code>
xor  %eax, %eax                       // %eax=0
movl %eax, %edx                       // %edx = envp = NULL
movl \$address_of_bin_sh, %ebx         //%ebx = /bin/sh 
movl \$address_of_argv, %ecx           //%ecx = args 
movl \$0x0b, %al                       //syscall number for execve() 
int  \$0x80                            //do syscall
</code>
</pre>

The last two lines serve the purpose of calling the **execve syscall**. System calls serve for several purposes; the execve syscall makes the OS launch a certain program, in this case a shell. There is more info about syscalls [here](#additional-content).

#### Difficulties with Code Injection

Injecting code using vulnerable programs is not simple, as there are many difficulties/restraints with what an attacker can do. These are some of the main problems an attacker can encounter:

- **Lack of space** for code
  - Forces attacker to reduce code
- Code may not include **zeros/_NULL_ bytes**
  - Some functions like _strcpy()_ stop at the first **`\0`**
  - Substitute places with zeros by equivalent code:
    - <span class="red">mov eax, 0</span> -> <span class="green">xor eax, eax</span>
- Difficulties discovering **address** where code is injected
- Stack **has to be executable** (usually is)
  - If it isn't there are other ways to attack: [next chapter](#return-to-libc)

### Return to _libc_

One other way to exploit buffer overflows is through inserting a new **arc** in the **control flow graph** of the program (arc is simply another node in the graph). This means inserting a new call to a function in the program, but this time **from the _libc_ library** (C standard library), and typically to the **`system()`** function of _libc_.

This type of attack is **effective against non-executable stacks**, because it calls a function of _libc_, which doesn't belong to the stack. Also, the **`system()`** function executes anything that it is passed to it, making it a good candidate for these types of attacks

The following code is an example of the attack using this (**`R`** should contain the address of **attacker supplied data**):

```c
void system(char *arg){
	check_validity(arg); //bypass this
	R=arg;
}

target: execl(R, …); //target is usually fixed
```

### Pointer Subterfuge

So far we have seen two types of exploits with buffer overflows: **[code injection](#code-injection)** and **[return address alteration](#stack-smashing-attack)**. But there is another effect we can achieve with buffer overflows: **pointer modification**; these types of exploits go by the name of **pointer subterfuge**, and there are several types:

- **Function-pointer clobbering**
  - Modify a function pointer to point to attacker supplied code
- **Data-pointer modification**
  - Modify address used to assign data
- **Exception-handler hijacking**
  - Modify pointer to an exception handler function
- **Virtual pointer smashing**
  - Modify the C++ virtual function table associated with a class

#### Function-pointer clobbering

Function-pointer clobbering aims at changing a function's pointer, to point to the code desired by the attacker (usually this **malicious code** is provided by the attacker). Here is a code example:

```c
void f2a(void * arg, size_t len) {

	void (*f)() = ...;      /* function pointer */
	char buff[100];
	memcpy(buff, arg, len); /* buffer overflow! We want to overwrite f with
	                           address of malicious code in buff*/

	f();                    /* call function f*/
	return;
}
```

Here is a diagram of what the stack will look like in this program:

![Stack of function pointer clobbering code example.png](../img/Stack%20of%20function%20pointer%20clobbering%20code%20example.png)<br></br>
**Fig.4:** Example of stack of code above

As we can see, if we overflow **`buff`**, the first memory chunks being affected are the chunks belonging to **`f`**. We can then change the address of **`f`** arbitrarily, and make it point to a desired location (maybe code present in **`buff`**, variable that is controlled by the attacker).

:::info[Important]
This type of attack combines well with **arc injection/return to libc** (make f point to **`system`**)
:::

#### Data-pointer modification

In data-pointer modification, the attacker aims at changing a pointer used to assign a value, with the objective of making **arbitrary memory writes**. Up next is some example code:

```c
void f2b(void * arg, size_t len) {

	long val = ...;
	long *ptr = ...;
	char buff[100];
	extern void (*f)();
	memcpy(buff, arg, len); /* buffer overflow! */

	*ptr = val; /* A buffer overflow in buff can overwrite
		       ptr and val, allowing us to write 4 bytes
		       of arbitrary values to the memory*/

	f(); /* ... */
	return;
}
```

#### Exception-handler hijacking

This next type of pointer subterfuge is possible in **Windows OS**, but to understand it we need to understand **how Windows handles exceptions**.

Windows keeps exception handlers in a linked list, called **Windows Structured Exception Handler** (SEH). When an exception occurs, the OS will iterate over this linked list; when it finds the correct exception handler corresponding to that exception, it will call that exception handler.

The important thing to note is that **SEH is stored in the stack** (and therefore vulnerable to buffer overflow attacks). A typical attack would:

1. Change entries of SEH to point to **attacker's malicious code**, or to **libc**
2. **Generate an exception** (e.g., an exception is generated when stack base pointer is overwritten)

To prevent this, **validity** and **integrity** checking of SEH were introduced in Windows.

#### Virtual pointer smashing

Virtual pointer smashing takes advantage of a characteristic of the **C++ language**: most C++ compilers keep the functions of each class in a **_virtual function table_** (VTBL). This table is simply an array of function pointers, pointing to the functions corresponding to the methods of a certain class (there is a VTBL for each different class).

To access a VTBL, each **object** keeps a **_virtual table pointer_** (VPTR) to the its class VTBL. The attack simply consists in **altering the VPTR**, to point to **supplied code by the attacker**, or to **libc** (similar to attacks we have seen previously).

Here is a snippet of code vulnerable to this type of attack:

<pre>
<code>
void f4(void * arg, size_t len) {'{'}
&emsp;&emsp;C *ptr = new C;
&emsp;&emsp;char *buff = new char[100];
&emsp;&emsp;<span class="orange">memcpy(buff, arg, len);   // buffer overflow!
&emsp;&emsp;ptr -> vf();              // call to a virtual function </span> 
&emsp;&emsp;return;
}
</code>
</pre>

### Off-by-one errors

The main way to prevent buffer overflows is through **bounds checking**. However, we still need to be careful to **not make mistakes** while performing bounds checking. Let's take a look at the following code snippet:

```c
int get_user(char *user) {
	char buf[1024];
	if (strlen(user) > sizeof(buf))
		 handle_error (“string too long”);
	strcpy(buf, user);
}
```

All seems well with this code: before calling _strcpy_, we check if the length of the provided user string **is greater** than the size of the **`buf`** variable. However, there is a mistake in this code: **`sizeof(buf)`** always return 1024, but the user might provide a string of **1024 chars** **_plus_** a '\0' in the end, making **`strlen(user)`** return 1024 (_strlen_ doesn't count the '\0'), which means that the if statement returns **true**, but _strcpy_ will in fact copy 1025 bytes into **`buf`**, **_overflowing 1 byte_**. These types of overflows are called **off-by-one errors**.

But what is the possible harm caused by overflowing just one byte? To understand this we need to remind ourselves of the **stack layout:**

![Stack Layout off-by-one error.png](../img/Stack%20Layout%20off-by-one%20error.png)<br></br>
**Fig.5:** Stack layout

As we can see, the address immediately after **`buf`** corresponds to the **saved ebp** (base pointer). If we consider that the saved ebp's length is 4 bytes, if the attacker sets the last char of the provided string **equal to 0**, then he is setting **the most significant byte** of ebp **equal to 0**. This means that ebp is reduced by **0 to 255 bytes**. This makes the saved ebp point to a different location, and the attacker is able to **change local variables/return address** (like it is shown in Fig.5).

### Return-Oriented Programming Attacks

The [return to libc attacks](#return-to-libc) we saw previously have a major impracticality to use as an exploit: **they don't work well in 64-bit CPUs** (because parameters of 1st function are put in registers). An alternative to this is **return-oriented programming** (ROP).

In ROP attacks, we analyze assembly code looking for **`ret`** calls (in machine code, **`c3`**). The sequence of instructions preceded by **`ret`** are called **gadgets**.

<span class="admonitionWithoutIcon">
:::tip[Gadget]
Sequence of instructions ending with **`ret`**
:::
</span>

Gadgets might not necessarily be included in the original code: we just need to find **`c3`** instructions. Here is an example of this:

![ret example.png](../img/ret%20example.png)<br></br>
**Fig.6:** ret example

The job of an attacker in return-oriented programming attacks is to analyze binary code, **find instructions sequences ending in `c3`** (gadgets), and collect the addresses of these gadgets. Finally, to run the attack the attacker should:

1. Overflow the stack with addresses of gadgets
2. Overflow the stack with other data the gadgets may pick from the stack

Here is an example of this:

![return oriented programming attack example.png](../img/return%20oriented%20programming%20attack%20example.png)<br></br>
**Fig.7:** Example of a diagram of a return-oriented programming attack

## Integer Overflows

Integer overflows are often related to the **improper assignment** of the several data types that can be used to represent integers (signed vs unsigned, long vs short, etc.). Integer semantics are often complex, and programmers don't fully know all the details, which can lead to problems in several languages (but especially C/C++). The **4 possible problems** that can occur from assigning different types of integer types are:

- **Overflow**
- **Underflow**
- **Signedness error**
- **Truncation**

These problems can lead to **5 possible exploits:**

- **Insufficient memory allocation** -> BO -> attacker code execution
- **Excessive memory allocation/infinite loop** -> denial of service
- **Attack against array byte index** -> overwrite arbitrary byte in memory
- **Attack to bypass sanitization** -> cause a BO -> ...
- **Logic errors** (e.g., modify variable to change program behaviour)

We will now take a closer look at each of the **problems described above.**

### Overflow

Overflow problem is the **most common integer overflow form**, and it happens when the result of an expression **exceeds** the maximum value used by a certain data type (e.g., max size of int is **2147483647**).

Let's take a closer look at this code example:

```c
void vulnerable(char *matrix, size_t x, size_t y, char val){
    int i, j;
    matrix = (char *) malloc (x*y);
    for (i=0; i < x; i++){
        for(j = 0; j < y; j++){
            matrix[i*y+j] = val;
        }
    }
}
```

The problem with this code is that if <span class="red">x \* y > MAXINT</span>, then _malloc_ doesn't reserve enough memory.

### Underflow

Underflow are usually related to **subtractions** of unsigned types, e.g. subtracting $0 - 1$ and storing the result in a **unsigned int**. This problem is rarer than overflow, as it only happens with subtraction.

Here is a real-world example _(Netscape JPEG comment length vulnerability)_:

<pre>
<code>
void vulnerable(char \*src, <span class="red">size_t</span> len)&#123;
&emsp;&emsp;<span class="red">size_t</span> real_len;
&emsp;&emsp;char \*dst;
&emsp;&emsp;if (len < MAX_SIZE) &#123;
        <span class="red">          real_len = len - 1;
        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dst = (char \*) malloc(real_len);
        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;memcpy(dst, src, real_len);</span>
	&emsp;&emsp;&#125;
                        <span class="orange">                                   /\* if len = 0</span>
                        <span class="orange">                                   then real_len = FFFFFFFF</span>
                        <span class="orange">                                   malloc allocs FFFFFFFF bytes \*/</span>
&#125;
</code>
</pre>

### Signedness Error

In these cases what happens is a **signed integer** is assigned to an **unsigned variable**, or vice-versa. One example of what can result from this is if a **positive unsigned integer** is assigned to a **signed integer variable**; if the number being assigned is larger than $2^{31}$, this means that the most significant bit is 1, and therefore a signed variable will interpret it as **negative**.

The following example illustrates this:

<pre>
<code>
void vuln(char \*src, <span class="red">size_t</span> len)\{
&emsp;&emsp;<span class="red">int</span> real_len;
&emsp;&emsp;char \*dst;
&emsp;&emsp;if (len > 1) \{
&emsp;&emsp;&emsp;&emsp;<span class="red">real_len = len - 1;</span>
&emsp;&emsp;&emsp;&emsp;if (real_len < MAX_SIZE) \{
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<span class="red">dst=(char \*) malloc(real_len);
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;memcpy(dst, src, real_len);</span>
&emsp;&emsp;&emsp;&emsp;\}
&emsp;&emsp;\}
\}                    <span class="orange"> /\* line 5 is negative if len > 2^(31)</span>
</code>
</pre>

### Truncation

This error happens when we assign a value of data type that can hold numbers of greater lengths to a data type that can hold smaller lengths (e.g, assign _long_ to _short_). This can lead to **unauthorized writes** to memory.

Take a look at the following example:

<pre><code>
void vuln(char \*src, <span class="red">unsigned</span> len) \{
&emsp;&emsp;<span class="red">unsigned</span> short real_len;
&emsp;&emsp;char \*dst;

&emsp;&emsp;real_len = len;

&emsp;&emsp;if (real_len < MAX_SIZE) \{
&emsp;&emsp;&emsp;&emsp;<span class="red">dst = (char \*)malloc(real_len);
&emsp;&emsp;&emsp;&emsp;strcpy(dst, src);</span>
&emsp;&emsp;\}
\}

</code>
</pre>

The problem with this code is that the value in **`real_len`** might become become truncated, leading to **insufficient memory** being allocated by **`malloc`**. Because of this, **`dst`** might not have enough memory allocated to it, leading to _strcpy_ overwriting memory after **`dst`**.

## Heap Overflows

So far we have only seen overflows that affect memory in the **stack**. However, as one can imagine, an attacker can also take advantage of buffer overflows to influence data in the **heap**.

Let's take a look at the following code example:

<pre>
<code>
main(int argc, char \*\*argv) \{
&emsp;&emsp;int i;
&emsp;&emsp;char \*str = (char \*)malloc(4);
&emsp;&emsp;char \*critical = (char \*)malloc(9);
&emsp;&emsp;strcpy(critical, "secret");
&emsp;&emsp;<span class="red">strcpy(str, argv[1]);</span>
&emsp;&emsp;printf("%s\n", critical);
\}
</code>
</pre>

The heap resultant of this program would look something like this:

![heap diagram.png](../img/heap%20diagram.png)<br></br>
**Fig.8:** Variables **`str`** and **`critical`\_** allocated in the heap

Let's say we created a program that analyzes the memory and prints the **content of each memory position**, starting in **`str`** and ending in the end of memory allocated to **`critical`** (you can find this code [here](#code-to-write-memory-content)). If we provided as input the string **`"xyz"`** to the program above , the resulting memory content would be this:

<pre>
<code>
Address of str is: 0x80497e0
Address of critical is: 0x80497f0
<span class="red">0x80497e0: x (0x78)
0x80497e1: y (0x79)
0x80497e2: z (0x7a)</span>
0x80497e3: ? (0x0)
0x80497e4: ? (0x0)
0x80497e5: ? (0x0)
0x80497e6: ? (0x0)
0x80497e7: ? (0x0)
0x80497e8: ? (0x0)
0x80497e9: ? (0x0)
0x80497ea: ? (0x0)
0x80497eb: ? (0x0)
0x80497ec: ? (0x11)
0x80497ed: ? (0x0)
0x80497ee: ? (0x0)
0x80497ef: ? (0x0)
<span class="green">0x80497f0: s (0x73)
0x80497f1: e (0x65)
0x80497f2: c (0x63)
0x80497f3: r (0x72)
0x80497f4: e (0x65)
0x80497f5: t (0x74)</span>
0x80497f6: ? (0x0)
0x80497f7: ? (0x0)
0x80497f8: ? (0x0)
</code>
</pre>

However, if we take a look at the code, we can see that bounds checking is not performed on the string given by the user, and therefore the second _strcpy_ can cause a **buffer overflow**. If that overflow is long enough, we can **change the value of `critical`**.

To do this, we can run the code with the following input: **`"xyz1234567890123FooBar"`**. If we run our memory printing program, we get the following output:

<pre><code>Address of str is: 0x80497e0
Address of critical is: 0x80497f0
<span class="red">0x80497e0: x (0x78)
0x80497e1: y (0x79)
0x80497e2: z (0x7a)</span>
0x80497e3: 1 (0x0)
0x80497e4: 2 (0x0)
0x80497e5: 3 (0x0)
0x80497e6: 4 (0x0)
0x80497e7: 5 (0x0)
0x80497e8: 6 (0x0)
0x80497e9: 7 (0x0)
0x80497ea: 8 (0x0)
0x80497eb: 9 (0x0)
0x80497ec: 0 (0x11)
0x80497ed: 1 (0x0)
0x80497ee: 2 (0x0)
0x80497ef: 3 (0x0)
<span class="green">0x80497f0: F (0x73)
0x80497f1: o (0x65)
0x80497f2: o (0x63)
0x80497f3: B (0x72)
0x80497f4: a (0x65)
0x80497f5: r (0x74)</span>
0x80497f6: ? (0x0)
0x80497f7: ? (0x0)
0x80497f8: ? (0x0)</code></pre>

## Additional Content

### Syscall Table

![System Calls Table.png](../img/System%20Calls%20Table.png)<br></br>
**Fig.9:** Table with some of Linux's syscalls

### Code to Write Memory Content

```c
main(int argc, char **argv) {
	int i;
	char *str = (char *)malloc(4);
	char *critical = (char *)malloc(9);
	char *tmp;
	printf("Address of str is: %p\n", str);
	printf("Address of critical is: %p\n", critical);
	strcpy(critical, "secret");
	strcpy(str, argv[1]);
	tmp = str;
	while(tmp < critical + 9) { // print heap content
		printf("%p: %c (0x%x)\n",
				tmp, isprint(*tmp) ? *tmp: '?', (unsigned)(*tmp));
		tmp += 1;
	 }
	printf("%s\n", critical);
}
```
