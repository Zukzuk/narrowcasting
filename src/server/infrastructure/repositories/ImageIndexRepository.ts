import { log } from "../../utils.js";
import { mediaTypes, TMediaType } from "../../domain/core/types/index.js";
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

    log('ImageIndexRepository.save', 'write', `'${mediaType}' data with length ${userCache[mediaType].total}`, userId);

    return userCache[mediaType];
  }

  saveWeighted(userId: string, weightedCache: IWeightedCache[]): IWeightedCache[] {
    this.weightedCache[userId] = weightedCache;

    log('ImageIndexRepository.saveWeighted', 'write', `weighted list with length ${weightedCache.length}`, userId);

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

    log('ImageIndexRepository.retrieve', 'read', 'full userCache', userId);

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

    log('ImageIndexRepository.retrieveData', 'read', `'${mediaType}' data with index '${index}'`, userId);

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

    log('ImageIndexRepository.retrieveWeighted', 'read', 'full userWeightedCache', userId);

    return userCache;
  }

  /**
   * Shift an item from the weighted cache.
   * 
   * @param {string} mediaType
   * @returns {number}
   * @memberof ImageIndexRepository
   */
  getWeightedItem(userId: string): IWeightedCache {
    const userWeightedCache = this.#getUserWeightedCache(userId);
    const item = userWeightedCache.shift() as IWeightedCache;

    log('ImageIndexRepository.getWeightedItem', 'shift', `{mediaType:${item.mediaType}, index:${item.index}}, ${userWeightedCache.length} remaining.`, userId);

    return item;
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

    const result = mediaTypes.every((mediaType) => {
      return !!(userCache[mediaType]?.remaining) || (userCache[mediaType]?.expiration < Date.now());
    });

    log('ImageIndexRepository.hasValidCache', 'read', result.toString(), userId);

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

    log('ImageIndexRepository.hasValidWeightedCache', 'read', result.toString(), userId);

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
      return !(userCache[mediaType]?.remaining) || !(userCache[mediaType]?.expiration > Date.now());
    });

    log('ImageIndexRepository.getInvalidCacheHits', 'read', result.toString(), userId);

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
