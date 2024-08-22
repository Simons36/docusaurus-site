---
tags:
  - databases
  - information-systems
  - to-do
author: Simão Silva
toc_max_heading_level: 5
---

# Transaction and Concurrency

---

In this note it explained in more detail some topics about transaction and concurrency, such as deadlock handling and concurrency control schemes.

---

## Deadlock Handling

In this chapter we will approach some mechanisms databases implement to prevent, mitigate and handle **deadlocks**.

### Deadlock Prevention

A deadlock prevention strategy is a way that database try to **avoid** deadlocks happening (this is therefore done before a deadlock happens). The five deadlock prevention strategies that exist are:

- **Pre-declaration:**  Require a transaction to acquire all the needed locks for that transaction **before** the transaction ends.
<br></br>
- **Graph-based protocol:** Impose a partial order on all data items, and force transactions to lock items based in the order imposed
<br></br>
- **Wait-Die Scheme:** When two transactions are deadlock, the system can force the "younger transaction" (higher timestamp) to be rolled back (dies), so the oldest transaction can eventually get access to the data locked that was causing the deadlock. When transactions are rolled back, they are restarted with their **original timestamp** (to give preference to older transaction)
<br></br>
- **Wait-Wound Scheme:** Similar to the strategy above, but instead fully rolling back the younger transaction, it is rolled back a limited number of instructions (not a restart)
<br></br>
- **Timeout-based Schemes:** Database sets a timeout whenever a transaction is waiting for a deadlock; when that timeout expires, that transaction is rolled back. This strategy has some problems, namely unnecessary rollbacks can happen, and starvation can also happen.

## Concurrency Control Schemes

In this section we will discuss and present some of the possible concurrency control schemes that database systems can implement, such as:

