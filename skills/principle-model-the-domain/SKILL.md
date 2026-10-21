---
name: principle-model-the-domain
description: "Apply when writing stateful logic, or when code branches a lot or repeats a shape assumption across files."
disable-model-invocation: true
---

# Model the Domain

Encode the real domain in a data structure instead of scattering it across conditionals. A structure that matches the domain makes invalid states unrepresentable and deletes branches. Recovering a structure later reads as a refactor and gets deferred. So when you have built this shape before, or the domain fixes it, choose the structure at write time. Otherwise name the plain shape, such as one flat struct. Revisit it in the change that adds a second case, because that case shows the real shape.

Reach for:

- A state machine instead of scattered booleans, phases, or lifecycle checks.
- A typed model instead of loose parameters or repeated shape assumptions.
- A map or lookup table defined in one place, or a discriminated union, instead of branching spread across files.
- A reducer or command/event model instead of ad hoc state mutations.
- A module organized around one body of domain knowledge instead of a sequence such as load, validate, transform, and save. Execution order is not ownership.
- A small module boundary that gathers repeated behavior, ownership, or invariants.
- A queue, cache, index, graph, tree, or normalized collection where the access pattern calls for it.
- Any other structure that fits. When none fits, work out what the code must never allow and how the data gets read, then find the structure that encodes exactly that.

Use a discriminated union when the states exclude each other and carry different data, such as loading, ready, and failed. When features combine freely, use one flat struct with a field or flag for each feature. For example, an entity can be visible, solid, and animated in any mix. Code that needs one feature reads one field instead of switching over every variant. Keep the flags independent. Flags that must change together are one state, so model them as a union or a state machine. When variants share their fields and the code treats them alike, use one struct with a `kind` field.

A lookup table keyed by variant makes a new variant one row and a new operation an edit to every row. A union with one switch per operation makes a new operation one function and a new variant an edit to every switch. Choose for the change the code gets more often.

Do not force an abstraction. Prefer boring code if the current shape is already clear, local, and unlikely to grow. Be skeptical of an abstraction that adds indirection without removing branches, duplicated rules, invalid states, or lifecycle risk.

The sign that you skipped this is a new feature that adds one more branch to an unchecked if/else chain, or a second boolean that must stay in sync with the first. Temporal decomposition is another sign. Phase-named modules repeat the same domain rules across steps.
