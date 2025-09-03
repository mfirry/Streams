import cats.effect.{IO, IOApp}
import fs2.Stream

object Main extends IOApp.Simple {

  val stream: Stream[IO, Int] =
    Stream
      .emits(1 to 5)
      .map(_ * 2)

  val run: IO[Unit] =
    stream
      .evalMap(n => IO.println(n))
      .compile
      .drain
}
