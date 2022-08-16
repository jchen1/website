---
layout: post
title: "Visualizing and Deleting Entity Hierarchies in EF Core"
date: "2022-08-16"
author: Jeff Chen
tags: code
---

At [Vesta](https://www.usevesta.com/), we have a multi-tenant application where tenant data is logically separated in our Postgres instance by a `tenant_id` column on entity tables. As we've grown, we've had to delete some tenant data. Although I've done it manually a few times in `psql`, manually deleting rows is dangerous, so I decided to write a script to delete tenants for us.

We use [EF Core](https://docs.microsoft.com/en-us/ef/core/) for all of our database interactions at Vesta, so our entire database schema is represented in our [`DbContext`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext?view=efcore-6.0). Because `DbContext`s [contain entity metadata](https://docs.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.model?view=efcore-6.0#microsoft-entityframeworkcore-dbcontext-model), I wrote the script against that data.

<!-- excerpt -->

## Naive approach 

Naively deleting tables might look something like this:

```c#
foreach (var tableName in dbContext.Model.GetEntityTypes().Select(et => e.GetTableName()).ToHashSet())
{
  await dbContext.Database.ExecuteSqlRawAsync($"DELETE FROM {tableName} WHERE tenant_id='{tenant}';");
}
```

Unfortunately, this doesn't work. We have many entity relationships defined in our model, most of which aren't defined with any specific [ON DELETE behavior](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK). So, with a table `foo` that has a foreign key to `bar`, if you attempt to delete the table `bar` before `foo` you'll encounter foreign key constraint errors:

```sql
postgres@localhost:vesta> DELETE FROM bar WHERE tenant_id='test_tenant';
update or delete on table "bar" violates foreign key constraint "fk_foo_bar_bar_id" on table "bar"
DETAIL:  Key (id)=(a15ba931-eb31-412a-aadb-49d699af4435) is still referenced from table "bar".
```

Of course, you can get around this manually, but this becomes increasingly tedious as your entity relationships scale. A better approach would be to sort our delete operations programatically.

## Finding dependencies in EF Core

EF Core's [`Model`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.metadata.imodel?view=efcore-6.0) is incredibly detailed—it has to be, so that its own operations work without hitting Postgres errors. We can introspect the model to find all foreign key constraints and the tables they reference.

```c#
private record struct TableColumn(string Table, string Column);

private static IDictionary<
  string,
(List<TableColumn> WeakReferences, List<TableColumn> References)
> GetDependencyGraph(PGContext context)
{
  var adjacency =
    new Dictionary<string, (HashSet<TableColumn> WeakReferences, HashSet<TableColumn> References)>();

  foreach (
    var entityType in context.Model
    .GetEntityTypes()
    // IBaseEntity is the type that all our entities inherit from; it guarantees the existence
    // of a `tenant_id` column
    .Where(et => typeof(IBaseEntity).IsAssignableFrom(et.ClrType) && et.GetTableName() is not null)
  )
  {
    var tableName = entityType.GetTableName();
    var table = entityType.GetTableMappings().FirstOrDefault(tm => tm.Table.Name == tableName)?.Table;

    Debug.Assert(tableName is not null);
    Debug.Assert(table is not null);

    foreach (var fkey in table.ForeignKeyConstraints)
    {
      if (!adjacency.ContainsKey(tableName))
      {
        adjacency[tableName] = new() { References = new(), WeakReferences = new() };
      }

      var fkeyTableName = fkey.PrincipalTable.Name;
      var column = fkey.Columns.Single();
      var tc = new TableColumn(fkeyTableName, column.Name);
      if (fkeyTableName != tableName)
      {
        if (column.IsNullable)
        {
          adjacency[tableName].WeakReferences.Add(tc);
        }
        else
        {
          adjacency[tableName].References.Add(tc);
        }
      }
    }
  }

  return adjacency.ToDictionary(
    kvp => kvp.Key,
    kvp => (kvp.Value.WeakReferences.ToList(), kvp.Value.References.ToList())
  );
}
```

Note that we distinguish between "weak" and normal references. Many of the relationships in our data model are optional, meaning that the foreign key column is nullable. For example, we have a `borrowers` table with a nullable `spouse_id` column that points to another borrower. To delete a borrowers with a spouse, then, we need to null out `spouse_id` before deleting the borrowers:

```sql
UPDATE borrowers SET spouse_id=NULL WHERE tenant_id='test_tenant';
DELETE FROM borrowers WHERE tenant_id='test_tenant';
```

Non-nullable foreign keys are required relationships. Our `borrowers` table has a non-nullable `loan_id` column referencing the `loans` table—this means that we must delete `borrowers` before `loans` to avoid hitting foreign key constraint errors.

## Displaying Graphviz

[Graphviz](https://graphviz.org/) is an excellent way to visualize graphs with a simple syntax. With the adjacency list we built in `GetDependencyGraph` above, we can generate a Graphviz graph:

```c#
private static void PrintGraphviz(
  IDictionary<string, (List<TableColumn> WeakReferences, List<TableColumn> References)> adjacency
)
{
  Console.WriteLine("digraph G {");
  foreach (var kvp in adjacency)
  {
    // nullable ref
    foreach (var dep in kvp.Value.WeakReferences)
    {
      Console.WriteLine("  {0}->{1} [style=\"dotted\"]", kvp.Key, dep.Table);
    }

    // non-nullable ref
    foreach (var dep in kvp.Value.References)
    {
      Console.WriteLine("  {0}->{1} [style=\"solid\"]", kvp.Key, dep.Table);
    }
  }
  Console.WriteLine("}");
}
```

[edotor.net](https://edotor.net) is a free online Graphviz visualizer; I found that for my purposes the `fdp` engine produced the best visualizations.

![{caption=Vesta's obfuscated entity hierarchy}](/images/deleting-entity-hierarchies-in-ef-core/graph.png)

## Topologically sorting dependencies for deletion

To delete tables properly, we only care about sorting strong references. Since we have a graph, this is just a topological sort. We'll do it via BFS:

```c#
private static IEnumerable<string> TopologicalSort(
  IDictionary<string, List<string>> adjacency
)
{
  var sorted = new List<string>();
  var inDegree = new Dictionary<string, int>();
  foreach (var kvp in adjacency)
  {
    if (!inDegree.ContainsKey(kvp.Key))
    {
      inDegree[kvp.Key] = 0;
    }

    foreach (var edge in kvp.Value)
    {
      if (!inDegree.ContainsKey(edge))
      {
        inDegree[edge] = 0;
      }

      inDegree[edge] += 1;
    }
  }

  var queue = new Queue<string>(inDegree.Where(kvp => kvp.Value == 0).Select(kvp => kvp.Key));
  while (queue.Count > 0)
  {
    var current = queue.Dequeue();
    sorted.Add(current);

    if (adjacency.TryGetValue(current, out var edges))
    {
      foreach (var edge in edges)
      {
        if (inDegree.TryGetValue(edge, out var degree) && degree > 0)
        {
          inDegree[edge] -= 1;

          if (inDegree[edge] == 0)
          {
            queue.Enqueue(edge);
          }
        }
      }
    }
  }
  
  if (inDegree.Where(kvp => kvp.Value > 0))
  {
    throw new InvalidOperationException("graph has circular dependencies!");
  }

  return sorted;
}
```

## Data deletion

With our list of references and topologically sorted tables, we're finally ready to delete some data!

```c#
public static async Task DeleteTenant(DbContext context, string tenant)
{
  var adjacency = GetDependencyGraph(context);
  var sorted = TopologicalSort(
    adjacency.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.References.ConvertAll(r => r.Table))
  );

  foreach (var kvp in adjacency)
  {
    foreach (var weakReference in kvp.Value.WeakReferences)
    {
      // This can't be parameterized because Postgres can't use a parameter for the table name
      var sql = $"UPDATE {kvp.Key} SET {weakReference.Column}=NULL WHERE tenant_id='{tenant}';";
      Console.WriteLine($"{sql}");
      await context.Database.ExecuteSqlRawAsync(sql);
    }
  }

  foreach (var tableName in sorted)
  {
    var sql = $"DELETE FROM {tableName} WHERE tenant_id='{tenant}';";
    Console.WriteLine($"{sql}");
    await context.Database.ExecuteSqlRawAsync(sql);
  }
}
```

If all goes well, you'll see a bunch of `UPDATE` then `DELETE` transactions. I'd recommend that you build dry-run functionality before running anything like this in production.

