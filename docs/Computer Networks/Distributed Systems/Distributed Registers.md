---
tags:
  - computer-networks
  - "#distributed-systems"
  - SEC
  - notes
author: Simão Silva
---

In this note, we talk about different ways to implement a distributed register, both in the arbitrary model and in a Byzantine model 

---
# Index

1. [[Distributed Registers#Register Types|Register Types]]
	1. [[Distributed Registers#Regular Register|Regular Register]]
	2. [[Distributed Registers#Atomic Register|Atomic Register]]
	3. [[Distributed Registers#Byzantine Read/Write Regular Register|Byzantine Read/Write Regular Register]]
	4. [[Distributed Registers#Byzantine Read/Write Atomic Register|Byzantine Read/Write Atomic Register]]

---
# Register Types

In this section we will present some different types of registers, and explain each one. The types of registers are:

- [[Distributed Registers#Regular Register|Regular Register]]
- [[Distributed Registers#Atomic Register|Atomic Register]]
- [[Distributed Registers#Byzantine Read/Write Regular Register|Byzantine Read/Write Regular Register]]
- [[Distributed Registers#Byzantine Read/Write Atomic Register|Byzantine Read/Write Atomic Register]]

> __Important:__ Whenever in this note it is referenced $(N_w, N_r)-X \ Register$, $N_w$ corresponds to number of writers, and $N_r$ corresponds to the number of readers. $X$ can be any type of register 
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

![[Pasted image 20240409144626.png]]
![[Pasted image 20240409144640.png]]**Fig.1:** Algorithm of (1,N)-Regular Register

#### Correctness

**Liveness:** Any Read() or Write() eventually returns a value, if there exists a quorum of correct processes, and the liveness properties of the channel are verified.

**
## Atomic Register

## Byzantine Read/Write Regular Register

## Byzantine Read/Write Atomic Register