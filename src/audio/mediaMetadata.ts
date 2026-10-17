/** Static metadata remains useful when iOS suspends the page's timers. */
export function soundMetadata(mood: { id: string; name: string }, origin: string) {
  return {
    title: mood.name,
    artist: 'Drift',
    album: 'Find your quiet',
    artwork: [192, 512].map(size => ({
      src: new URL(`/artwork/v1/${mood.id}-${size}.png`, origin).href,
      sizes: `${size}x${size}`,
      type: 'image/png',
    })),
  };
}
