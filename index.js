'use strict';

const Promise = require('bluebird');
const NodeRestClient = require('node-rest-client-promise').Client;
const Request = require('request-promise');
const Speakeasy = require('speakeasy');
const HttpErrors = require('http-errors');
const Bunyan = require('bunyan');
const QueryString = require('querystring');
const FileType = require('file-type');

const CONST = {
    // Important: Listing must use correct category according to Gameflip terms of service.  Physical items can only be purchased
    // and shipped within the continental US states
    CATEGORY: {
        GAMES: 'CONSOLE_VIDEO_GAMES',            // Video games, digital or physical
        INGAME: 'DIGITAL_INGAME',                // In-game items, digital only
        GIFTCARD: 'GIFTCARD',                    // Gift cards, digital or physical
        CONSOLE: 'VIDEO_GAME_HARDWARE',          // Console game hardware, physical listing only
        ACCESSORIES: 'VIDEO_GAME_ACCESSORIES',   // Console game accessories, physical listing only
        TOYS: 'TOYS_AND_GAMES',                  // Collectibles, physical listing only
        VIDEO: 'VIDEO_DVD',                      // Movies, physical or digital
        OTHER: 'UNKNOWN'                         // Unsupported category
    },

    KIND: {
        ITEM: 'item',   // Item selling
        GIG:  'gig',    // Gig selling
    },

    UPC: {
        CSGO: '094922417596',
        DOTA2: '111111111111',
        TF2: '014633098693',
        RUST: '000000252490',
        PUBG: '000000578080',
        H1Z1: '000000433850',
        H1Z1_JS: '000000295110',
        FORTNITE_ALL: 'GFPCFORTNITE,GFPSFORTNITE,GFXOFORTNITE',
        FORTNITE_PC: 'GFPCFORTNITE',
        FORTNITE_PS4: 'GFPSFORTNITE',
        FORTNITE_XONE: 'GFXOFORTNITE',
        RL_ALL: '023171037943,812872018928,812872018935,GF00RLSWITCH',
        RL_STEAM: '023171037943',
        RL_PS4: '812872018928',
        RL_XONE: '812872018935',
        RL_SWITCH: 'GF00RLSWITCH'
    },
    
    PLATFORM: {
        XBOX: 'xbox',
        X360: 'xbox_360',
        XONE: 'xbox_one',
        PS1: 'playstation',
        PS2: 'playstation_2',
        PS3: 'playstation_3',
        PS4: 'playstation_4',
        PSP: 'playstation_portable',
        PSVITA: 'playstation_vita',
        N64: 'nintendo_64',
        NGAMECUBE: 'nintendo_gamecube',
        NWII: 'nintendo_wii',
        NWIIU: 'nintendo_wiiu',
        NSWITCH: 'nintendo_switch',
        NDS: 'nintendo_ds',
        NDSI: 'nintendo_dsi',
        N3DS: 'nintendo_3ds',
        STEAM: 'steam',
        ORIGIN: 'origin',
        UPLAY: 'uplay',
        GOG: 'gog',
        MOBILE: 'mobile',
        BATTLENET: 'battlenet',
        XLIVE: 'xbox_live',
        PSN: 'playstation_network',
        UNKNOWN: 'unknown'
    },
    
    // The promised time frame which you will ship a physical item or deliver a digital item
    SHIPPING_WITHIN_DAYS: {
      AUTO: 0,
      ONE: 1,
      TWO: 2,
      THREE: 3
    },
    
    // Your listing will automatically expire after these many days
    EXPIRE_IN_DAYS: {
      SEVEN: 7,
      FOURTEEN: 14,
      THIRTY: 30
    },

    ESCROW_STATUS: {
        START: 'start',                     // Initial condition: seller has Steam item(s)
        RECEIVE_PENDING: 'receive_pending', // Offer made to seller to get Steam item(s)
        RECEIVED: 'received',               // Gameflip has Steam item(s)
        LISTED: 'listed',                   // Gameflip has created listings for Steam item(s)
        STEAM_ESCROW: 'steam_escrow',       // Steam item(s) is held by Steam in escrow
        TRADE_HOLD: 'trade_hold',           // Gameflip has item(s) but there is a trade hold on them (eg, Just Survive)

        DELIVER_PENDING: 'deliver_pending', // Escrow status: Offer made to buyer, but not accepted yet
        DELIVERED: 'delivered',             // Escrow status: Buyer has item (terminal state)
        RETURN_PENDING: 'return_pending',   // Escrow status: Trade offer made to seller to return item, but not accepted yet
        RETURNED: 'returned'                // Escrow status: Seller has accepted return of item
    },

    LISTING_STATUS: {
        DRAFT: 'draft',                     // Listing is draft/editing mode.  You cannot list it when it's in this mode
        READY: 'ready',                     // Listing is ready to be listed, required fields have been filled
        ONSALE: 'onsale',                   // Listing is published to the public
        SALE_PENDING: 'sale_pending',       // A buyer just bought the listing, and payment is being processed
        SOLD: 'sold'                        // A buyer had bought the listing
    },
    
    LISTING_PHOTO_STATUS: {
        PENDING: 'pending',
        ACTIVE: 'active',
        DELETED: 'deleted'
    },
    
    LISTING_OPS: {
        TEST: 'test',
        ADD: 'add',
        REPLACE: 'replace',
        REMOVE: 'remove'
    },

    EXCHANGE_STATUS: {
        PENDING: 'pending',                       // Exchange is being created
        PENDING_CANCEL: 'pending_cancel',         // Exchange is being canceled
        PENDING_RESCINDING: 'pending_rescinding', // Exchange is being refunded
        SETTLED: 'settled',                       // Exchange has payment settled (verified and approved)
        RECEIVED: 'received',                     // Buyer has received the item
        PENDING_COMPLETION: 'pending_completion', // Exchange is being completed, happens after seller rates
        COMPLETE: 'complete',                     // Exchange completes, both buyer and seller have rated each other
        CANCELLED: 'cancelled',                   // Exchange has been cancelled, and payment authorization (if any) is also cancelled
        RESCINDED: 'rescinded'                    // Exchange has been cancelled with refund completed
    },

    ACCEPT_CURRENCY: {
        USD: 'USD',
        FLP: 'FLP',
        BOTH: 'BOTH'
    },
    
    IMAGE_MIME_TYPES: ['image/jpeg', 'image/png'],
    IMAGE_BYTE_SIZE: 500000,

    // {10: TRACE, 20: DEBUG, 30: INFO, 40: WARN, 50: ERROR, 60: FATAL}
    LOG_NAME_FROM_LEVEL: Object.keys(Bunyan.nameFromLevel).reduce(function (map, key) {
        map[key] = Bunyan.nameFromLevel[key].toUpperCase();
        return map;
    }, {}),

    BASE_URL: {
        production: 'https://production-gameflip.fingershock.com/api/v1',
        test: 'https://test-gameflip.fingershock.com/api/v1',
        development: 'http://localhost:3000/api/v1'
    },

    STEAM: {
        APP_ID: {
            CSGO:  '730',           // CS:GO
            TF2:   '440',           // Team Fortress 2
            DOTA2: '570',           // DOTA 2
            RUST:  '252490',        // Rust
            PUBG:  '578080',        // PlayerUnknown's Battlegrounds
            H1Z1_KOK:     '433850', // H1Z1: King of the Kill
            JUST_SURVIVE: '295110', // H1Z1: Just Survive
        },

        CONTEXT_ID: {
            433850: '1',  // H1Z1: King of the Kill
            295110: '1',  // Just Survive
            DEFAULT: '2'  // Default if not specified above
        },

    },
};

