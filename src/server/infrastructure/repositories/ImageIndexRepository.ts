import { log } from "../../utils.js";
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

export interface IWeightedCache { 
  mediaType: TMediaType; 
  index: number; 
}

/**
 * This repository is used to store the image indexes.
 * 
 * @export
 * @class ImageIndexRepository
 */
export default class ImageIndexRepository {

  private cache: { [userId: string]: Record<string, IImageSet> } = {};
  private weightedCache: { [userId: string]: IWeightedCache[] } = {};

  constructor(private APP_CACHE_DURATION: number) { }

  /**
   * Save the data in the cache.
   * 
   * @param {string} userId
   * @param {TMediaType} mediaType
   * @param {{ data?: TCacheData; total?: number }}
   * @returns {IImageSet}
   * @memberof ImageIndexRepository
   */
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

  saveWeighted(userId: string, weightedCache: IWeightedCache[]): IWeightedCache[] {
    this.weightedCache[userId] = weightedCache;

    log(userId, 'ImageIndexRepository', 'saveWeighted', 'write', `weighted cache with length ${weightedCache.length}`);

    return weightedCache;
  }

  /**
   * Retrieve the complete cache.
   * 
   * @param {string} userId
   * @returns {Record<string, IImageSet>}
   * @memberof ImageIndexRepository
   */
  retrieve(userId: string): Record<string, IImageSet> {
    const userCache = this.#getUserCache(userId);

    log(userId, 'ImageIndexRepository', 'retrieve', 'read', 'full cache');

    return userCache;
  }

  /**
   * Retrieve the data from a cache.
   * 
   * @param {string} userId
   * @param {TMediaType} mediaType
   * @param {number} index
   * @returns {(IPlexMediaContainer | IPlayniteGamesContainer)}
   * @memberof ImageIndexRepository
   */
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

  /**
   * Retrieve the weighted cache.
   * 
   * @param {string} userId
   * @returns {Record<string, IImageSet>}
   * @memberof ImageIndexRepository
   */
  retrieveWeighted(userId: string): IWeightedCache[] {
    const userCache = this.#getUserWeightedCache(userId);

    log(userId, 'ImageIndexRepository', 'retrieve', 'read', 'full cache');

    return userCache;
  }

  /**
   * Shift an index from the weighted cache.
   * 
   * @param {string} mediaType
   * @returns {number}
   * @memberof ImageIndexRepository
   */
  getWeightedIndex(userId: string): IWeightedCache {
    const userWeightedCache = this.#getUserWeightedCache(userId);
    const item = userWeightedCache.shift();

    log(userId, 'ImageIndexRepository', 'getWeightedIndex', 'shift', `${userWeightedCache.length} remaining.`);

    return item as IWeightedCache;
  }

  /**
   * Check if the caches have valid data.
   * 
   * @param {string} userId
   * @returns {boolean}
   * @memberof ImageIndexRepository
   */
  hasValidCaches(userId: string): boolean {
    const userCache = this.#getUserCache(userId);

    // TODO: you can do more robust checks here, e.g. check expiration times

    const result = mediaTypes.every((mediaType) => {
      return !!userCache[mediaType]?.remaining;
    });

    log(userId, 'ImageIndexRepository', 'hasValidCache', 'read', result.toString());

    return result;
  }

  /**
   * Check if the cache has valid weighted data.
   * 
   * @param {string} userId
   * @returns {boolean}
   * @memberof ImageIndexRepository
   */
  hasValidWeightedCache(userId: string): boolean {
    const userWeightedCache = this.#getUserWeightedCache(userId);

    const result = userWeightedCache.length > 0;

    log(userId, 'ImageIndexRepository', 'hasValidWeightedCache', 'read', result.toString());

    return result;
  }

  /**
   * Get the invalid cache hits.
   * 
   * @param {string} userId
   * @returns {TMediaType[]}
   * @memberof ImageIndexRepository
   */
  getInvalidCacheHits(userId: string): TMediaType[] {
    const userCache = this.#getUserCache(userId);

    const result = mediaTypes.filter((mediaType) => {
      return !userCache[mediaType]?.remaining;
    });

    log(userId, 'ImageIndexRepository', 'getInvalidCacheHits', 'read', result.toString());

    return result;
  }

  /**
   * Get the user's cache.
   * 
   * @private
   * @param {string} userId
   * @returns {Record<string, IImageSet>}
   * @memberof ImageIndexRepository
   */
  #getUserCache(userId: string): Record<string, IImageSet> {
    if (!this.cache[userId]) {
      this.cache[userId] = {};
    }
    return this.cache[userId];
  }

  /**
   * Get the user's weighted cache.
   * 
   * @private
   * @param {string} userId
   * @returns {IWeightedCache[]}
   * @memberof ImageIndexRepository
   */
  #getUserWeightedCache(userId: string): IWeightedCache[] {
    if (!this.weightedCache[userId]) {
      this.weightedCache[userId] = [];
    }
    return this.weightedCache[userId];
  }
}
