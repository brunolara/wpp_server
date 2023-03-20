import {BotController} from "../ecommercebank/BotController";
import {AvailableRoutes} from "../model/AvailableRoute";
import {Buttons, Message} from "whatsapp-web.js";

export default {
    [AvailableRoutes.INFO]:  BotController.handleInfo,
    [AvailableRoutes.QUOTE]: BotController.handleCotacao,
    [AvailableRoutes.CLOSED]:  BotController.handleFechar,
    [AvailableRoutes.CONTRACT]: BotController.handleContrato,
    [AvailableRoutes.CONTRACTS]: BotController.handleGetContracts,
    [AvailableRoutes.HATE]: BotController.handleHate,
    [AvailableRoutes.QUOTE_ALIAS]: BotController.handleCotacao,
}

