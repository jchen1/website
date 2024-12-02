---
layout: post
title: Monotonic Last Modified Columns in Postgres
date: "2024-12-02"
author: Jeff Chen
tags: code
---

Tracking a record's last modified time is a common application requirement. In Postgres, a typical implementation
might look like this, using a `BEFORE UPDATE` trigger on a `last_modified_at` column:

```postgresql
CREATE TABLE foo (
    id SERIAL PRIMARY KEY,
    name TEXT,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_last_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_last_modified_at_trigger
BEFORE UPDATE ON foo
FOR EACH ROW
EXECUTE PROCEDURE update_last_modified_at();
```

This works in most cases, but breaks an assumption that's likely made by the application: `last_modified_at` isn't
necessarily monotonically increasing, even if the system clock is. This can cause problems when the application uses
`last_modified_at` as a watermark for processing changes.

<!-- excerpt -->

The reason this approach breaks monotonicity is that `now()` actually returns the timestamp at which the given
transaction _started_, not the actual timestamp. This is normally a helpful property that makes it easier to group
changes that were made in the same transaction.

Consider the following case: transaction A starts at time 1, and transaction B starts at time 2, so `now()` returns
`2024-01-01T00:00:00.000000Z` and `2024-01-01T00:00:01.000000Z` for transaction A and B, respectively.
Assume both transactions are using the default isolation level of `READ COMMITTED`. Transaction B updates and commits
a record at time 3, which sets `last_modified_at=2024-01-01T00:00:01.000000Z`. Transaction A then updates and commits
the same record at time 4, which sets `last_modified_at=2024-01-01T00:00:00.000000Z`, violating monotonicity.

The easiest way to fix this is to use `clock_timestamp()` instead, which always returns the actual timestamp at
call time. If, however, we also need to group changes that were made in the same transaction, we can continue
to use `now()` but update our trigger function as follows:

```postgresql
CREATE OR REPLACE FUNCTION update_last_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = greatest(OLD.last_modified_at + INTERVAL '1 microsecond', now());
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';
```

The 1 microsecond interval ensures that even if `now()` returns a timestamp lower than the previously stored `last_modified_at`,
we still bump it so that readers of that timestamp can register an updated record.

From the above case: transaction `B` will commit `last_modified_at=2024-01-01T00:00:01.000000Z`, then when transaction A
commits, it will set `last_modified_at = greatest(2 + inverval '1 microsecond', 2024-01-01T00:00:00.000000Z) = 2024-01-01T10:00:00.000001Z`,
preserving monotonicity.