const Util = {
    /**
     * True if parameter is undefined, null, or empty array
     * @param x value to test
     * @return {boolean}
     */
    emptyArray: x => ((typeof x === 'undefined') || (Array.isArray(x) && x.length == 0)),

    /**
     * True if parameter is not defined or null
     * @param x value to test
     * @return {boolean}
     */
    isNull: x => ((typeof x === 'undefined') || (x === null)),

    // Picks first argument that is not undefined or null
    options: function () {
        for (let i = 0; i < arguments.length; i++) {
            let x = arguments[i];
            if ((typeof x !== 'undefined') && (x !== null)) {
                return x;
            }
        }
        return null;
    },

    // Returns query string prefixed by '?' if has values
    queryString: function (obj) {
        const qs = QueryString.stringify(obj);
        return qs ? ('?' + qs) : '';
    },

    /**
     * Current time in RFC3339 ZULU format
     */
    now: function (offsetMS = 0) {
        return (new Date(Date.now() + offsetMS)).toISOString();
    },

    /**
     * Sleep for time in seconds (Usage: await GfApi.sleep(1))
     * @param delayInSeconds
     */
    sleep: delayInSeconds => new Promise(callback => setTimeout(callback, delayInSeconds*1000))
};

class GfApi {
    /**
     * Create GfApi client
     * @constructor
     * @param {string} apiKey - API Key, eg `test-0123456789abcde`
     * @param {hash} secret - TOTP secret, eg  `{secret: 'your secret', algorithm: 'SHA1', digits: 6, period: 30}`
     * @param {hash} options Options, eg `{loglevel: 'trace'}`
     * * `logLevel`: `trace` (logs HTTP requests/responses), `debug` (logs HTTP requests), `info, `warn`, `error, or `fatal`
     */
    constructor(apiKey, secret, options = {}) {
        this.apiKey = apiKey;

        this.secret = Object.assign({
            encoding: 'base32',
            algorithm: "sha1",
            digits: 6,
            period: 30
        }, secret);

        const split = apiKey.split('-');
        this.baseUrl = (split.length == 1) ? CONST.BASE_URL.production : CONST.BASE_URL[split[0]];

        this.client = new NodeRestClient();

        this.log = Bunyan.createLogger({
            name: 'gfapi',
            level: options.logLevel || 'debug',
            stream: {
                type: 'raw',
                write: function (json) {
                    const logEntry = JSON.parse(json);
                    console.log('%s %s', CONST.LOG_NAME_FROM_LEVEL[logEntry.level], logEntry.msg);

                    const err = logEntry.err;
                    if ((typeof err !== 'undefined') && (err !== null)) {
                        console.log(err.stack);
                    }
                }
            }
        });

        this.rateLimit = require('promise-ratelimit')(1000);
    }

