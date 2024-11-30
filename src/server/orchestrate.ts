import {
    APP_API_PATH,
    COMICS_NARROWCASTING_API_PATH,
    MEDIA_NARROWCASTING_API_PATH,
} from './config.js';

import bffNarrowcasting from './application/backendforfrontend/NarrowcastingSingleton.js'; // Singleton instance
import commandHandler from './application/CommandHandlerSingleton.js'; // Singleton instance

export default function orchestrate(server: any) {
    commandHandler.bootstrap();
    bffNarrowcasting.bootstrap(server, {
        APP_API_PATH,
        COMICS_NARROWCASTING_API_PATH,
        MEDIA_NARROWCASTING_API_PATH,
    });
}