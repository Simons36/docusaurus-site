---
tags:
  - notes
  - operating-systems
  - cybersecurity
toc_max_heading_level: 4
---

---

This note will address not only dynamic protection itself, but also several topics related to existing operating systems vulnerabilities, like **buffer overflows** and **format strings**. If you wish, you can learn more about these vulnerabilities in the following notes:

- **[Buffer Overflows](/docs/Operating%20Systems/Cybersecurity/Vulnerabilities/Buffer%20Overflows.md)**
- **[Format Strings](/docs/Operating%20Systems/Cybersecurity/Vulnerabilities/Format%20Strings.md)**

---

Of the many types of existing vulnerabilities, perhaps the most pervasive are the ones that cause **memory corruption:** the cases of **[buffer overflows](/docs/Operating%20Systems/Cybersecurity/Vulnerabilities/Buffer%20Overflows.md)** and **[format strings](/docs/Operating%20Systems/Cybersecurity/Vulnerabilities/Format%20Strings.md)**. While there are known methods to effectively prevent these vulnerabilities from appearing, it wouldn't be a good idea to assume that these vulnerabilities will simply disappear. This is where **dynamic protection** comes in: its objective is to **block and mitigate** memory corruption attacks, when they do happen.

In this note we will take a look at a couple of dynamic protection mechanisms like:

