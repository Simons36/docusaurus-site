---
tags:
  - computer-networks
  - distributed-systems
  - to-do
author: Simão Silva
---

---

In this note, we talk about different ways to implement a distributed register, both in the arbitrary model and in a Byzantine model.

---
# Register Types

In this section we will present some different types of registers, and explain each one. The types of registers are:

* [Regular Register](#regular-register)
* [Atomic Register](#atomic-register)
* [Byzantine Read/Write Regular Register](#byzantine-readwrite-regular-register)
* [Byzantine Read/Write Atomic Register](#byzantine-readwrite-atomic-register)

:::info[Important]
Whenever in this note it is referenced $(N_w, N_r)-X \ Register$, $N_w$ corresponds to number of writers, and $N_r$ corresponds to the number of readers. $X$ can be any type of register 
:::

## Regular Register

Regular Registers are characterized by the following two properties:

- **Liveness:** If a correct process invokes an operation, then that operation **eventually** completes
- **Safety:** Read must return either:
	- The last written value **if there is no concurrent transaction**
	- The last written value, or any concurrently written value

We will describe the implementation of one type of regular registers, (1,N)-Regular Registers.

### (1,N)-Regular Register

This version of regular register assumes only one process can write to the register, and it uses **Best-effort Broadcast** and **Perfect Links**. 

We assume each process maintains:

- _{'<ts, val>'}_ - Current value and associated timestamp
- _readlist_ - List of returned values, for reading
- _rid_- Id of current read operation

The writer also maintains:

- _wts_ - Next timestamp to be written
- _acks_ - How many writes have been acknowledged

Lastly, regular registers should be able to tolerate up to $f$ **crash** faults.

#### Algorithm

The algorithm for this type of register is this:

![](img/Pasted%20image%2020240409144626.png)
![](img/Pasted%20image%2020240409144640.png)<br></br>
**Fig.1:** Algorithm of (1,N)-Regular Register

#### Correctness

**Liveness:** Any Read() or Write() eventually returns a value, if there exists a quorum of correct processes, and the liveness properties of the channel are verified.

**
## Atomic Register

## Byzantine Read/Write Regular Register

## Byzantine Read/Write Atomic Register
