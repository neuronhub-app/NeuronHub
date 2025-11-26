export function sleep(
  args: { ms: number; sec?: undefined } | { sec: number; ms?: undefined },
): Promise<void> {
  let ms = 0;
  if (args.ms) {
    ms = args.ms;
  }
  if (args.sec) {
    ms = args.sec * 1000;
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}
