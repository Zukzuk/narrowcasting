import {
    APP_API_PATH,
    COMICS_NARROWCASTING_API_PATH,
    MEDIA_NARROWCASTING_API_PATH,
} from './config.js';

import narrowcastingBFF from './application/NarrowcastingBFF.js'; // Singleton instance
import commandHandler from './application/CommandHandler.js'; // Singleton instance

export default function orchestrate(server: any) {
    commandHandler.bootstrap();
    narrowcastingBFF.bootstrap(server, {
        APP_API_PATH,
        COMICS_NARROWCASTING_API_PATH,
        MEDIA_NARROWCASTING_API_PATH,
    });
}