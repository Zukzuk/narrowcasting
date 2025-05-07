export const mediaTypesPlex = [
    "audiobooks",
    "movies",
    "series",
    "animated-movies",
    "animated-series",
] as const;

export const mediaTypesKomga = [
    "comics",
] as const;

export const mediaTypesPlaynite = [
    "games",
] as const;

export const mediaTypes = [
    ...mediaTypesPlex,
    ...mediaTypesKomga,
    ...mediaTypesPlaynite,
] as const; // Combine as a readonly tuple
export type TMediaType = (typeof mediaTypes)[number]; // Union type of all media types