    /**
     * Get profile
     * @returns profile
     */
    profile_get(id) {
        let suffix = id || 'me';
        return this._get(`account/${suffix}/profile`);
    }

    /**
     * Get wallet balance and transaction history/ledger
     * NOTE: the balance amount is the lowest possible unit for that currency.  Ex: cents for USD and atto (10e-18) for FLP)
     *
     * @param options Options for data return
     *   - balance_only: Return only the wallet balance without any recent history (without ledger)
     *   - flp: Return with the "balance" property to be a map showing the balance for each currency supported
     *   - pending: Also include pending transactions
     *   - held: Also include held transactions
     *   - year_month (yyyy-mm): The year and month in which the transactions took place.  When not provided, the current month is used
     * @returns wallet information
     */
    wallet_get(opt) {
        let endpoint = 'account/me/wallet_history';
        let options = opt || { };

        if (!options.year_month && typeof options.balance_only === 'undefined') options.balance_only = true;
        if (typeof options.flp === 'undefined') options.flp = true;

        let qs = "";
        for (let prop in options) {
            if (options[prop]) qs += prop + '&';
        }
        if (qs) endpoint += "?" + qs;

        return this._get(endpoint);
    }

    wallet_flp_put(owner) {
        return this._put(`flp/account/${owner}/key`);
    }

    /**
     * Get a single listing by id. The listing owner can view any listing they own.
     * Anyone else may only view listings that are publicly viewable or get an error.
     * @param id list id
     * @returns listing
     */
    listing_get(id) {
        return this._get(`listing/${id}`);
    }
    
    /**
     * Get a user's listings.
     * @param owner of the user.
     * @returns listings
     */
    listing_of(owner) {
        return this._get(`listing?owner=${owner}`);
    }

    /**
     * Search listings.
     * @returns Array of listings or null if none left
     */
    listing_search(query) {
        return this._getList('listing', query);
    }
    
    /**
     * Create a blank listing to be edited and posted.
     * @returns listing
     */
    listing_post(query) {
        return this._post('listing', query);
    }
    
    /**
     * Update a listing with new or updated properties.
     * @param {hash} Query options.
     * @returns listing
     */
    listing_patch(id, query) {
        return this._patch(`listing/${id}`, JSON.stringify(query));
    }
    
