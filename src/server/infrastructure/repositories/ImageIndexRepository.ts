import { mediaTypes, TMediaType } from "../../domain/shared/types/index.js";
import { IPlexMediaContainer } from "../../domain/media/services/MediaImageService.js";
import { shuffleArray } from "../../utils.js";

interface IImageSet {
    total: number;
    remaining: number;
    expiration: number;
    uniqueIndexes: number[];
    data: IPlexMediaContainer[];
}

export default class ImageIndexRepository {

    private cache: Record<string, IImageSet> = {};

    constructor(private APP_CACHE_DURATION: number) { }

    save(
        mediaType: TMediaType,
        { data, total }: { data?: IPlexMediaContainer[]; total?: number }
    ): IImageSet {
        const resolvedTotal = total ?? data?.length;

        if (typeof resolvedTotal !== "number" || isNaN(resolvedTotal)) {
            throw new Error(`Invalid parameters for saving ${mediaType}. Either 'total' or 'data' with length must be provided.`);
        }

        this.cache[mediaType] = {
            total: resolvedTotal,
            remaining: resolvedTotal,
            uniqueIndexes: Array.from({ length: resolvedTotal }, (_, i) => i),
            expiration: Date.now() + this.APP_CACHE_DURATION,
            data: data ?? [],
        };

        this.#log("save", `${mediaType} with length ${this.cache[mediaType].remaining}`);

        return this.cache[mediaType];
    }

    retrieve(): Record<string, IImageSet> {
        const payload = this.cache;

        this.#log('retrieve', `complete index cache`);

        return payload;
    }

    retrieveData(mediaType: TMediaType, index: number): IPlexMediaContainer {
        const payload = this.cache[mediaType].data[index];

        this.#log('retrieve', `${mediaType} with index '${index}'`);

        return payload;
    }

    popUniqueIndex(mediaType: TMediaType): number {
        const index = Math.floor(Math.random() * this.cache[mediaType].remaining);
        this.cache[mediaType].uniqueIndexes = shuffleArray(this.cache[mediaType].uniqueIndexes);
        const value = this.cache[mediaType].uniqueIndexes.splice(index, 1)[0];
        this.cache[mediaType].remaining = this.cache[mediaType].uniqueIndexes.length;

        this.#log('popUniqueIndex', `pop ${value} from '${mediaType}' cache with length ${this.cache[mediaType].remaining}`);

        return value;
    }

    hasValidCache(): boolean {
        return mediaTypes.every(mediaType => {
            return !!this.cache[mediaType]?.remaining;
        });
    }

    getInvalidCacheHits(): TMediaType[] {
        return mediaTypes.filter(mediaType => {
            return !this.cache[mediaType]?.remaining;
        });
    }

    #log(action: string, message: string) {
        console.log(`ImageIndexRepository: ${action} -> ${message}`);
    }
}