- [Multiple Granularity](#multiple-granularity)
- [Multiversion Schemes](#multiversion-schemes)

### Multiple Granularity

(todo)

### Multiversion Schemes

Multiversion schemes work on the idea of keeping different (old) versions of each data item, to be able to increase concurrency. This type of concurrency control can be described with three key ideas:

- Whenever a __write(Q)__ is issued, that **creates a new version** of that data item
- Usage of **timestamps** to label versions
- Upon a **read(Q)** performed by a transaction $\Large t_i$, the value that should be returned by this function depends on the **timestamp** of $\Large t_i$; an appropriate version must be chosen

In this chapter, we will explore two different  variants of multiversion schemes:

- [Multiversion Timestamp Ordering](#multiversion-timestamp-ordering)
- [Snapshot Isolation](#snapshot-isolation)

#### Multiversion Timestamp Ordering

In multiversion timestamp ordering, we can establish the following principles:

- Each data item $\large Q$ has its own set of versions: $\large <Q_1, Q_2, ..., Q_m>$ 
- Each version $\large Q_K$ has the following two timestamps:
	- **W-Timestamp** - timestamp of the transaction that created version $Q_k$
	- **R-Timestamp** - timestamp of the transaction $with highest timestamp that as read $Q_k$

##### Algorithm

:::note[Assumption]
In the algorithm, a transaction $\large t_i$ can issue two operations: **read(Q)** and **write(Q)**. Let $\Large \textbf{Q}_{k}$ denote the version with the **largest W-timestamp**, such that **W-timestamp $\textbf{≤}$ TS($\large T_i$)**
:::

1. If a transaction issues a **read(Q)**, then:
	1. the value returned is $\Large \textbf{Q}_{k}$
	2. if **R-Timestamp($\textbf{Q}_{k}$)** < TS($T_i$), then set **R-Timestamp($\textbf{Q}_{k}$)** = TS($T_i$)
2. If transaction issues a **write(Q)**, then:
	1. If **R-Timestamp($\textbf{Q}_\textbf{k}$) > TS($T_i$)**, we rollback the transaction with new timestamp
	2. If **W-timestamp($Q_k$) = TS($T_i$)**, then version $Q_k$ is overwritten
	3. Otherwise, a new version is created, and **W-timestamp($Q_i$) = R-Timestamp($\textbf{Q}_\textbf{k}$)**= **TS($T_i$)**

We can easily see that, using this algorithm, **read requests never fail**.

##### Guarantees

- This protocol guarantees **serializability**
- However, it does not guarantee **recoverability** or **cascadelessness**

#### Snapshot Isolation

In snapshot isolation, the idea is to give each transaction, when they are created, a **snapshot** of the entire database; updates and reads of the transaction will be done **locally**, in that snapshot; it is at commit time that it is evaluated whether it is possible to update the database values, or if the transaction needs to be rolled back. Just like in [multiversion timestamp ordering](#multiversion-timestamp-ordering), read requests never fail (and also never need to wait for reads).

##### Multiversioning in Snapshot Isolation

In snapshot isolation, both transactions and data items have timestamp:

- Transactions have **two types of timestamps:**
	- _StartTS($\large t_i$)_ - represents the timestamp at the time the transaction entered the system
	- _CommitTS($t_i$)_ - represents the timestamp at the time the transaction commits
- Data items only have **one type of timestamp:**
	- **W-timestamp($Q_k$)** - it is equal to the  _Commit($t_i$)_ that created version $\large Q_k$

When a transaction $T_j$ reads a data item $Q$, it will read the most recent version $Q_k$ such that  **W-timestamp($Q_k$)** $\le$ _Start($T_i$)_, and it will not see any updates with timestamp higher than _StartTS($t_i$)_.

##### Validation

During transaction execution, no conflicts arise, as transactions work on their own snapshot; **conflicts only surge at commit time**, and it is necessary to have a validation policy, to know which transactions to commit, and which to roll back.

To define this validation policy, we first have to define **what concurrent transactions are:**

- Two transactions $T_i$ and $T_j$ are said to be **concurrent** if:
	- _StartTS($T_i)$_ $\le$ _StartTS($T_j)$_ $\le$ _CommitTS($T_i$)_, or
	- _StartTS($T_j)$_ $\le$ _StartTS($T_i)$_ $\le$ _CommitTS($T_j$)

If these two transactions update the same data item, both will be operating on their own private snapshot, and when changes are committed, one of the updates will be overwritten by the other. There are two approaches to solve this:

- **[First Committer Wins](#first-committer-wins)**
- **[First Updater Wins](#first-updater-wins)**

###### First Committer Wins

In this approach, at the commit time of transaction $t_i$ and for every data item $Q$ that $t_i$ updated, the database manager will analyze if there is any version $Q_k$ such that:

- _StartTS($t_i$)_ $\lt$ **W-timestamp($Q_k$)** $\lt$ _CommitTS($t_i$)_

If there is, that means that another transaction updated $Q$ while $t_i$ was being executed. According to **first committer wins**, $t_i$ should not be allowed to commit, and must be rolled backed. In the case there was no such $Q_k$ that would verify the above condition, then $t_i$ would be allowed to commit.

###### First Updater Wins

This approach considers the usage of **locks** on data items; whenever a transaction wants to update $Q$, it must acquire an exclusive lock on $Q$. The algorithm, for a given transaction trying to update $Q$ is this:

1. Transaction $t_i$ tries to acquire lock on $Q$
2. If it is able to get lock:
	1. If $Q$ has been updated by a concurrent transaction (verify _StartTS($t_i$)_ $\lt$ **W-timestamp($Q_k$)** $\lt$ _CommitTS($t_i$)_), $t_i$ needs t be rolled back
	2. Otherwise, $t_i$ is allowed to do the update
3. If it is not able to get the lock, assuming $t_j$ holds the lock:
	1. Wait until $t_j$ commits or aborts
	2. If $t_j$ aborts, $t_i$ is able to get the lock; go to **step 2**
	3. If $t_j$ aborts, $t_i$ must be rolled back

:::note
Locks are released when transactions commit or abort
:::