    /**
     * Change a listing's status.
     * @param {string} id
     * @param {enum} status
     * @returns listing
     */
    listing_status(id, status) {
        return this.listing_patch(id, [{
            op: CONST.LISTING_OPS.REPLACE,
            path: '/status',
            value: status
        }]);
    }
    
    /**
     * Delete a single listing by id.
     * @param id list id
     * @returns result
     */
    async listing_delete(id) {
        await this.listing_status(id, CONST.LISTING_STATUS.DRAFT);
        return await this._delete(`listing/${id}`);
    }

    /**
     * Get digital goods from listing if any available. This method will retrieve, decrypt, and return the digital goods.
     * @param {string} listing id
     * @returns digital content previously stored for the listing
     * @errors:
     *   400 - Not a digital listing
     *   403 - Not owner
     *   404 - Listing not found
     */
    digital_goods_get(id) {
        return this._get(`listing/${id}/digital_goods`);
    }

    /**
     * Put digital goods/content for digital listing
     * @code digital code or digital content
     * @errors:
     *   400 - The `code` parameter is missing and required.  The `code` is too long, the `code` already exists, or the listing does not exist.
     *   403 - Not owner
     *   404 - Listing not found
     */
    digital_goods_put(id, code) {
        return this._put(`listing/${id}/digital_goods`, { code: code });
    }

    /**
     * Search exchanges (purchases or sold listings).
     * @returns the search result which also contains an array of exchanges owned by the API key owner
     */
    exchange_search(query) {
        return this._getList('exchange', query);
    }

    /**
     * Upload an online image to Gameflip for use as the listing's photo.
     * @param {string} listing_id to update the listing
     * @param {string} url of the photo
     * @param {int} display_order for multiple photos. If not provided then it
     * is a cover photo and is shown on the search pages (should be lower res).
     * If provided then it is a listing page photo (should be higher res), and
     * the number is its order in the photo carousel.
     * @returns {object} photo object with url
     */
    async upload_photo(listing_id, url, display_order) {
        // Download the image
        let photo_blob = await Request.get(url, {encoding: null});
        if (photo_blob.length > CONST.IMAGE_BYTE_SIZE) {
          throw new Error(`ERROR Image file size over limit: ${photo_blob.length} > ${CONST.IMAGE_BYTE_SIZE}`);
        }
        let image_type = (FileType(photo_blob))['mime'];
        if (CONST.IMAGE_MIME_TYPES.indexOf(image_type) === -1) {
          throw new Error(`ERROR Image content type not allowed: ${image_type}`);
        }
        
        // Request permission to upload
        let photo_obj = await this._post('listing/' + listing_id + '/photo');
        if (!photo_obj || !photo_obj.upload_url) {
          throw new Error('ERROR Failed POST photo to API');
        }
        
        // Upload the image
        let upload_req = await Request.put({
            url: photo_obj.upload_url,
            body: photo_blob,
            headers: {
                "Content-Type": image_type
            }
        });
        
        // Update the listing with the new image
        let patch = [{
            op: CONST.LISTING_OPS.REPLACE,
            path: '/photo/' + photo_obj.id + '/status',
            value: CONST.LISTING_PHOTO_STATUS.ACTIVE
        }];
        let order_patch = display_order >= 0 ? {
            op: CONST.LISTING_OPS.REPLACE,
            path: '/photo/' + photo_obj.id + '/display_order',
            value: display_order
        } : {
            op: CONST.LISTING_OPS.REPLACE,
            path: '/cover_photo',
            value: photo_obj.id
        };
        patch.push(order_patch);
        
        return await this.listing_patch(listing_id, patch);
    }

    /**
     * Query your escrows (subset of data fields) by status
     * @param {hash} Query options. Warning: modified by callee.
     *    status Either 'received' (default), 'delivered', 'returned'.
     *    limit # of entries to get (default: 20, max: 100)
     * @returns Array of escrows (subset of data fields) or null if none left
     */
    escrow_mine_get(query) {
        return this._getList('steam/escrow/mine', query);
    }

    /**
     * Get escrow data, if exists, for given listing id. Caller must own listing.
     * 
     * @param {uuid} listing id
     * @returns {hash} escrow data
     * **escrow.status**
     * - ```
     *  received <--> deliver_pending --> delivered
     *      ^
     *      |
     *      +----> return_pending -----> returned
     *      ```
     * - *received*: trade offer accepted and item received by bot
     * - *deliver_pending*: trade offer made to buyer but not accepted
     * - *delivered*: trade offer accepted by buyer. Initiate listing completion.
     * - *return_pending*: trade offer made to seller to return item
     * - *return*: trade offer accepted and seller has item
     */
    escrow_get(id) {
        return this._get(`steam/escrow/${id}`);
    }

