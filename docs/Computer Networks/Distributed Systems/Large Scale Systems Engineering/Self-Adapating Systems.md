---
tags:
  - computer-networks
  - distributed-systems
  - to-do
  - large-scale-systems
author: Simão Silva
---

# Self-Adapting Systems

---
In this note, we cover some topics regarding self-adapting systems

---

## Autonomic Computing Principles (Self-* properties)

- **Self-Configuring:** Automatic integration and distribution of resources by the system; it is concerned with more **high-level policies** ("what" to do, not "how" to do something. A good comparasion of this is terraform files: they state what resources should the system, not how to deploy them).
- **Self-Optimizing:** Automatically change different parameters or resources, to achieve a more optimal state of the system, according to the current environment
- **Self-Healing:** Detect when faults happen in the system's resources, and have the ability to automatically recover from them (e.g., if a container belonging to the system fails, automatically create a new one)
- **Self-Protecting:** Indentify and protect against attacks