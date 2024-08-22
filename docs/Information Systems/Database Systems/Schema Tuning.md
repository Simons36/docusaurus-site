---
tags:
  - databases
  - information-systems
  - notes
  - to-do
author: Simão Silva
---

---

In this note, we display some principles and techniques in how one can optimize a database for performance, specially in the schema's that are defined.

---

# Tuning Principles

There are five tuning principles (we will briefly explain each one of them). They are:

- **Think globally, fix locally:**
	- When identifying a problem, the whole system should be taken as a whole, and the global scenario should be understood; however, one should minimize changes to be as confined as possible; as changes that affect multiple parts of the system might cause unwanted effects

- **Partitioning breaks bottlenecks:**
	- If too much load is being placed in a certain component of the system, might be better off dividing that component into several parts, to better handle that load

- **Start-up costs are high; running costs are low:**
	- Certain actions are much more costly when starting them up, rather than when maintaining them; e.g. when starting a disk read, the cost of the read is added by the seek operation, but the rest of the read (if sequential) does not require that seek operation, thus is faster

- **Render unto server what is due unto server**
	- Important design choices matter, specially when deciding what should be handled by client program, and what should be handled by server

- **Be prepared for trade-offs:**
	- Sometimes there are not perfect solutions; for example, creating an index might speed up a particular query, but will increase the space in memory that is occupied, due to having to store that index 