    /**
     * Check if you have a Steam trade ban or hold
     * @throws UnprocessableEntityError you have trade ban or hold
     */
    check_trade_ban() {
        return this._get('steam/escrow/hold');
    }

    /**
     * Query your bulk object (subset of data fields) by status
     * @param {hash} Query options. Warning: modified by callee.
     * - status: Either 'start', 'receive_pending', 'received', 'listed', 'steam_escrow', or 'trade_hold'.
     * - limit # of entries to get (default: 20, max: 100)</ul>
     * @returns Array of bulks (subset of data fields) or null if none left
     */
    bulk_mine_get(query = CONST.ESCROW_STATUS.LISTED) {
        return this._getList('steam/bulk/mine', query);
    }

    /**
     * Get bulk object.
     *
     * @param {uuid} bulk id
     * @returns {hash} Sample result
     * ```json
     * {
     *   "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
     *   "owner": "us-east-1:ab36c6a0-2cb6-476c-809c-77a08908499f",
     *   "offer_key": "Ol4YAU5g-l0w",
     *   "status": "listed",
     *   "num_listed": 2,
     *   "listings": [
     *     {
     *        "id": "f005c650-567c-4494-85ef-57cc567d27cc",
     *        "status": "draft"
     *     }, {
     *        "id": "555f8301-2f3f-451d-b69f-7a2fe0241016",
     *        "status": "draft"
     *     }],
     *   "updated": "2017-01-21T02:29:53.511Z",
     *   "created": "2017-01-21T02:03:56.164Z"
     * }
     * ```
     *
     * **bulk.status**
     * - ```
     *                   +-- steam_escrow --+
     *                   |                  v
     *     start <-> receive_pending --> received -----> listed
     *                                      |               ^
     *                                      +-> trade_hold -+
     * ```
     * - *start*: initial state
     * - *receive_pending*: trade offer made
     * - *steam_escrow*: trade offer accepted but held by STEAM
     * - *received*: trade offer accepted and item received by bot
     * - *trade_hold*: item received by bot, but trade hold on item (e.g., Just Survive)
     * - *listed*: listings and escrows created (search index may still be pending)
     */
    bulk_get(id) {
        return this._get(`steam/bulk/${id}`);
    }

    /**
     * Create bulk object
     *
     * @returns {hash} Sample result
     * ```json
     * {
     *   "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
     *   "owner": "us-east-1:ab36c6a0-2cb6-476c-809c-77a08908499f",
     *   "offer_key": "Ol4YAU5g-l0w",
     *   "status": "start",
     *   "updated": "2017-01-21T02:29:53.511Z",
     *   "created": "2017-01-21T02:03:56.164Z"
     * }
     * ```
     * The main field you are concerned about is 'id'.
     */
    bulk_post() {
        return this._post('steam/bulk');
    }

    /**
     * Initiate trade offer or gets latest bulk object (if data parameter not specified).
     *
     * @param {uuid} id Bulk ID from bulk_post()
     * @param {hash} data Optional. If specified, create offer for items specified:
     * ```json
     * [{
     *    id: item.asset_id,
     *    appid: item.appid,
     *    price: priceInCents,
     *    market_hash_name: item.market_hash_name
     * }, {
     *    ...
     * }]
     * ```
     * If not specified, updates and returns latest bulk object.
     * @returns {hash} bulk data
     */
    bulk_put(id, data = null) {
        return this._put(`steam/bulk/${id}`, data);
    }

    /**
     * Get public steam inventory. This is not part of the Gameflip API and is an unsupported helper function.
     *
     * @param {string} profileId Profile ID of Steam User
     * @param {string} appId APP ID of game inventory to retrieve (such as, GfApi.STEAM.APP_ID.CSGO)
     * @param {hash} query parameters including l=<language> and count=<integer>
     */
    steam_inventory_get(profileid, appId, query = {}) {
        if (query.start_assetid === null) {
            return null;
        }

        const contextId = CONST.STEAM.CONTEXT_ID[appId] || CONST.STEAM.CONTEXT_ID.DEFAULT;
        const url = `http://steamcommunity.com/inventory/${profileid}/${appId}/${contextId}${Util.queryString(query)}`;
        this._entry(`GET '${url}'`);
        return this._steamResult(this.client.getPromise(url, {}), query);
    }

