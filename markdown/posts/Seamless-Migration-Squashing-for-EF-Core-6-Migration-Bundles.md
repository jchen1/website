---
layout: post
title: "Seamless Migration Squashing for EF Core 6 Migration Bundles"
date: "2022-08-22"
author: Jeff Chen
tags: code
heroImage: /images/seamless-migration-squashing-for-ef-core-6-migration-bundles/hero.png
---

EF Core generates and stores a full snapshot of the database for every migration. For a large data model, like we have at Vesta ([come join us!](https://www.usevesta.com/careers)), every migration adds ~15k LOC. Over time, we end up with more migration than application code—in 10 months, we generated over 2 million(!) lines of migration code.

All these snapshots significantly impact compile time, and without configuration, makes interacting with the codebase more tedious and slower. These snapshots also aren't useful—after enough time has passed, it becomes prohibitively difficult to actually revert N migrations back.

Ideally, we'd be able to "squash" old migrations into one, removing the old snapshots and migration logic while preserving the ability to spin up a fresh database. In the following, I'll describe how we achieved this at Vesta.

<!-- excerpt -->

## Migration squashing

Unfortunately, squashing migrations is a [well-requested but unimplemented feature of EF Core](https://github.com/dotnet/efcore/issues/2174). And while there were existing approaches, none of them quite met our use case:

- Just deleting every migration file and regenerating, as detailed [here](https://www.michalbialecki.com/en/2020/07/24/merging-migrations-in-entity-framework-core-5/), doesn't guarantee that all pre-squashed migrations have been applied to existing databases.
- [Bokio](https://www.bokio.se/engineering-blog/how-to-squash-ef-core-migrations/)'s approach works well for generated-SQL migrations, but fails when using [migration bundles](https://devblogs.microsoft.com/dotnet/introducing-devops-friendly-ef-core-migration-bundles/)—the bundle decides what migrations to run _before_ applying any migration.

## Seamless migration squashing

To support our specific flow, we took the following steps:

1. Note the last applied migration to all environments (say, `20220816204002_last-applied-migration`).

2. Delete all existing migrations.

3. Generate a new migration that scaffolds the entire database from scratch (`20220818120909_squash-migrations`).

4. Ensure that the newly generated migration will create a database schema that matches what's live. [pgdiff](https://github.com/joncrlsn/pgdiff) is one of many options to diff schemas.

5. Modify the `Up` function of `20220818120909_squash-migrations.cs` to **conditionally** apply the migrations, only if the previously applied migration `20220816204002_last-applied-migration` doesn't exist in the EF migrations table. For us, this looked like:

   ```csharp
   var context = new DbContextFactory().CreateDbContext(Array.Empty<string>());
   // This is a no-op update; we just need EF Core to tell us how many rows have been affected
   var dbAlreadyInitialized = context.Database.ExecuteRaw("UPDATE \"__EFMigrationsHistory\" SET migration_id=migration_id WHERE migration_id='20220816204002_last-applied-migration'") == 1;

   if (dbAlreadyInitialized)
   {
     Console.WriteLine("Database already initialized; skipping scaffolding.");
     return;
   }

   Console.WriteLine("Scaffolding database...");

   // generated scaffolding logic
   ```

   Some things to note here:

   - We can't just use the `migrationBuilder` argument to execute SQL—those methods just build SQL to eventually be executed in a single transaction and don't support conditions.
   - We already had a `DbContextFactory` for EF Core migration tooling (from [this doc](https://docs.microsoft.com/en-us/ef/core/cli/dbcontext-creation?tabs=dotnet-core-cli#from-a-design-time-factory)). The created context will receive the same environment as the migrations bundle itself—you should ensure that the context can actually access the database.

6. Test your new migration on (at least) the following cases:

   - Developers running `dotnet ef database update` on both new and existing databases
   - Migration bundles running on new and existing databases
   - Test runners applying migrations

## Impact

Squashing our migrations removed 2.6 million lines of code from our codebase, and significantly improved the time it took to generate a migration bundle:

| **---**          | **Migration bundle generation time (s)** |
| ---------------- | :--------------------------------------- |
| Before squashing | 130.6                                    |
| After squashing  | 55.0                                     |

The impact on developer workflow is harder to measure, but both structured and unstructured (i.e. 'Find Usages' and 'Find in Files') searches are much snappier and have fewer false positives.
