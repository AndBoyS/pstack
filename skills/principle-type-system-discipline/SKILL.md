---
name: principle-type-system-discipline
description: "Apply when designing types, reviewing a function signature, or writing code in any statically-typed language. Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, exhaust variants, derive from authoritative schemas."
disable-model-invocation: true
---

# Type System Discipline

Make the compiler reject impossible states, mismatched primitives, and unhandled variants. Prefer defining errors and special cases out of existence over proliferating handlers.

- **Brand semantic primitives.** `UserId` and `OrderId` are strings underneath but should not be interchangeable. Give each its own type, such as a branded intersection in TypeScript or a newtype elsewhere. Validate once at creation, trust the type downstream. If two arguments share a primitive type but mean different things, brand them. Don't build a unit system out of brands for quantities that take part in arithmetic, such as mass and length. A brand does no dimensional analysis, so `kg * kg` comes out as `kg`, or in TypeScript as a bare `number` that needs a cast. Keep one unit for each quantity and put the unit in the name, as in `massKg`. Convert only where the value enters or leaves the system.
- **External data is untyped until parsed.** RPC payloads, JSON, IPC messages, CLI args, config files, environment variables, database rows. Have a parse function at every boundary that turns unstructured input into the typed model. The **boundary-discipline** principle skill says where to put validation.
- **Exhaust variants.** Make a missed variant fail the build. TypeScript catches a missing case only when the function must return a value of a declared type. End every switch over a union with a `default` that passes the value to a function whose parameter type is `never`, and type each lookup table as `Record<Kind, T>`. Never let a catch-all `default` absorb the remaining cases. Where the compiler cannot check a switch, turn on a lint that does.
- **Derive types from authoritative schemas.** When a protocol buffer, OpenAPI spec, GraphQL schema, database migration, design-token file, or another file owns a shape, derive from it instead of hand-rolling a parallel type. See the **encode-lessons-in-structure** principle skill.
