import { Effect, Stream } from "effect";

const stream = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.map((n) => n * 2),
  Stream.mapEffect(Effect.log)
);

const run = Stream.runDrain(stream);

await Effect.runPromise(run);

