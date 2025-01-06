import { shuffleArray, log } from "../../utils.js";
import { mediaTypes, TMediaType } from "../../domain/shared/types/index.js";
import { IPlexMediaContainer } from "../../domain/adapters/plex/services/MediaImageService.js";
import { IPlayniteGamesContainer } from "../../domain/adapters/playnite/services/GamesImageService.js";

type TCacheData = IPlayniteGamesContainer[] | IPlexMediaContainer[];

interface IImageSet {
  total: number;
  remaining: number;
  expiration: number;
  uniqueIndexes: number[];
  data: TCacheData;
}

export default class ImageIndexRepository {
  
  private cache: { [userId: string]: Record<string, IImageSet> } = {};

  constructor(private APP_CACHE_DURATION: number) { }

  save(
    userId: string,
    mediaType: TMediaType,
    { data, total }: { data?: TCacheData; total?: number }
  ): IImageSet {
    const resolvedTotal = total ?? data?.length;
    if (typeof resolvedTotal !== 'number' || isNaN(resolvedTotal)) {
      throw new Error(`Invalid parameters for saving ${mediaType}.`);
    }

    const userCache = this.#getUserCache(userId);
    userCache[mediaType] = {
      total: resolvedTotal,
      remaining: resolvedTotal,
      uniqueIndexes: Array.from({ length: resolvedTotal }, (_, i) => i),
      expiration: Date.now() + this.APP_CACHE_DURATION,
      data: data ?? [],
    };

    log(userId, 'ImageIndexRepository', 'save', 'write', `data of '${mediaType}' with length ${userCache[mediaType].remaining}`);
    return userCache[mediaType];
  }

  retrieve(userId: string): Record<string, IImageSet> {
    const userCache = this.#getUserCache(userId);

    log(userId, 'ImageIndexRepository', 'retrieve', 'read', 'full cache');

    return userCache;
  }

  retrieveData(
    userId: string,
    mediaType: TMediaType,
    index: number
  ): IPlexMediaContainer | IPlayniteGamesContainer {
    const userCache = this.#getUserCache(userId);

    const payload = userCache[mediaType].data[index];

    log(userId, 'ImageIndexRepository', 'retrieveData', 'read', `${mediaType} with index '${index}'`);

    return payload;
  }

  popUniqueIndex(userId: string, mediaType: TMediaType): number {
    const userCache = this.#getUserCache(userId);
    const imageIndex = userCache[mediaType];

    const randomIndex = Math.floor(Math.random() * imageIndex.remaining);
    imageIndex.uniqueIndexes = shuffleArray(imageIndex.uniqueIndexes);
    const value = imageIndex.uniqueIndexes.splice(randomIndex, 1)[0];
    imageIndex.remaining = imageIndex.uniqueIndexes.length;

    log(userId, 'ImageIndexRepository', 'popUniqueIndex', 'pop', `'${value}' from '${mediaType}', ${imageIndex.remaining} remaining is set`);

    return value;
  }

  hasValidCache(userId: string): boolean {
    const userCache = this.#getUserCache(userId);

    // TODO: you can do more robust checks here, e.g. check expiration times
    const result = mediaTypes.every((mediaType) => {
      return !!userCache[mediaType]?.remaining;
    });

    log(userId, 'ImageIndexRepository', 'hasValidCache', 'read', result.toString());

    return result;
  }

  getInvalidCacheHits(userId: string): TMediaType[] {
    const userCache = this.#getUserCache(userId);

    const result = mediaTypes.filter((mediaType) => {
      return !userCache[mediaType]?.remaining;
    });

    log(userId, 'ImageIndexRepository', 'getInvalidCacheHits', 'read', result.toString());
    
    return result;
  }

  #getUserCache(userId: string): Record<string, IImageSet> {
    if (!this.cache[userId]) {
      this.cache[userId] = {};
    }
    return this.cache[userId];
  }
}