- **[Canaries / Stack Cookies](#canaries--stack-cookies)**
- **[Non-executable stack and heap](#non-executable-stack-and-heap)**
- **[Randomization and Obfuscation](#randomization-and-obfuscation)**
- **[Integrity Verification](#integrity-verification)**
- **[Filtering](#filtering)**

## Canaries / Stack Cookies

:::info[Important]

Canaries aim at detecting buffer overflow attacks; to understand how these attacks work please check **[this note](/docs/Operating%20Systems/Cybersecurity/Vulnerabilities/Buffer%20Overflows.md)**.

:::

In the context of **buffer overflows**, one of the main mechanisms to **detect** these types of exploits is using **canaries** (aka stack cookies). Canaries are **32-bit random values**, that are placed in a strategic position in the **stack** (in compile time); if their value is changed, it means that **an overflow has occurred**.

The following example code and stack diagram make this clearer:

```c
void test(char *s) {

  push canary;
  char buf[10];
  strcpy(buf, s);
  …

  if (canary is changed){
    log;
    exit;
  };

}
```

:::info[Important]
Keep in mind that, in spite of the canary implementation being explicit in this code, this is done implicitly by the **compiler**
:::

![Canary placed after overflowable variable **`buf`**](../img/Pasted%20image%2020240126011039.png)<br></br>
**Fig.1:** Canary placed after overflowable variable **`buf`**

<span class="detailsNotImportant">
<details>

  <summary>Fun Fact</summary>

  Canaries have this name because historically [canaries (the birds) were used in coal mines to detect gas](https://en.wikipedia.org/wiki/Sentinel_species), thus alerting of possible danger

</details>
</span>

In this example, we have a `char[]` variable **`buf`** that is capable of being overflown. If that happens, the placed **canary** will be the first value being changed, and that change can be detected in runtime.

### Detectable Attacks

Canary usage (implemented like **Fig. 1** shows) is effective against some type of buffer overflow attacks, but **ineffective against others**:

**<span class="green">Effective against:</span>**

- **Stack smashing** that overwrite **return address**
- **Off-by-one errors** that target **saved EBP**

**<span class="yellow">Maybe effective against:</span>**

- Modification to **function parameters**
  - These parameters reside **below** the return address (check **Fig.2** below)
  - Might detect the attack **too late**

**<span class="red">Not effective against:</span>**

- **Pointer subterfuge**
  - Pointer subterfuge targets **local variables**, these reside **above** the canary (check **Fig.2** below)

This diagram shows the normal positions of data in the stack:

![Stack Layout.png](../img/Stack%20Layout.png) > **Fig.2:** Stack layout

#### Solution to Problems

There are ways to redesign the stack, in order to make canaries more effective against attacks they normally don't detect:

##### Local Variables

Canaries can't detect the overflowing of local variables, because these are **above the canary**. The following shows this case:

![Pasted image 20240126020744.png](../img/Pasted%20image%2020240126020744.png)<br></br>
**Fig.3:** Canaries don't detect changes to local variables

<mark>**Solution:** Reorder stack layout! Place all **char buffers below** other variables.</mark>

The reordered stack would look something like this:

![Pasted image 20240126021103.png](../img/Pasted%20image%2020240126021103.png)<br></br>
**Fig.4:** Reordered stack

##### Function Arguments

Function arguments are located **below** the return address; the problem is that when canaries detect that the function arguments were altered, they might have already been used.

This is what the stack looks like:

![Pasted image 20240126110855.png](../img/Pasted%20image%2020240126110855.png)<br></br>
**Fig.5:** Function args are below the return address

There are **two solutions** to this problem:

1. Keep the function args in **registers** (however, there aren't many registers)
2. Create a **copy** of the function args and place on top of the stack

OSs like Windows implement **both**. Here is the new ordered stack:

![Pasted image 20240126111012.png](../img/Pasted%20image%2020240126111012.png)<br></br>
**Fig.6:** Stack with copy of args above local variables

## Non-executable stack and heap

Many buffer overflow exploits aim to **inject shell code** in the stack/heap, in order to perform malicious activity. One of the simpler solutions against this is marking these memory slots as **non-executable** (NX), preventing code execution in these memory locations.

This type of protection is not perfect: it doesn't protect against **return to libc/return-oriented programming attacks**, as these attacks do not involve injecting code. Also, there are some lib functions that might be called to **turn off NX**, i.e. the attacker could run a return to libc attack to disable NX, and then inject code. However, this is **hard** to do in practice.

Another problem of NX is that some apps might **not be compatible** with it, more specifically:

- High-performance apps that might generate binary code in runtime
- Interpreted languages compile scripts into binary code

## Randomization and Obfuscation

In this chapter we will look at a couple of randomization/obfuscation mechanisms like:

- **[ASLR](#aslr)**
- **[Instruction Set Randomization](#instruction-set-randomization)**
- **[Function Pointer Obfuscation](#function-pointer-obfuscation)**

### ASLR

The main objective of **A**ddress **S**pace **L**ayout **R**andomization (ASLR) is to change the memory locations where code and data are placed in runtime; this is not what would normally happen, as memory locations tend to be the same in every execution. While it doesn't make exploitation impossible, it makes it **significantly harder**.

:::info[Important]
"Changing" the memory addresses means altering the **virtual addresses** of objects of certain programs (not physical addresses, as these are already constantly changing due to memory page swaps).
:::

Elements that can be randomized:

- **Code:** addresses where apps and dynamic libraries are loaded
- **Stack:** starting address of the stack of each thread
- **Heap:** base address of the heap

:::info[Important]
Not all bits in the memory address are randomized, to reduce **fragmentation**
:::

In practice, what ends up being randomized is two things:

- **User apps:** whenever loaded
- **Shared DLLs:** once on reboot

ASLR is effective against most buffer overflow attacks, that involve **stack smashing** and **ret-to-libc**, but it is not effective against attacks that target **local variables**.

#### Limitations

ASLR does have some limitations like:

- Some old apps or certain DLLs that do not allow for relocation of memory are still vulnerable to buffer overflows
- DLLs memory addresses are only randomized when computer is turned on; therefore an attacker can perform a **local attack** to discover the memory addresses, and then run the **main attack**
- Brute force attacks possible if target code restarts on failure

### Instruction Set Randomization

Let's imagine a scenario where each computer had its **unique and random** instruction set: code injection attacks would be **impossible** if that was the case. Instruction set randomization aims at mimicking this by doing the following:

1. <span class="green">Legitimate code</span> gets **scrambled** (e.g, XOR with random number), and is then **unscrambled** for execution
2. <span class="red">Malicious code</span> doesn't get scrambled (because it is injected **after** scrambling happened), but will be **unscrambled**, making it impossible to execute

:::info
- **Scrambling** should be done at **load time**
- **Unscrambling** should has to be done by a **virtual machine** or **debugger** (high overhead, not practical) or by the **CPU** (not available yet)
:::

#### SQL Injection Use Case

One of the most commonly used scenarios where instruction set randomization is used is to prevent **SQL injections**: Let's take a look at the following case:

1. Let's assume we have the following SQL code:

<pre><code><span class="green">\$query = “SELECT * FROM orders WHERE id=” {'.'} {'$'}code;</span></code></pre>

2. An application that has instruction set randomization might take this code and a **key** (in this case, **key = 333**) and output the following:

<pre><code><span class="green">\$query = “SELECT</span><span class="pink">333</span><span class="green"> * FROM</span><span class="pink">333</span><span class="green"> orders WHERE</span><span class="pink">333</span><span class="green"> id=</span><span class="pink">333</span> <span class="green">" {'.'} {'$'}code</span></code></pre>

3. If we imagine the case of a web application, there would be a proxy between the **web server** and the **DBMS** that would check for instructions **without** the key <span class="pink">333</span>
4. If a query was modified by an attacker (to insert a tautology like **`OR 1=1`** for example) it would look like this:

<pre><code><span class="green"> {'$'}query = “SELECT</span><span class="pink">333</span><span class="green"> * FROM</span><span class="pink">333</span><span class="green"> orders WHERE</span><span class="pink">333</span><span class="green"> id=</span><span class="pink">333</span><span class="green">1" {'.'} {'$'}code;</span><span class="red">OR 1=1</span></code></pre>

1. This would be **discarded** by the proxy due to **`OR`** keyword not having the key

### Function Pointer Obfuscation

Long-lived function pointers (e.g., pointers to global variables) are very often the target of memory corruption exploits; one way to prevent is to **obfuscate** them:

- Idea is to keep pointers **protected** while they are not needed, and unprotect them when needed
- Do this by **XORing** the pointer with random secret cookie

This solution works well only if coupled with ASLR and NX.

## Integrity Verification

### SEH Protection

## Filtering
