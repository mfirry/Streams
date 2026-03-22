# Benchmarking the streaming implementations

A few approaches to compare performance across the three implementations.

## 1. Wall-clock time with hyperfine

The simplest cross-language comparison. Replace the small `1..5` stream with a large one (e.g. 1..1_000_000) and measure end-to-end runtime.

### Setup guide

**Step 1 — Install hyperfine**
```bash
brew install hyperfine
```

**Step 2 — Pre-build all three projects** so build time is excluded from measurements
```bash
cd fs2 && sbt assembly          # or 'sbt package', produces a fat jar
cd effect && npm run build      # compiles TS to JS
cd conduit-example && stack build
```

**Step 3 — Run the benchmark**
```bash
hyperfine \
  'java -jar fs2/target/scala-3.3.7/fs2-example-assembly-0.1.0.jar' \
  'node effect/dist/index.js' \
  'conduit-example/.stack-work/install/*/bin/conduit-example'
```

Gives min/max/mean with warmup runs. Good for overall throughput comparison.

## 2. Throughput: elements per second

Make each program emit N elements, suppress printing (use a sink that just counts or discards), and time it. Printing is slow and will dominate — isolate the streaming overhead itself.

- **Scala/fs2**: `.compile.count` instead of `.evalMap(IO.println).compile.drain`
- **Haskell/conduit**: `runConduit $ stream .| lengthC` instead of `mapM_C print`
- **JS/Effect**: `Stream.runCount(stream)` instead of `Stream.runDrain`

## 3. Memory: peak RSS

```bash
/usr/bin/time -l stack run          # macOS (shows peak RSS)
/usr/bin/time -l sbt run
/usr/bin/time -l node dist/index.js
```

Useful for checking whether streams are truly constant-memory (they should be).

## 4. Language-native benchmarking

For more detailed profiling within each ecosystem:

| Ecosystem | Tool |
|-----------|------|
| Haskell   | [`criterion`](https://hackage.haskell.org/package/criterion) or [`tasty-bench`](https://hackage.haskell.org/package/tasty-bench) |
| Scala     | [JMH](https://github.com/openjdk/jmh) via `sbt-jmh` plugin |
| JS        | [`tinybench`](https://github.com/tinylibs/tinybench) or Node.js `--prof` |

These give statistical results (mean, std dev, outliers) and are better for micro-benchmarks.

## Tips

- **JVM warmup**: Scala results will be skewed on short runs due to JIT compilation. Either use JMH (handles warmup) or run the program long enough for the JIT to kick in.
- **GC pressure**: increase heap with `sbt -J-Xmx512m` or tune GHC's GC with `+RTS -H256m -RTS` to isolate streaming overhead from GC pauses.
- **Apples to apples**: make sure all three discard output (no printing) when measuring throughput, and use the same element count.
