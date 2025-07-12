---
tags:
  - computer-networks
  - distributed-systems
  - to-do
  - large-scale-systems
author: Simão Silva
---

# Capacity Planning

---
In this note, we will take a look at what capacity planning is and how it is done

---

## Capacity Planning VS Capacity Management

The difference between capacity management and capacity planning is very simple: whilst capacity management is concerned if the system is able to serve the **current** demand (**present**), capacity planning is concerned with the same thing, but in the **future** (are the future resources going to be able to respond to **future workloads**).

In both capacity planning and capacity management, besides performance, **cost** is an **important measure**.

## Fallacies

There exist two common fallacies, that try to depreciate the importance of capacity planning:

- "You can just add more resources when the demand gets higher, and therefore there is no need for planning ahead"

    This phrase overlooks one key aspect of provisioning and adding more resources to a system: it usually takes a considerable amount of time. If you host a web service on premise, and need to increase capacity, you would need to fire up more servers, create VMs, install software... by the time the added resources are available, it might already be too late (and we are assuming all the extra resources, like servers, are already purchased and ready; if not, this would take even more time). This effect is mitigated if the system is deployed on the cloud, but still not ideal.

- "Over-engineer the system so much that no capacity planning is ever needed"

    This is also a fallacy because, no matter how much over-engineering is done to a system, and how optimized a process becomes, there will always be bottlenecks and performance limitations (e.g., critical part of processing a request must be single-threaded).

## Common Mistakes

- **No standard definition of capacity**
  - For different systems, the measure for capacity that makes more sense might also be different. Examples of capacity measures include: overall throughput of system, average response time, number of clients with a maximum of 100ms of response time, etc.
- **Different capacities for the same system**
  - For the same system, there might be different capacities, according to the capacity measure used. For example, for a certain system, the nominal (theoretical) throughout of a system might be a certain value, but the usable throughput might be lower, in order to reduce the latency of the system to a usable level
- **No standard workload unit**
  - There are many different units that can be used for a workload (users, sessions, accounts, may all differ); all of these different definitions require a detailed characterization and definition. However, this introduces a challenge when comparing systems, because two different systems might have a different definition for user, or session. In fact, in the same system, the definition of user in the present might be different from user in the future!
  - Because of this, it is recomended to use metrics that **workload-independent** (MIPS, operations per second, etc.)
- **Forecasting future applications and workloads is difficult**
  - Predicting the future based on the past might not always work, and new technologies might completely revolutionize user and workload behavior.
- **No uniformity between system vendors**
  - Different systems will consume different resources for the same workload. Therefore, we need a vendor-independent benchmark for all these systems, and compute different models for each system. It is possible to introduce a bias in any of these stages
- **Model inputs cannot always be measured**
- **Performance is not the only important metric**
  - Performance should not be the only concern in capacity planning: cost, training personnel, installations, etc. A multitude of factors should be considered; however, in this course/note, we are only concerned with performance.

## Capacity Planning Approach

The process of capacity planning is illustrated in the following diagram:

![](../../../../static/img/capacity_planning_approach.svg)<br></br>
**Fig.1:** Capacity Planning approach diagram

We will now describe each of the five steps:

- **[Instrument the System](#instrument-the-system)**
- **[Monitor System Usage](#monitor-system-usage)**
- **[Characterize the Workload](#characterize-the-workload)**
- **[Predict Performance](#predict-performance)**
- **[Plan](#plan)**

### Instrument the System

In this phase, our main concern is to equip the system with the necessary tools for **collecting data** about several metrics of the system regarding **resource utilization** (CPU usage, Disk usage, Network usage, Number of requests, Number of connected users, etc.).

Whenever possible, it is best to use already built-in counters, whether it be in the OS (OS measures CPU, Disk and Network utilization, for example), in application tools (for Java based programs, it is possible to collect garbage collection, thread usage, etc. per object or class), or alternatively use application-independent counters.

:::info[Important]

In this step, we are only concerned with **collecting** data; no **data processing** should occur in this phase. If we process data in the same system that is producing the data, this could impact the system's performance, which obviusly is not desireable.
:::

### Monitor System Usage

After ensuring the system is collecting data about performnce, we now need to monitor the current system usage and register the data, to understand load patterns and trends in the system utilization. Like it was said before, it is important to make sure that the collection of data does not impact the system's performance.

### Characterize the Workload

Now that we get a sense of the type of workload the system will face, it is time to characterize a test workload, based on the real workload, so that we can then evaluate the system in the [Predict Performance](#predict-performance) step.

Some common mistakes that can be done in this step are the following:

- **Only representing average behavior in test workload**
  - In a real workload, there exist many fluctuations in the load that is submitted to system, even at the scale of a single second. It is important to reflect this variance in the test workload, and not only the average behavior; this is because, while the system might be prepared to handle the average behavior, it might not handle a workload with a higher variation (sudden spikes in load may be difficult to handle, for example system might be able to handle average number of I/O requests, but a sudden spike might exceed capacity).
- **Uniform distribution of load across I/O devices**
- **Ignoring the effect of caching**

### Predict Performance

### Plan
