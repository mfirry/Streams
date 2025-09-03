import * as Stream from "@effect/stream/Stream";
import * as Effect from "@effect/io/Effect";

const stream = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.map((n) => n * 2),
  Stream.mapEffect(Effect.log)
);

const run = Stream.runDrain(stream);

await Effect.runPromise(run);