    // ----------------
    // HELPER FUNCTIONS
    // ----------------

    _get(uri, query = null) {
        const url = `${this.baseUrl}/${uri}${Util.queryString(query)}`;
        this._entry(`GET '${url}'`);

        return this._result(this.client.getPromise(url, {
            headers: {
                "Authorization": this._authorizationHeader()
            }
        }));
    }

    _getList(uri, query) {
        if (query.nextPage === null) {
            return null;
        }

        const url = query.nextPage || `${this.baseUrl}/${uri}${Util.queryString(query)}`;
        this._entry(`GET ${url}`);

        return this._result(this.client.getPromise(url, {
            headers: {
                "Authorization": this._authorizationHeader()
            }
        }), query);
    }

    _post(uri, data = null) {
        const url = `${this.baseUrl}/${uri}`;
        this._entry(`POST ${url} data=${JSON.stringify(data, null, 2)}`);

        const args = {
            headers: {
                "Authorization": this._authorizationHeader(),
                "Content-Type": "application/json"
            }
        };

        if (data) {
            args.data = data;
        }

        return this._result(this.client.postPromise(url, args));
    }

    _put(uri, data = null) {
        const url = `${this.baseUrl}/${uri}`;
        this._entry(`PUT ${url} data=${JSON.stringify(data, null, 2)}`);

        const args = {
            headers: {
                "Authorization": this._authorizationHeader(),
                "Content-Type": "application/json"
            }
        };

        if (data) {
            args.data = data;
        }

        return this._result(this.client.putPromise(url, args));
    }

    _patch(uri, data = null) {
        this._entry(`PATCH ${uri} data=${JSON.stringify(data, null, 2)}`);

        return this._result(this.client.patchPromise(`${this.baseUrl}/${uri}`, {
            headers: {
                "Authorization": this._authorizationHeader(),
                "Content-Type": "application/json-patch+json"
            },
            data: data
        }));
    }
    
    _delete(uri) {
        const url = `${this.baseUrl}/${uri}`;
        this._entry(`DELETE '${url}'`);

        return this._result(this.client.deletePromise(url, {
            headers: {
                "Authorization": this._authorizationHeader()
            }
        }));
    }

    _authorizationHeader() {
        return `GFAPI ${this.apiKey}:${Speakeasy.totp(this.secret)}`;
    }

    async _entry(text) {
        await this.rateLimit();
        this.log.debug(text);
    }
    
    async _result(resultPromise, query = null) {
        const result = await resultPromise;
        const apiData = result.data || {};
        if (apiData.status == 'SUCCESS') {
            this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);

            if (Util.isNull(apiData.next_page) && Util.emptyArray(apiData.data)) {
                return null;
            }

            if (query) {
                // null if apiData.next_page is undefined
                query.nextPage = Util.options(apiData.next_page);
            }

            return apiData.data;
        } else {
            const error = apiData.error || {};
            const response = result.response;
            const statusCode = Util.options(error.code, response.statusCode);
            const statusMessage = Util.options(error.message, response.statusMessage);

            this.log.trace(`FAIL: statusCode=${statusCode} statusMessage=${statusMessage}`);
            throw HttpErrors(statusCode, statusMessage);
        }
    }

    async _steamResult(resultPromise, query = null) {
        const result = await resultPromise;
        const apiData = result.data || {};
        if (apiData.success) {
            this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);

            if (Util.isNull(apiData.more_items) && Util.emptyArray(apiData.assets)) {
                return null;
            }

            if (query) {
                // null if apiData.start_assetid is undefined
                query.start_assetid = Util.options(apiData.last_assetid);
            }

            return apiData;
        } else {
            const response = result.response;
            this.log.trace(`FAIL: statusCode=${response.statusCode} statusMessage=${response.statusMessage}`);
            throw HttpErrors(response.statusCode, response.statusMessage);
        }
    }
}

module.exports = Object.assign(GfApi, CONST, Util);
