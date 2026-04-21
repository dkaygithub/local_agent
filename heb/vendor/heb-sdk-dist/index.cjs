"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ENDPOINTS: () => ENDPOINTS,
  ERROR_CODES: () => ERROR_CODES,
  GRAPHQL_HASHES: () => GRAPHQL_HASHES,
  HEBAuthError: () => HEBAuthError,
  HEBCartError: () => HEBCartError,
  HEBClient: () => HEBClient,
  HEBError: () => HEBError,
  HEBProductError: () => HEBProductError,
  HEBSearchError: () => HEBSearchError,
  HEBSessionError: () => HEBSessionError,
  MOBILE_GRAPHQL_HASHES: () => MOBILE_GRAPHQL_HASHES,
  SHOPPING_CONTEXT_TO_CATEGORIES: () => SHOPPING_CONTEXT_TO_CATEGORIES,
  addToCart: () => addToCart,
  buildBearerHeaders: () => buildBearerHeaders,
  buildHeaders: () => buildHeaders,
  checkoutCart: () => checkoutCart,
  commitCheckout: () => commitCheckout,
  createSession: () => createSession,
  createSessionFromCookies: () => createSessionFromCookies,
  createTokenSession: () => createTokenSession,
  ensureFreshSession: () => ensureFreshSession,
  formatAccountDetails: () => formatAccountDetails,
  formatCart: () => formatCart,
  formatCookieHeader: () => formatCookieHeader,
  formatCurbsideSlots: () => formatCurbsideSlots,
  formatDeliverySlots: () => formatDeliverySlots,
  formatHomepageData: () => formatHomepageData,
  formatOrderDetails: () => formatOrderDetails,
  formatOrderHistory: () => formatOrderHistory,
  formatProductDetails: () => formatProductDetails,
  formatProductListItem: () => formatProductListItem,
  formatShoppingList: () => formatShoppingList,
  formatShoppingLists: () => formatShoppingLists,
  formatStoreSearch: () => formatStoreSearch,
  formatWeeklyAd: () => formatWeeklyAd,
  formatWeeklyAdCategories: () => formatWeeklyAdCategories,
  formatter: () => formatter,
  getAccountDetails: () => getAccountDetails,
  getCart: () => getCart,
  getCurbsideSlots: () => getCurbsideSlots,
  getDeliverySlots: () => getDeliverySlots,
  getErrorMessages: () => getErrorMessages,
  getHomepage: () => getHomepage,
  getOrder: () => getOrder,
  getOrders: () => getOrders,
  getProductDetails: () => getProductDetails,
  getProductImageBytes: () => getProductImageBytes,
  getProductImageUrl: () => getProductImageUrl,
  getProductSkuId: () => getProductSkuId,
  getSessionInfo: () => getSessionInfo,
  getShoppingList: () => getShoppingList,
  getShoppingLists: () => getShoppingLists,
  getWeeklyAdProducts: () => getWeeklyAdProducts,
  graphqlRequest: () => graphqlRequest,
  hasErrorCode: () => hasErrorCode,
  isSessionAuthenticated: () => isSessionAuthenticated,
  isSessionValid: () => isSessionValid,
  parseCookies: () => parseCookies,
  parseJwtExpiry: () => parseJwtExpiry,
  persistedQuery: () => persistedQuery,
  quickAdd: () => quickAdd,
  removeFromCart: () => removeFromCart,
  reserveSlot: () => reserveSlot,
  resolveEndpoint: () => resolveEndpoint,
  resolveShoppingContext: () => resolveShoppingContext,
  searchProducts: () => searchProducts,
  searchStores: () => searchStores,
  setStore: () => setStore,
  typeahead: () => typeahead,
  updateCartItem: () => updateCartItem,
  updateTokenSession: () => updateTokenSession
});
module.exports = __toCommonJS(index_exports);

// src/logger.ts
function logDebug(session, label, data) {
  if (session.debug) {
    const output = typeof data === "string" ? data : JSON.stringify(data);
    console.log(`DEBUG: ${label}: ${output}`);
  }
}

// src/types.ts
var SHOPPING_CONTEXT_TO_CATEGORIES = {
  EXPLORE_MY_STORE: "instoreview",
  CURBSIDE_PICKUP: "cspview",
  CURBSIDE_DELIVERY: "csdview"
};
var GRAPHQL_HASHES = {
  cartItemV2: "ade8ec1365c185244d42f9cc4c13997fec4b633ac3c38ff39558df92b210c6d0",
  cartEstimated: "7b033abaf2caa80bc49541e51d2b89e3cc6a316e37c4bd576d9b5c498a51e9c5",
  typeaheadContent: "1ed956c0f10efcfc375321f33c40964bc236fff1397a4e86b7b53cb3b18ad329",
  ModifiableOrderDetailsRequest: "24fe4f6d8f4d3ae8927af0a7d07b8c57abcb303cdd277cd9bb4e022ca1d33b8e",
  ReserveTimeslot: "8b4800e25b070c15448237c7138530f1e1b3655ad3745a814cd5226c144da524",
  listDeliveryTimeslotsV2: "2085a738c42670ed52a42ab190b1f5ae178bb22ac444838e5d1c810cb6e4bf3c",
  listPickupTimeslotsV2: "7f9e10c23b1415ebf350493414b2e55e18c81c63f0571cf35f8dd155c9f3a9a0",
  StoreSearch: "e01fa39e66c3a2c7881322bc48af6a5af97d49b1442d433f2d09d273de2db4b6",
  SelectPickupFulfillment: "8fa3c683ee37ad1bab9ce22b99bd34315b2a89cfc56208d63ba9efc0c49a6323",
  getShoppingListsV2: "954a24fe9f3cf6f904fdb602b412e355271dbc8b919303ae84c8328e555e99fa",
  getShoppingListV2: "085fcaef4f2f05ee16ea44c1489801e7ae7e7a95311cbf6d7a3f09135f0ea557",
  checkoutCart: "03e4113cfab0823bc8b1293a394a5810340510e8e6979d0a8e007f8aaa0dc9cb",
  commitCheckout: "8e5cf5d2970c566514c3a82ad4f5442d466050c66a263afd5198ac7f66f12b17"
};
var MOBILE_GRAPHQL_HASHES = {
  AddShoppingListItemsV2: "9a765bfdf1b8d86a47203db1dc30283b49a122ae44a60856962e915a68dd58d1",
  Categories: "bb5e592b7ec6fffc7d1119e161e372b2bc3f734451c67cd31681e1f3c2150b15",
  CreateShoppingListV2: "c9a2ad895fe213436c488a485e302f09885aeffde0874ea875b65dfdad364fc2",
  DiscoverDetail: "5d6b1718d1a46004bbeba75eefbe47ab7fbcff457cb05f9833bce13ef030af53",
  DiscoverLayout: "0a7739f1eb9948cc2441655debe193ea82518e9f2f58116349061494f2a450a5",
  GeneralAlerts: "5c00d628856fbf19957e95353e487532f9e9ad39cc2f3916ceb978b2288ee996",
  GetCommunicationPreferences: "93dbb05d7170de1aedef60c13d92e77a39d85528558f1347207f89d0abbebe09",
  GetShoppingListsV2: "ef8f8b5e95ae7cffe88061a05ed04af72955fafd03cf62fc2561ed16469bb586",
  HistoricCashbackEstimate: "e7946966558ba21fd4adf773bc798c98d79eb22870f03060ad93c20bc6f9e937",
  Me: "0bba145a4d719b3fdf7802a3a5486123de626508e1206cdd2edf8a1f23b9dd43",
  MyAddresses: "5bc59d0d204ff3275a5070ddf882e561b25c7fb6e0f2a68171b16c573b49e4b8",
  ProductDetailsPage: "33606eddd452a659bdca241515df51d516ac5ec2d3904a147701f804b3e39bc3",
  ProductSearchPageV2: "a723225732e31edad1e7ab28f26177b57e7257c7f457b714d77951f56c85e63e",
  TypeaheadContent: "1023d49aab70d3b12c0fc578a61dccd8509f2936601f98f71afd4935bf73ea78",
  activeOrderCards: "a19327298d78c7aae47ecef59778bd167b2938e7779851f532d132f7175e2a27",
  activeStatusCards: "cc547e0525844273db36778f100966315b70aa51b0f0ea482b064d686143e383",
  addItemToCartV2: "ba00328429c15935088d93be84cc41b4f0032c388e8ccd11cd3ee5b8e7d77e41",
  cartV2: "d57a76ebe19efdb3a06323afa65eb176a1c92e478ab9916742fba3cb2cc9f075",
  couponSummary: "d947c24ff085a4ef457b39baf8cba1d11d1b4ce920de89da00e1913bf7eecd83",
  defaultFulfillment: "0f3524c3b63fee83ae98dcd276b3c2eb6cfacaed93ff244cbb8aea64c75e2d3d",
  entryPoint: "ae99ee7a646405d3037928df0d80179230901d28bc01dfd17b580c168b952980",
  getFrequentlyPurchasedProducts: "644fb3c508b4c5687aac2c63aa1a0fa14c7860a99de61187735c65f1a44ba460",
  getPaymentCards: "6aa8dc2ef29f185645ac72ee52d599333cf7f810e837a33552d29ade4a7cf786",
  listPickupTimeslotsV2: "ad0fc3510d927e690693b64db501769e3fac7a572f34251d56f4f301f72f6b92",
  nextAvailableTimeslot: "bb8426c74e096ed99da046bc79fb3df1b2d98d97455c2fe90bcfa1e1396e5e22",
  orderDetails: "bd1ba9beb2e4af8a4099965d1b4ce455d28532e8b727d490f3a7df6486d5508f",
  orderHistory: "24c9d9f68669313a33d559f8a1c86360125af36533d28725b2e7c955ab5b5619",
  readyOrders: "34309a819913e2d4ef854adcce0b7056b0ed3c67770c9995b8a1772e09dda9cd",
  reserveTimeslotV3: "97163d9114d723db8dce5ea76d5bf297955de3b0cb46baef426428f10917d2a6",
  searchCouponsV2: "9167a6a0455d21aa581bd0d46326d797d3f65b2262569c1641a4db57943e87c4",
  sortOrderDimensions: "1345024de7e1af61e9b55d35c746fb6b42082cf1e0ce33df742c6da12d5d07e7",
  WhatsNew: "cdd192bb9b472537384cca9d7de863a638311f6d06f010010b12827c8d85c5b8",
  weeklyAdProductCategoryPage: "1f827f085cdd170d56e510cf0dce475a82957b5c038efaf80534c1b65c6b2aee",
  weeklyAdLandingPageInfo: "f4dc8f7f319415b33a16d00e9c8b1c3b3eb84d19c6ad48be96b29311e1a30ff2"
};
var ENDPOINTS = {
  graphql: "https://www.heb.com/graphql",
  graphqlMobile: "https://api-edge.heb-ecom-api.hebdigital-prd.com/graphql",
  login: "https://www.heb.com/sign-in",
  home: "https://www.heb.com/"
};

// src/session.ts
var CLIENT_NAME = "WebPlatform-Solar (Production)";
var MOBILE_USER_AGENT = "MyHEB/5.9.0.60733 (iOS 18.7.2; iPhone16,2) CFNetwork/1.0 Darwin/24.6.0";
function formatCookieHeader(cookies) {
  return Object.entries(cookies).filter(([_, value]) => value !== void 0 && value !== "").map(([name, value]) => `${name}=${value}`).join("; ");
}
function buildHeaders(cookies) {
  const headers = {
    "apollographql-client-name": CLIENT_NAME,
    "apollographql-client-version": "unknown",
    "content-type": "application/json"
  };
  const cookieHeader = formatCookieHeader(cookies);
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }
  return headers;
}
function buildBearerHeaders(tokens, options) {
  const headers = {
    authorization: `${tokens.tokenType ?? "Bearer"} ${tokens.accessToken}`,
    "content-type": "application/json"
  };
  if (options?.clientName) {
    headers["apollographql-client-name"] = options.clientName;
  }
  if (options?.clientVersion) {
    headers["apollographql-client-version"] = options.clientVersion;
  }
  if (options?.userAgent) {
    headers["user-agent"] = options.userAgent;
  }
  return headers;
}
function normalizeHeaders(headers) {
  const normalized = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string" && value.length > 0) {
      normalized[key] = value;
    }
  }
  return normalized;
}
function parseJwtExpiry(sat) {
  try {
    const [, payload] = sat.split(".");
    if (!payload) return void 0;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );
    if (typeof decoded.exp === "number") {
      return new Date(decoded.exp * 1e3);
    }
  } catch {
  }
  return void 0;
}
function resolveTokenExpiry(tokens) {
  if (tokens.expiresAt instanceof Date) return tokens.expiresAt;
  if (typeof tokens.expiresIn === "number" && tokens.expiresIn > 0) {
    return new Date(Date.now() + tokens.expiresIn * 1e3);
  }
  return parseJwtExpiry(tokens.accessToken);
}
function isSessionValid(session) {
  if (!session.expiresAt) {
    if (session.authMode === "bearer") {
      return Boolean(session.tokens?.accessToken);
    }
    return Boolean(session.cookies.sat);
  }
  const bufferMs = 60 * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() < session.expiresAt.getTime() - bufferMs;
}
function isSessionAuthenticated(session) {
  if (session.authMode === "bearer") {
    return Boolean(session.tokens?.accessToken);
  }
  return Boolean(session.cookies.sat);
}
function createSession(cookies) {
  return {
    cookies,
    headers: buildHeaders(cookies),
    expiresAt: parseJwtExpiry(cookies.sat),
    authMode: "cookie"
  };
}
function createTokenSession(tokens, options) {
  const cookies = options?.cookies ?? { sat: "", reese84: "", incap_ses: "" };
  const endpoints = {
    graphql: ENDPOINTS.graphqlMobile,
    home: ENDPOINTS.home,
    ...options?.endpoints ?? {}
  };
  const expiresAt = resolveTokenExpiry(tokens);
  return {
    cookies,
    tokens,
    headers: buildBearerHeaders(tokens, { userAgent: options?.userAgent ?? MOBILE_USER_AGENT }),
    expiresAt,
    authMode: "bearer",
    endpoints
  };
}
function updateTokenSession(session, tokens, options) {
  session.tokens = tokens;
  session.authMode = "bearer";
  session.headers = buildBearerHeaders(tokens, { userAgent: options?.userAgent ?? MOBILE_USER_AGENT });
  session.expiresAt = resolveTokenExpiry(tokens);
  if (!session.endpoints) {
    session.endpoints = { graphql: ENDPOINTS.graphqlMobile, home: ENDPOINTS.home };
  } else {
    session.endpoints = { graphql: ENDPOINTS.graphqlMobile, home: ENDPOINTS.home, ...session.endpoints };
  }
}
async function ensureFreshSession(session) {
  if (session.authMode !== "bearer") return;
  if (!session.refresh) return;
  const now = Date.now();
  const expiresAt = session.expiresAt?.getTime();
  const bufferMs = 60 * 1e3;
  if (expiresAt && now < expiresAt - bufferMs) return;
  await session.refresh();
}
function resolveEndpoint(session, key) {
  return session.endpoints?.[key] ?? ENDPOINTS[key];
}
function resolveShoppingContext(session) {
  return session.shoppingContext ?? session.cookies?.shoppingContext ?? "CURBSIDE_PICKUP";
}
function getShoppingMode(context) {
  return context.includes("CURBSIDE") ? "CURBSIDE" : "ONLINE";
}
function getSessionInfo(session) {
  return {
    storeId: session.cookies?.CURR_SESSION_STORE ?? "not set",
    isValid: isSessionValid(session),
    expiresAt: session.expiresAt,
    shoppingContext: resolveShoppingContext(session)
  };
}

// src/api.ts
var ERROR_CODES = {
  INVALID_PRODUCT_STORE: "INVALID_PRODUCT_STORE",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND"
};
async function graphqlRequest(session, payload) {
  await ensureFreshSession(session);
  const headers = normalizeHeaders(session.headers);
  logDebug(session, `${payload.operationName} request`, payload);
  const response = await fetch(resolveEndpoint(session, "graphql"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const body = await response.text();
    logDebug(session, `${payload.operationName} error response`, body);
    throw new Error(`HEB API request failed: ${response.status} ${response.statusText}
${body}`);
  }
  const json = await response.json();
  logDebug(session, `${payload.operationName} response`, json);
  return json;
}
async function persistedQuery(session, operationName, variables) {
  const { hash, resolvedOperationName } = resolvePersistedQuery(session, operationName);
  return graphqlRequest(session, {
    operationName: resolvedOperationName,
    variables,
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: hash
      }
    }
  });
}
var MOBILE_QUERY_MAP = {
  cartItemV2: "addItemToCartV2",
  cartEstimated: "cartV2",
  typeaheadContent: "TypeaheadContent",
  ReserveTimeslot: "reserveTimeslotV3"
};
function resolvePersistedQuery(session, operationName) {
  if (session.authMode === "bearer") {
    const mapped = MOBILE_QUERY_MAP[operationName] ?? operationName;
    const mobileHash = MOBILE_GRAPHQL_HASHES[mapped];
    if (mobileHash) {
      return { resolvedOperationName: mapped, hash: mobileHash };
    }
  }
  const webHash = GRAPHQL_HASHES[operationName];
  if (webHash) {
    return { resolvedOperationName: operationName, hash: webHash };
  }
  const available = session.authMode === "bearer" ? Array.from(/* @__PURE__ */ new Set([...Object.keys(MOBILE_GRAPHQL_HASHES), ...Object.keys(GRAPHQL_HASHES)])) : Object.keys(GRAPHQL_HASHES);
  throw new Error(`Unknown operation: ${operationName}. Available: ${available.join(", ")}`);
}
function hasErrorCode(response, code) {
  return response.errors?.some((e) => e.extensions?.code === code) ?? false;
}
function getErrorMessages(response) {
  return response.errors?.map((e) => e.message) ?? [];
}

// src/account.ts
function parseAddress(raw) {
  return {
    id: raw.addressId ?? raw.id ?? "",
    nickname: raw.nickname,
    address1: raw.address1 ?? raw.addressLine1 ?? "",
    address2: raw.address2 ?? raw.addressLine2,
    city: raw.city ?? "",
    state: raw.state ?? "",
    postalCode: raw.postalCode ?? raw.zip ?? raw.zipCode ?? "",
    isDefault: raw.isDefault ?? raw.default ?? false
  };
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function extractProfile(payload) {
  if (!payload || !isRecord(payload)) {
    return {};
  }
  const candidates = [
    payload.me,
    payload.profile,
    payload.user,
    payload.customer,
    payload.account,
    isRecord(payload.me) ? payload.me["profile"] : void 0,
    isRecord(payload.user) ? payload.user["profile"] : void 0,
    isRecord(payload.customer) ? payload.customer["profile"] : void 0
  ];
  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      return candidate;
    }
  }
  return {};
}
function extractAddresses(payload) {
  if (!payload || !isRecord(payload)) {
    return [];
  }
  const candidates = [
    payload.myAddresses,
    payload.addresses,
    payload.savedAddresses,
    payload.deliveryAddresses,
    isRecord(payload.myAddresses) ? payload.myAddresses["addresses"] : void 0
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }
  return [];
}
async function getAccountDetails(session) {
  if (session.authMode !== "bearer") {
    throw new Error("Account details require a bearer session (mobile GraphQL).");
  }
  let idTokenProfile = {};
  if (session.tokens?.idToken) {
    try {
      const payload = session.tokens.idToken.split(".")[1];
      if (payload) {
        const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
        idTokenProfile = {
          firstName: decoded.given_name,
          lastName: decoded.family_name,
          email: decoded.email,
          phone: decoded.phone_number
        };
      }
    } catch (e) {
    }
  }
  const [meResponse, addressesResponse] = await Promise.all([
    persistedQuery(session, "Me", {}),
    persistedQuery(session, "MyAddresses", {})
  ]);
  if (meResponse.errors?.length) {
    throw new Error(`Account profile fetch failed: ${meResponse.errors.map((e) => e.message).join(", ")}`);
  }
  if (addressesResponse.errors?.length) {
    throw new Error(`Account addresses fetch failed: ${addressesResponse.errors.map((e) => e.message).join(", ")}`);
  }
  const profile = extractProfile(meResponse.data);
  const rawAddresses = extractAddresses(addressesResponse.data);
  return {
    firstName: idTokenProfile.firstName ?? profile.firstName ?? profile.givenName ?? profile.given_name ?? "",
    lastName: idTokenProfile.lastName ?? profile.lastName ?? profile.familyName ?? profile.family_name ?? "",
    email: idTokenProfile.email ?? profile.email ?? "",
    phone: idTokenProfile.phone ?? profile.phone,
    dateOfBirth: profile.dateOfBirth,
    memberSince: profile.memberSince,
    loyaltyNumber: profile.loyaltyNumber ?? profile.hPlusNumber,
    addresses: rawAddresses.map(parseAddress)
  };
}
function formatAccountDetails(account) {
  const addressList = account.addresses.length > 0 ? account.addresses.map((a, i) => {
    const defaultTag = a.isDefault ? " (Default)" : "";
    const nickname = a.nickname ? ` "${a.nickname}"` : "";
    return `${i + 1}.${nickname}${defaultTag} ${a.address1}${a.address2 ? `, ${a.address2}` : ""}, ${a.city}, ${a.state} ${a.postalCode}`;
  }).join("\n") : "No saved addresses";
  return [
    `**Account Profile**`,
    `Name: ${account.firstName} ${account.lastName}`,
    `Email: ${account.email}`,
    account.phone ? `Phone: ${account.phone}` : null,
    account.dateOfBirth ? `Date of Birth: ${account.dateOfBirth}` : null,
    account.memberSince ? `Member Since: ${account.memberSince}` : null,
    account.loyaltyNumber ? `Loyalty #: ${account.loyaltyNumber}` : null,
    `
**Saved Addresses:**
${addressList}`
  ].filter(Boolean).join("\n");
}

// src/cart.ts
function parseDisplayPrice(raw) {
  return {
    amount: raw?.amount ?? 0,
    formatted: raw?.formattedAmount ?? "$0.00"
  };
}
function parseMobileDisplayPrice(raw) {
  return {
    amount: raw?.amount ?? 0,
    formatted: raw?.formattedAmount ?? "$0.00"
  };
}
function calculateCartCounts(items, explicitTotal) {
  const sumQuantities = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount = explicitTotal !== void 0 && explicitTotal >= sumQuantities ? explicitTotal : sumQuantities;
  const isTruncated = explicitTotal != null && sumQuantities < explicitTotal;
  return { itemCount, isTruncated };
}
function parseMobileCartItems(items) {
  if (!items?.length) return [];
  return items.map((item) => {
    const product = item.product;
    const sku = item.sku ?? product?.skus?.[0];
    const priceSource = item.itemPrice?.salePrice ?? item.itemPrice?.listPrice ?? item.itemPrice?.adjustedTotal ?? item.itemPrice?.rawTotal;
    return {
      productId: product?.id ?? product?.productId ?? "",
      skuId: sku?.id ?? "",
      name: product?.fullDisplayName ?? product?.displayName ?? sku?.displayName,
      quantity: item.quantity ?? 0,
      price: priceSource ? parseMobileDisplayPrice(priceSource) : void 0,
      brand: product?.brand?.name,
      inStock: product?.isAvailableForCheckout ?? void 0
    };
  });
}
function parseMobileCart(cart) {
  const items = parseMobileCartItems(cart.items);
  const paymentGroups = (cart.paymentGroups ?? []).map((pg) => ({
    paymentGroupId: pg.paymentGroupId ?? "",
    paymentMethod: pg.paymentMethod ?? "",
    amount: parseMobileDisplayPrice(pg.amount),
    paymentAlias: pg.paymentAlias
  }));
  const fees = (cart.fees ?? []).map((fee) => ({
    id: fee.id ?? "",
    displayName: fee.displayName ?? "",
    feeType: fee.feeType ?? "",
    amount: parseMobileDisplayPrice(fee.priceInfo?.totalAmount),
    description: fee.feeDescription ?? void 0
  }));
  let savingsAmount = 0;
  if (cart.priceWithoutTax?.savings?.length) {
    savingsAmount = cart.priceWithoutTax.savings.reduce(
      (sum, s) => sum + (s.totalSavings?.amount ?? 0),
      0
    );
  } else if (cart.priceWithoutTax?.totalDiscounts?.amount) {
    savingsAmount = Math.abs(cart.priceWithoutTax.totalDiscounts.amount);
  }
  const savings = savingsAmount > 0 ? {
    amount: savingsAmount,
    formatted: `$${savingsAmount.toFixed(2)}`
  } : void 0;
  const { itemCount, isTruncated } = calculateCartCounts(items, cart.itemCount?.total);
  return {
    id: cart.id ?? "",
    items,
    itemCount,
    isTruncated,
    subtotal: parseMobileDisplayPrice(cart.priceWithoutTax?.subtotal),
    total: parseMobileDisplayPrice(cart.priceWithoutTax?.total),
    savings,
    paymentGroups,
    fees
  };
}
function isCartError(data) {
  return typeof data === "object" && data !== null && "__typename" in data && data.__typename === "AddItemToCartV2Error";
}
function parseCartResponse(response) {
  if (response.errors?.length) {
    if (hasErrorCode(response, ERROR_CODES.INVALID_PRODUCT_STORE)) {
      return {
        success: false,
        errors: ["Product not available at your selected store. Check CURR_SESSION_STORE cookie."]
      };
    }
    if (hasErrorCode(response, ERROR_CODES.UNAUTHORIZED)) {
      return {
        success: false,
        errors: ["Session expired or not logged in. Re-authenticate to continue."]
      };
    }
    return {
      success: false,
      errors: response.errors.map((e) => e.message)
    };
  }
  const data = response.data?.addItemToCartV2;
  if (!data) {
    return {
      success: false,
      errors: ["No response from cart API"]
    };
  }
  if (isCartError(data)) {
    return {
      success: false,
      errors: [data.message || data.title || `Cart error: ${data.code}`]
    };
  }
  const cart = data;
  if (Array.isArray(cart.items)) {
    const items2 = parseMobileCartItems(cart.items);
    const { itemCount: itemCount2, isTruncated: isTruncated2 } = calculateCartCounts(items2, cart.itemCount?.total);
    return {
      success: true,
      cart: {
        items: items2,
        itemCount: itemCount2,
        isTruncated: isTruncated2,
        subtotal: cart.priceWithoutTax?.subtotal ? parseMobileDisplayPrice(cart.priceWithoutTax.subtotal) : void 0
      }
    };
  }
  const items = (cart.commerceItems ?? []).map((item) => ({
    productId: item.productId ?? "",
    skuId: item.skuId ?? "",
    name: item.displayName,
    quantity: item.quantity ?? 0,
    price: item.price ? {
      amount: item.price.amount ?? 0,
      formatted: item.price.formattedAmount ?? ""
    } : void 0,
    imageUrl: item.productImage?.url
  }));
  const { itemCount, isTruncated } = calculateCartCounts(items);
  return {
    success: true,
    cart: {
      items,
      itemCount,
      isTruncated,
      subtotal: cart.price?.subtotal ? {
        amount: cart.price.subtotal.amount ?? 0,
        formatted: cart.price.subtotal.formattedAmount ?? ""
      } : void 0
    }
  };
}
function parseGetCartResponse(response) {
  if (response.errors?.length) {
    const errorMsg = response.errors.map((e) => e.message).join(", ");
    throw new Error(`Failed to get cart: ${errorMsg}`);
  }
  const cartV2 = response.data?.cartV2;
  if (!cartV2) {
    throw new Error("No cart data returned");
  }
  if (Array.isArray(cartV2.items)) {
    return parseMobileCart(cartV2);
  }
  const items = (cartV2.commerceItems ?? []).map((item) => ({
    productId: item.productId ?? "",
    skuId: item.skuId ?? "",
    name: item.displayName,
    quantity: item.quantity ?? 0,
    price: item.price ? parseDisplayPrice(item.price) : void 0,
    imageUrl: item.productImage?.url,
    brand: item.brand?.name,
    inStock: item.inventory?.inventoryState === "IN_STOCK"
  }));
  const paymentGroups = (cartV2.paymentGroups ?? []).map((pg) => ({
    paymentGroupId: pg.paymentGroupId ?? "",
    paymentMethod: pg.paymentMethod ?? "",
    amount: parseDisplayPrice(pg.amount),
    paymentAlias: pg.paymentAlias
  }));
  const fees = (cartV2.fees ?? []).map((fee) => ({
    id: fee.id ?? "",
    displayName: fee.displayName ?? "",
    feeType: fee.feeType ?? "",
    amount: parseDisplayPrice(fee.priceInfo?.totalAmount),
    description: fee.feeDescription ?? void 0
  }));
  let savingsAmount = 0;
  if (cartV2.price?.savings?.length) {
    savingsAmount = cartV2.price.savings.reduce(
      (sum, s) => sum + (s.totalSavings?.amount ?? 0),
      0
    );
  } else if (cartV2.price?.totalDiscounts?.amount) {
    savingsAmount = Math.abs(cartV2.price.totalDiscounts.amount);
  }
  const savings = savingsAmount > 0 ? {
    amount: savingsAmount,
    formatted: `$${savingsAmount.toFixed(2)}`
  } : void 0;
  const { itemCount, isTruncated } = calculateCartCounts(items);
  return {
    id: cartV2.id ?? "",
    items,
    itemCount,
    isTruncated,
    subtotal: parseDisplayPrice(cartV2.price?.subtotal),
    total: parseDisplayPrice(cartV2.price?.total),
    tax: cartV2.price?.tax?.amount ? parseDisplayPrice(cartV2.price.tax) : void 0,
    savings,
    paymentGroups,
    fees
  };
}
async function getCart(session) {
  const isLoggedIn = isSessionAuthenticated(session);
  const response = await persistedQuery(
    session,
    session.authMode === "bearer" ? "cartV2" : "cartEstimated",
    session.authMode === "bearer" ? { includeTax: false, isAuthenticated: isLoggedIn } : { userIsLoggedIn: isLoggedIn }
  );
  return parseGetCartResponse(response);
}
async function addToCart(session, productId, skuId, quantity) {
  const isLoggedIn = isSessionAuthenticated(session);
  const response = await persistedQuery(
    session,
    "cartItemV2",
    session.authMode === "bearer" ? {
      includeTax: false,
      isAuthenticated: isLoggedIn,
      parentOrderId: null,
      productId,
      quantity,
      skuId
    } : {
      userIsLoggedIn: isLoggedIn,
      productId,
      skuId,
      quantity
    }
  );
  return parseCartResponse(response);
}
var updateCartItem = addToCart;
async function removeFromCart(session, productId, skuId) {
  return addToCart(session, productId, skuId, 0);
}
async function quickAdd(session, productId, skuId) {
  return addToCart(session, productId, skuId, 1);
}
function formatCart(cart) {
  if (cart.items.length === 0) {
    return "Your cart is empty.";
  }
  const itemsList = cart.items.map((item, i) => {
    const price = item.price?.formatted ?? "N/A";
    const brand = item.brand ? `(${item.brand})` : "";
    return `${i + 1}. ${item.name ?? "Unknown"} ${brand} x${item.quantity} - ${price}`;
  }).join("\n");
  const totals = [
    `Subtotal: ${cart.subtotal.formatted}`,
    cart.tax ? `Tax: ${cart.tax.formatted}` : null,
    cart.savings ? `Savings: -${cart.savings.formatted}` : null,
    `**Total: ${cart.total.formatted}**`
  ].filter(Boolean).join("\n");
  let feesSection = "";
  if (cart.fees.length > 0) {
    const feesList = cart.fees.map(
      (fee) => `- ${fee.displayName}: ${fee.amount.formatted}`
    ).join("\n");
    feesSection = `

**Fees:**
${feesList}`;
  }
  let paymentSection = "";
  if (cart.paymentGroups.length > 0) {
    const payments = cart.paymentGroups.map(
      (pg) => `- ${pg.paymentMethod}${pg.paymentAlias ? ` (${pg.paymentAlias})` : ""}: ${pg.amount.formatted}`
    ).join("\n");
    paymentSection = `

**Payment Methods:**
${payments}`;
  }
  return `**Cart (${cart.itemCount} items)**

${itemsList}

${totals}${feesSection}${paymentSection}`;
}

// src/checkout.ts
async function checkoutCart(session) {
  const res = await persistedQuery(session, "checkoutCart", {});
  const errors = getErrorMessages(res);
  return {
    success: errors.length === 0,
    errors,
    raw: res.data
  };
}
async function commitCheckout(session, tosToken = "TEST_TOKEN") {
  const res = await persistedQuery(
    session,
    "commitCheckout",
    { tosToken }
  );
  const errors = getErrorMessages(res);
  const data = res.data?.commitCheckout;
  const orderId = data?.orderId ?? data?.order?.orderId ?? data?.confirmation?.orderId ?? null;
  return {
    success: errors.length === 0,
    orderId,
    errors,
    raw: res.data
  };
}

// src/utils.ts
var HEB_TIMEZONE = "America/Chicago";
function formatSlotTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    timeZone: HEB_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).toLowerCase().replace(" ", "");
}
function formatSlotDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    timeZone: HEB_TIMEZONE,
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}
function getLocalDateString(isoString) {
  const date = new Date(isoString);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HEB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}
function formatExpiryTime(isoString) {
  return formatSlotTime(isoString);
}
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}
function cleanHtml(text) {
  if (!text) return void 0;
  return text.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?(b|strong)(\s+[^>]*)?>/gi, "").replace(/&bull;/g, "\u2022").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&mdash;/g, "\u2014").replace(/&ndash;/g, "\u2013").replace(/&trade;/g, "\u2122").replace(/&reg;/g, "\xAE").replace(/&copy;/g, "\xA9").replace(/&amp;/g, "&").replace(/<[^>]*>/g, "").replace(/\n\s*\n/g, "\n").trim();
}

// src/fulfillment.ts
function mapSlot(slot, dayDate, fallbackIsFull) {
  const startTimeRaw = slot.startTime || slot.start || "";
  const endTimeRaw = slot.endTime || slot.end || "";
  const localDate = startTimeRaw ? getLocalDateString(startTimeRaw) : dayDate;
  const isFull = slot.isFull ?? fallbackIsFull;
  return {
    slotId: slot.id,
    date: new Date(startTimeRaw || dayDate),
    startTime: startTimeRaw,
    endTime: endTimeRaw,
    formattedStartTime: startTimeRaw ? formatSlotTime(startTimeRaw) : "",
    formattedEndTime: endTimeRaw ? formatSlotTime(endTimeRaw) : "",
    formattedDate: startTimeRaw ? formatSlotDate(startTimeRaw) : "",
    localDate,
    fee: slot.totalPrice?.amount || 0,
    isAvailable: isFull === void 0 ? true : !isFull,
    raw: slot
  };
}
async function getDeliverySlots(session, options) {
  const { address, days = 14 } = options;
  if (!address) {
    throw new Error("Address is required to fetch delivery slots");
  }
  const response = await persistedQuery(
    session,
    "listDeliveryTimeslotsV2",
    {
      address,
      limit: days
    }
  );
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  const slotsByDay = response.data?.listDeliveryTimeslotsV2?.slotsByDay;
  if (!slotsByDay || !Array.isArray(slotsByDay)) {
    return [];
  }
  const slots = [];
  for (const day of slotsByDay) {
    if (day.slots && Array.isArray(day.slots)) {
      for (const slot of day.slots) {
        slots.push(mapSlot(slot, day.date));
      }
    }
  }
  return slots;
}
async function getCurbsideSlots(session, options) {
  const { storeNumber, days = 14 } = options;
  const response = await persistedQuery(
    session,
    "listPickupTimeslotsV2",
    {
      storeNumber: Number(storeNumber),
      limit: days > 0 ? 2147483647 : 14
      // HEB uses max int for "all slots"
    }
  );
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  const result = response.data?.listPickupTimeslotsV2;
  if (result?.__typename === "TimeslotsStandardErrorV2") {
    throw new Error(result.message || "Failed to fetch curbside slots");
  }
  const slotsByDay = result?.slotsByDay;
  if (!slotsByDay || !Array.isArray(slotsByDay)) {
    return [];
  }
  const slots = [];
  for (const day of slotsByDay) {
    const slotsByGroup = day.slotsByGroup || [];
    for (const group of slotsByGroup) {
      if (group.slots && Array.isArray(group.slots)) {
        for (const slot of group.slots) {
          slots.push(mapSlot(slot, day.date, day.isFull));
        }
      }
    }
  }
  return slots;
}
async function reserveSlot(session, options) {
  const { slotId, date, fulfillmentType, storeId, address } = options;
  const numericStoreId = typeof storeId === "string" ? parseInt(storeId, 10) : storeId;
  const variables = {
    id: slotId,
    date,
    fulfillmentType,
    ignoreCartConflicts: false,
    storeId: numericStoreId,
    userIsLoggedIn: true
  };
  if (fulfillmentType === "PICKUP") {
    variables.pickupStoreId = String(storeId);
  } else if (fulfillmentType === "DELIVERY") {
    if (!address) {
      throw new Error("Address is required for delivery reservation");
    }
    variables.deliveryAddress = address;
  }
  const response = await persistedQuery(
    session,
    "ReserveTimeslot",
    session.authMode === "bearer" && fulfillmentType === "PICKUP" ? {
      fulfillmentPickup: { pickupStoreId: String(storeId) },
      fulfillmentType: "PICKUP",
      ignoreCartConflicts: false,
      includeTax: false,
      isAuthenticated: true,
      storeId: numericStoreId,
      timeslot: { date, id: slotId }
    } : variables
  );
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  const result = response.data?.reserveTimeslotV3;
  if (!result) {
    throw new Error("No data returned from reserveTimeslotV3");
  }
  if (result.__typename === "ReserveTimeslotErrorV3") {
    throw new Error(result.message || "Failed to reserve slot");
  }
  const timeslot = result.timeslot;
  const expiresAt = timeslot?.expiry || timeslot?.expiryDateTime;
  const expiresAtFormatted = expiresAt ? formatExpiryTime(expiresAt) : void 0;
  const deadlineMessage = expiresAtFormatted ? `Place your order by ${expiresAtFormatted} to keep this time` : void 0;
  return {
    success: true,
    orderId: result.id,
    expiresAt,
    expiresAtFormatted,
    deadlineMessage,
    raw: result
  };
}
function formatSlots(slots, typeName, emptyMessage, debug = false) {
  if (slots.length === 0) {
    return emptyMessage;
  }
  const formatted = slots.map((s) => {
    const status = s.isAvailable ? "AVAILABLE" : "FULL";
    const fee = s.fee > 0 ? `${s.fee.toFixed(2)}` : "FREE";
    const timeRange = `${s.formattedStartTime} - ${s.formattedEndTime}`;
    const utc = debug ? ` [UTC: ${s.startTime}]` : "";
    return `- [${status}] ${s.formattedDate} (${s.localDate}) ${timeRange} (${fee}) (ID: ${s.slotId})${utc}`;
  }).join("\n");
  return `Found ${slots.length} ${typeName}:

${formatted}`;
}
function formatDeliverySlots(slots, debug = false) {
  return formatSlots(slots, "slots", "No delivery slots found.", debug);
}
function formatCurbsideSlots(slots, debug = false) {
  return formatSlots(slots, "curbside slots", "No curbside pickup slots found.", debug);
}

// src/homepage.ts
var MOBILE_DEVICE = "iPhone16,2";
var MOBILE_APP_VERSION = "5.9.0";
async function getHomepage(session, options = {}) {
  if (session.authMode !== "bearer") {
    throw new Error("Homepage data requires a bearer session (mobile GraphQL).");
  }
  const storeIdRaw = session.cookies?.CURR_SESSION_STORE;
  if (!storeIdRaw) {
    throw new Error("No store selected. Set CURR_SESSION_STORE before fetching homepage.");
  }
  const storeId = Number(storeIdRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeId: ${storeIdRaw}`);
  }
  const {
    maxSections,
    maxItemsPerSection,
    includeSectionTypes,
    excludeSectionTypes,
    includeBanners = true,
    includePromotions = true,
    includeFeaturedProducts = true,
    onlyTitledSections = false
  } = options;
  const shoppingContext = resolveShoppingContext(session);
  const device = MOBILE_DEVICE;
  const version = MOBILE_APP_VERSION;
  const [entryPointRes, savingsRes, categoriesRes] = await Promise.all([
    persistedQuery(session, "entryPoint", {
      device,
      id: "home-page",
      isAuthenticated: true,
      shoppingContext,
      storeId,
      storeIdID: String(storeId),
      storeIdString: String(storeId),
      version
    }),
    persistedQuery(session, "entryPoint", {
      device,
      id: "featured-savings",
      isAuthenticated: true,
      shoppingContext,
      storeId,
      storeIdID: String(storeId),
      storeIdString: String(storeId),
      version
    }),
    persistedQuery(session, "Categories", {
      context: "cspview",
      storeId
    })
  ]);
  const errors = [
    ...entryPointRes.errors ?? [],
    ...savingsRes.errors ?? [],
    ...categoriesRes.errors ?? []
  ];
  if (errors.length) {
    throw new Error(`Homepage fetch failed: ${errors.map((e) => e.message).join(", ")}`);
  }
  const components = [
    ...extractComponents(entryPointRes.data),
    ...extractComponents(savingsRes.data)
  ];
  const matchesPattern = (type, patterns) => {
    const lowerType = type.toLowerCase();
    return patterns.some((p) => lowerType.includes(p.toLowerCase()));
  };
  let sections = [];
  const banners = [];
  const promotions = [];
  const featuredProducts = [];
  const seenBannerIds = /* @__PURE__ */ new Set();
  const seenPromoIds = /* @__PURE__ */ new Set();
  const seenProductIds = /* @__PURE__ */ new Set();
  components.forEach((component, index) => {
    const componentType = String(component?.type ?? component?.__typename ?? "component");
    const header = component?.header;
    const title = String(component?.title ?? header?.title ?? component?.heading ?? "").trim() || void 0;
    if (includeSectionTypes && includeSectionTypes.length > 0) {
      if (!matchesPattern(componentType, includeSectionTypes)) return;
    }
    if (excludeSectionTypes && excludeSectionTypes.length > 0) {
      if (matchesPattern(componentType, excludeSectionTypes)) return;
    }
    if (onlyTitledSections && !title) return;
    const rawItems = extractComponentItems(component);
    const sectionItems = [];
    const isBannerComponent = /banner|hero|carousel/i.test(componentType);
    const isPromoComponent = /promo|deal|offer/i.test(componentType);
    const itemsToProcess = maxItemsPerSection !== void 0 ? rawItems.slice(0, maxItemsPerSection === 0 ? 0 : maxItemsPerSection) : rawItems;
    itemsToProcess.forEach((item, itemIndex) => {
      const itemType = String(item?.type ?? item?.__typename ?? "").toLowerCase();
      const itemId = String(item?.id ?? item?.externalId ?? `${componentType}-${index}-${itemIndex}`);
      let mappedItem = null;
      if (includeBanners && (isBannerComponent || itemType.includes("banner") || itemType.includes("hero"))) {
        const banner = mapBanner(item, itemId, banners.length);
        if (banner) {
          if (!seenBannerIds.has(banner.id)) {
            seenBannerIds.add(banner.id);
            banners.push(banner);
          }
          mappedItem = banner;
        }
      }
      if (!mappedItem && includePromotions && (isPromoComponent || itemType.includes("promo") || itemType.includes("deal"))) {
        const promo = mapPromotion(item, itemId);
        if (promo) {
          if (!seenPromoIds.has(promo.id)) {
            seenPromoIds.add(promo.id);
            promotions.push(promo);
          }
          mappedItem = promo;
        }
      }
      if (!mappedItem && includeFeaturedProducts && isProductLike(item)) {
        const product = mapFeaturedProduct(item);
        if (product) {
          if (!seenProductIds.has(product.productId)) {
            seenProductIds.add(product.productId);
            featuredProducts.push(product);
          }
          mappedItem = product;
        }
      }
      if (!mappedItem) {
        mappedItem = {
          id: itemId,
          type: itemType || "unknown",
          name: item.text ?? item.title ?? item.name ?? "Untitled",
          ...item
        };
      }
      sectionItems.push(mappedItem);
    });
    sections.push({
      id: String(component?.id ?? component?.externalId ?? component?.uuid ?? `${componentType}-${index}`),
      type: componentType,
      title,
      itemCount: rawItems.length,
      // Total count before limiting
      items: sectionItems
      // Potentially limited items
    });
  });
  const categories = extractCategories(categoriesRes.data);
  if (categories.length) {
    const categoryType = "Categories";
    const includeCategories = (!includeSectionTypes || includeSectionTypes.length === 0 || matchesPattern(categoryType, includeSectionTypes)) && (!excludeSectionTypes || excludeSectionTypes.length === 0 || !matchesPattern(categoryType, excludeSectionTypes)) && !onlyTitledSections;
    if (includeCategories || !onlyTitledSections) {
      const categoryItems = maxItemsPerSection !== void 0 ? categories.slice(0, maxItemsPerSection === 0 ? 0 : maxItemsPerSection) : categories;
      sections.push({
        id: "categories",
        type: categoryType,
        title: "Categories",
        itemCount: categories.length,
        items: categoryItems.map((c) => ({
          id: c.id ?? "unknown",
          type: "Category",
          name: c.name ?? "Unknown Category",
          ...c
        }))
      });
    }
  }
  if (maxSections !== void 0 && maxSections > 0) {
    sections = sections.slice(0, maxSections);
  }
  return {
    banners: includeBanners ? banners : [],
    promotions: includePromotions ? promotions : [],
    featuredProducts: includeFeaturedProducts ? featuredProducts : [],
    sections
  };
}
function extractComponents(payload) {
  const components = [];
  const candidates = [
    payload?.collectionEntryPoint?.layout?.visualComponents,
    payload?.collectionEntryPoint?.layout?.components,
    payload?.entryPoint?.collectionEntryPoint?.layout?.visualComponents,
    payload?.entryPoint?.collectionEntryPoint?.layout?.components,
    payload?.nativeEntryPoint?.visualComponents,
    payload?.nativeEntryPoint?.components,
    payload?.discoverLayout?.collectionEntryPoint?.layout?.visualComponents,
    payload?.discoverLayout?.collectionEntryPoint?.layout?.components,
    payload?.discoverDetail?.collectionEntryPoint?.layout?.visualComponents,
    payload?.discoverDetail?.collectionEntryPoint?.layout?.components,
    payload?.["layout"] && payload?.layout?.visualComponents,
    payload?.["layout"] && payload?.layout?.components
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      components.push(...candidate);
    }
  }
  return components;
}
function extractComponentItems(component) {
  const keys = [
    "items",
    "cards",
    "tiles",
    "banners",
    "promotions",
    "products",
    "productList",
    "entries",
    "components",
    "textLinks",
    "carouselItems",
    "mobileAndNativeLayoutOrder",
    "moduleCards",
    "sectionOne",
    "sectionTwo",
    "sectionThree",
    "shortcutsSet"
  ];
  const results = [];
  let foundItems = false;
  for (const key of keys) {
    const value = component?.[key];
    if (Array.isArray(value)) {
      results.push(...value);
      if (value.length > 0) foundItems = true;
    } else if (value && typeof value === "object") {
      const nestedCandidates = [
        value.items,
        value.carouselItems,
        value.shortcutsSet
      ];
      for (const candidate of nestedCandidates) {
        if (Array.isArray(candidate)) {
          results.push(...candidate);
          if (candidate.length > 0) foundItems = true;
        }
      }
    }
  }
  if (!foundItems && results.length === 0) {
    if (component.imageUrl || component.image?.url || component.title || component.headline) {
      results.push(component);
    }
  }
  return results;
}
function mapBanner(item, id, position) {
  const imageUrl = resolveImageUrl(item);
  if (!imageUrl) return null;
  return {
    id,
    title: item.title ?? item.headline ?? item.name,
    subtitle: item.subtitle ?? item.subTitle,
    imageUrl,
    linkUrl: item.linkUrl ?? item.url ?? item.link?.url,
    position
  };
}
function mapPromotion(item, id) {
  const title = item.title ?? item.headline ?? item.name;
  if (!title) return null;
  return {
    id,
    title,
    description: item.description ?? item.subtitle,
    imageUrl: resolveImageUrl(item),
    linkUrl: item.linkUrl ?? item.url ?? item.link?.url
  };
}
function mapFeaturedProduct(item) {
  const productId = String(item.productId ?? item.id ?? item.product?.id ?? "");
  const name = item.name ?? item.displayName ?? item.title;
  if (!productId || !name) return null;
  const brand = item.brand?.name ?? item.brand;
  const imageUrl = resolveImageUrl(item) ?? item.thumbnailImageUrls?.[0]?.url;
  const priceAmount = item.price?.amount ?? item.price?.value;
  const priceFormatted = item.price?.formattedAmount ?? item.price?.formatted;
  return {
    productId,
    name,
    brand: typeof brand === "string" ? brand : void 0,
    imageUrl,
    price: typeof priceAmount === "number" ? priceAmount : void 0,
    priceFormatted: typeof priceFormatted === "string" ? priceFormatted : void 0
  };
}
function resolveImageUrl(item) {
  const imageUrl = item.imageUrl ?? item.image?.url ?? item.image?.src ?? item.media?.url;
  return typeof imageUrl === "string" ? imageUrl : void 0;
}
function isProductLike(item) {
  return Boolean(item.productId || item.id || item.product?.id) && Boolean(item.name || item.displayName || item.title);
}
function extractCategories(payload) {
  if (!payload) return [];
  const candidates = [
    payload.categories,
    payload.categoryTree,
    payload.categoryNavigation,
    payload.categories?.items
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }
  return [];
}
function formatHomepageData(homepage) {
  const parts = ["**H-E-B Homepage**"];
  if (homepage.banners.length > 0) {
    parts.push(`
**Banners (${homepage.banners.length}):**`);
    homepage.banners.forEach((b, i) => {
      parts.push(`${i + 1}. ${b.title ?? "Untitled"}${b.linkUrl ? ` - ${b.linkUrl}` : ""}`);
    });
  }
  if (homepage.promotions.length > 0) {
    parts.push(`
**Promotions (${homepage.promotions.length}):**`);
    homepage.promotions.forEach((p, i) => {
      parts.push(`${i + 1}. ${p.title}${p.description ? ` - ${p.description}` : ""}`);
    });
  }
  if (homepage.featuredProducts.length > 0) {
    parts.push(`
**Featured Products (${homepage.featuredProducts.length}):**`);
    homepage.featuredProducts.forEach((p, i) => {
      const price = p.priceFormatted ?? "";
      parts.push(`${i + 1}. ${p.name}${p.brand ? ` (${p.brand})` : ""} ${price} (ID: ${p.productId})`);
    });
  }
  if (homepage.sections.length > 0) {
    parts.push(`
**Content Sections (${homepage.sections.length}):**`);
    homepage.sections.forEach((s, i) => {
      parts.push(`
${i + 1}. **${s.title ?? s.type}** (${s.itemCount} items)`);
      if (s.items && s.items.length > 0) {
        s.items.forEach((item) => {
          let itemText = "";
          if ("productId" in item) {
            const priceValue = "price" in item && typeof item.price === "number" ? item.price : void 0;
            const price = item.priceFormatted ?? (priceValue ? formatCurrency(priceValue) : "");
            itemText = `${item.name} ${price}`.trim();
          } else if ("imageUrl" in item) {
            const title = "title" in item && typeof item.title === "string" ? item.title : void 0;
            itemText = title ?? "Banner";
            const subtitle = "subtitle" in item && typeof item.subtitle === "string" ? item.subtitle : void 0;
            const description = "description" in item && typeof item.description === "string" ? item.description : void 0;
            if (subtitle || description) {
              itemText += ` - ${subtitle ?? description}`;
            }
          } else {
            const name = "name" in item && typeof item.name === "string" ? item.name : void 0;
            const title = "title" in item && typeof item.title === "string" ? item.title : void 0;
            const text = "text" in item && typeof item.text === "string" ? item.text : void 0;
            itemText = name ?? title ?? text ?? "Unknown Item";
          }
          parts.push(`   - ${itemText}`);
        });
      }
    });
  }
  if (parts.length === 1) {
    parts.push("\nNo homepage content found.");
  }
  return parts.join("\n");
}

// src/orders.ts
var DEFAULT_ORDER_PAGE_SIZE = 10;
function assertBearer(session) {
  if (session.authMode !== "bearer") {
    throw new Error("Orders require a bearer session (mobile GraphQL).");
  }
}
function extractOrders(payload) {
  if (!payload) return [];
  const root = payload;
  const orderHistoryRequest = root.orderHistoryRequest ?? root.orderHistory;
  const orderHistory = orderHistoryRequest?.orderHistory ?? orderHistoryRequest;
  const orders = orderHistory?.orders ?? orderHistoryRequest?.orders ?? root.orders;
  return Array.isArray(orders) ? orders : [];
}
function normalizeOrderItem(item) {
  const product = item?.product ?? {};
  const priceObj = item?.totalUnitPrice ?? item?.unitPrice ?? {};
  const amount = typeof priceObj?.amount === "number" ? priceObj.amount : 0;
  const formattedPrice = priceObj?.formattedAmount ?? `$${amount.toFixed(2)}`;
  return {
    id: product?.id ?? "",
    name: product?.fullDisplayName ?? product?.displayName ?? product?.name ?? "",
    quantity: item?.quantity ?? 0,
    price: formattedPrice,
    unitPrice: amount,
    image: product?.thumbnailImageUrls?.[0]?.url ?? product?.image
  };
}
function normalizeHistoryOrder(order) {
  const priceDetails = order?.priceDetails ?? order?.priceSummary ?? {};
  const totalPriceSource = order?.totalPrice ?? order?.total ?? order?.orderTotal;
  const totalPrice = typeof totalPriceSource === "object" && totalPriceSource !== null ? totalPriceSource : {};
  const formattedAmount = totalPrice?.formattedAmount ?? priceDetails?.total?.formattedAmount ?? order?.grandTotal?.formattedAmount ?? order?.price?.total?.formattedAmount;
  const orderTimeslot = order?.orderTimeslot ?? {};
  const startTime = orderTimeslot?.startTime ?? orderTimeslot?.startDateTime;
  const endTime = orderTimeslot?.endTime ?? orderTimeslot?.endDateTime;
  return {
    ...order,
    totalPrice: {
      ...totalPrice,
      formattedAmount
    },
    orderTimeslot: {
      ...orderTimeslot,
      startTime,
      endTime,
      formattedStartTime: startTime ? formatSlotTime(startTime) : void 0,
      formattedEndTime: endTime ? formatSlotTime(endTime) : void 0,
      formattedDate: startTime ? formatSlotDate(startTime) : void 0
    }
  };
}
function normalizeOrderDetails(order) {
  const orderTimeslot = order?.orderTimeslot ?? order?.timeslot ?? order?.orderTimeSlot ?? {};
  const priceDetails = order?.priceDetails ?? order?.priceSummary ?? {};
  const totalPrice = order?.totalPrice ?? order?.total ?? {};
  const formattedTotal = priceDetails?.total?.formattedAmount ?? totalPrice?.formattedAmount;
  const rawItems = order?.orderItems ?? [];
  const items = rawItems.map(normalizeOrderItem);
  const startTime = orderTimeslot?.startDateTime ?? orderTimeslot?.startTime;
  const endTime = orderTimeslot?.endDateTime ?? orderTimeslot?.endTime;
  return {
    orderId: order?.orderId ?? "",
    status: order?.status ?? order?.orderStatusMessageShort ?? "",
    items,
    fulfillmentType: order?.fulfillmentType,
    orderPlacedOnDateTime: order?.orderPlacedOnDateTime ?? order?.orderPlacedOn,
    orderTimeslot: {
      startDateTime: startTime,
      endDateTime: endTime,
      formattedStartTime: startTime ? formatSlotTime(startTime) : void 0,
      formattedEndTime: endTime ? formatSlotTime(endTime) : void 0,
      formattedDate: startTime ? formatSlotDate(startTime) : void 0
    },
    priceDetails: {
      subtotal: priceDetails?.subtotal ?? totalPrice?.subtotal,
      total: formattedTotal ? { formattedAmount: formattedTotal } : priceDetails?.total,
      tax: priceDetails?.tax
    }
  };
}
async function getOrders(session, options = {}) {
  assertBearer(session);
  const page = options.page ?? 1;
  const size = Math.max(1, Math.floor(options.size ?? DEFAULT_ORDER_PAGE_SIZE));
  const offset = Math.max(0, (page - 1) * size);
  const context = resolveShoppingContext(session);
  const mode = getShoppingMode(context);
  const [active, completed] = await Promise.all([
    persistedQuery(session, "orderHistory", {
      mode,
      offset,
      omitOrderItems: false,
      size,
      status: "ACTIVE"
    }),
    persistedQuery(session, "orderHistory", {
      mode,
      offset,
      omitOrderItems: false,
      size,
      status: "COMPLETED"
    })
  ]);
  const errors = [...active.errors ?? [], ...completed.errors ?? []];
  if (errors.length) {
    throw new Error(`Order history fetch failed: ${errors.map((e) => e.message).join(", ")}`);
  }
  const activeOrders = extractOrders(active.data);
  const completedOrders = extractOrders(completed.data);
  const combined = [...activeOrders, ...completedOrders];
  const uniqueOrders = /* @__PURE__ */ new Map();
  for (const rawOrder of combined) {
    if (rawOrder?.orderId && !uniqueOrders.has(rawOrder.orderId)) {
      uniqueOrders.set(rawOrder.orderId, normalizeHistoryOrder(rawOrder));
    }
  }
  const hasMore = activeOrders.length >= size || completedOrders.length >= size;
  return {
    pageProps: {
      orders: Array.from(uniqueOrders.values())
    },
    pagination: {
      page,
      size,
      hasMore,
      nextPage: hasMore ? page + 1 : void 0,
      activeCount: activeOrders.length,
      completedCount: completedOrders.length
    }
  };
}
async function getOrder(session, orderId, includeReadyOrder = true) {
  assertBearer(session);
  const result = await persistedQuery(session, "orderDetails", {
    orderId,
    includeReadyOrder
  });
  if (result.errors?.length) {
    throw new Error(`Order details fetch failed: ${result.errors.map((e) => e.message).join(", ")}`);
  }
  const order = result.data?.orderDetails ?? result.data?.orderDetailsRequest?.order;
  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }
  const pageOrder = normalizeOrderDetails(order);
  return {
    page: { pageProps: { order: pageOrder } },
    graphql: result
  };
}
function formatOrderHistory(orders) {
  if (orders.length === 0) {
    return "No past orders found.";
  }
  const formatted = orders.map((order) => {
    const ts = order.orderTimeslot;
    const timeRange = ts?.formattedStartTime ? ` (${ts.formattedStartTime} - ${ts.formattedEndTime})` : "";
    const dateText = ts?.formattedDate ?? (ts?.startTime ? formatSlotDate(ts.startTime) : "Unknown date");
    const totalText = order.totalPrice?.formattedAmount ?? order.priceDetails?.total?.formattedAmount ?? "Unknown total";
    const statusText = order.orderStatusMessageShort ?? order.status ?? "Unknown status";
    return `* Order ID: ${order.orderId} - Date: ${dateText}${timeRange} - Total: ${totalText} (${statusText})`;
  }).join("\n");
  return `Found ${orders.length} past orders:

${formatted}

Use get_order_details(order_id) to see specific items.`;
}
function formatOrderDetails(order) {
  const normalizedItems = order.items ?? [];
  const items = normalizedItems.length > 0 ? normalizedItems.map(
    (item) => `- ${item.name} (Qty: ${item.quantity}, Price: ${item.price}) (ID: ${item.id})`
  ).join("\n") : "";
  const orderIdText = order.orderId;
  const statusText = order.status ?? "Unknown status";
  const totalText = order.priceDetails?.total?.formattedAmount ?? "Unknown total";
  const ts = order.orderTimeslot;
  const timeText = ts?.formattedDate ? `${ts.formattedDate} (${ts.formattedStartTime} - ${ts.formattedEndTime})` : "Unknown";
  return [
    `**Order ${orderIdText}**`,
    `Status: ${statusText}`,
    `Date/Time: ${timeText}`,
    `Total: ${totalText}`,
    items ? `Items:
${items}` : "Items: No items found."
  ].join("\n");
}

// src/product-mapper.ts
function parseNutrition(labels) {
  if (!labels || labels.length === 0) return void 0;
  const label = labels[0];
  const info = {
    servingSize: label.servingSize,
    servingsPerContainer: label.servingsPerContainer,
    calories: label.calories ? parseInt(label.calories) : void 0
  };
  for (const nutrient of label.nutrients ?? []) {
    switch (nutrient.title) {
      case "Total Fat":
        info.totalFat = nutrient.unit;
        for (const sub of nutrient.subItems ?? []) {
          if (sub.title === "Saturated Fat") info.saturatedFat = sub.unit;
          if (sub.title === "Trans Fat") info.transFat = sub.unit;
        }
        break;
      case "Cholesterol":
        info.cholesterol = nutrient.unit;
        break;
      case "Sodium":
        info.sodium = nutrient.unit;
        break;
      case "Total Carbohydrate":
        info.totalCarbs = nutrient.unit;
        for (const sub of nutrient.subItems ?? []) {
          if (sub.title === "Dietary Fiber") info.fiber = sub.unit;
          if (sub.title === "Total Sugars") info.sugars = sub.unit;
        }
        break;
      case "Protein":
        info.protein = nutrient.unit;
        break;
    }
  }
  return info;
}
function mapMobileFulfillment(availability) {
  if (!availability) return void 0;
  return {
    curbside: availability.includes("CURBSIDE_PICKUP"),
    delivery: availability.includes("CURBSIDE_DELIVERY") || availability.includes("DELIVERY"),
    inStore: availability.includes("IN_STORE")
  };
}
function mapMobileProduct(product, shoppingContext, options = {}) {
  const sku = product.skus?.find(
    (s) => s.productAvailability?.includes("CURBSIDE_PICKUP") || s.productAvailability?.includes("DELIVERY")
  ) ?? product.skus?.[0];
  const preferredContext = getShoppingMode(shoppingContext);
  const priceContext = sku?.contextPrices?.find((p) => p.context === preferredContext) ?? sku?.contextPrices?.find((p) => p.context === "ONLINE") ?? sku?.contextPrices?.[0];
  const priceSource = priceContext?.salePrice ?? priceContext?.listPrice;
  const unitSource = priceContext?.unitSalePrice ?? priceContext?.unitListPrice;
  const includeImages = options.includeImages ?? false;
  const images = includeImages && product.carouselImageUrls?.length ? product.carouselImageUrls : void 0;
  const cleanedDescription = product.productDescription ? cleanHtml(product.productDescription) : void 0;
  return {
    productId: product.productId ?? options.fallbackProductId ?? "",
    skuId: sku?.id ?? product.productId ?? options.fallbackProductId ?? "",
    name: product.displayName ?? "",
    brand: product.brand?.name,
    isOwnBrand: product.brand?.isOwnBrand,
    description: cleanedDescription,
    longDescription: cleanedDescription,
    rawDescription: product.productDescription,
    imageUrl: images?.[0],
    images,
    price: priceSource ? {
      amount: priceSource.amount ?? 0,
      formatted: priceSource.formattedAmount ?? "",
      unitPrice: unitSource ? {
        amount: unitSource.amount ?? 0,
        unit: unitSource.unit ?? "",
        formatted: unitSource.formattedAmount ?? ""
      } : void 0
    } : void 0,
    nutrition: parseNutrition(product.nutritionLabels),
    fulfillment: mapMobileFulfillment(sku?.productAvailability),
    ingredients: product.ingredientStatement,
    size: sku?.customerFriendlySize,
    category: product.productCategory?.name,
    isAvailable: product.isAvailableForCheckout ?? product.inAssortment ?? product.inventory?.inventoryState === "IN_STOCK",
    inStock: product.inventory?.inventoryState === "IN_STOCK",
    maxQuantity: product.maximumOrderQuantity
  };
}

// src/product.ts
function resolveStoreId(session) {
  const storeIdRaw = session.cookies?.CURR_SESSION_STORE;
  if (!storeIdRaw) {
    throw new Error(
      "No store selected. Set CURR_SESSION_STORE before fetching product details."
    );
  }
  const storeId = Number(storeIdRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeId: ${storeIdRaw}`);
  }
  return storeId;
}
async function getProductDetails(session, productId, options = {}) {
  if (session.authMode !== "bearer") {
    throw new Error(
      "Product details require a bearer session (mobile GraphQL)."
    );
  }
  return getProductDetailsMobile(session, productId, options);
}
async function getProductDetailsMobile(session, productId, options) {
  const storeId = resolveStoreId(session);
  const shoppingContext = resolveShoppingContext(session);
  const response = await persistedQuery(session, "ProductDetailsPage", {
    id: productId,
    isAuthenticated: true,
    shoppingContext,
    storeId: String(storeId),
    storeIdInt: storeId
  });
  if (response.errors?.length) {
    throw new Error(
      `Product fetch failed: ${response.errors.map((e) => e.message).join(", ")}`
    );
  }
  const product = response.data?.productDetailsPage?.product;
  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }
  return mapMobileProduct(product, shoppingContext, {
    includeImages: options.includeImages,
    fallbackProductId: productId
  });
}
async function getProductSkuId(session, productId) {
  const product = await getProductDetails(session, productId);
  if (!product.skuId) {
    throw new Error(`SKU ID not found for product ${productId}`);
  }
  return product.skuId;
}
function getProductImageUrl(productId, size = 360) {
  return `https://images.heb.com/is/image/HEBGrocery/${productId}?hei=${size}&wid=${size}`;
}
function withImageSize(url, size) {
  try {
    const u = new URL(url);
    u.searchParams.set("hei", String(size));
    u.searchParams.set("wid", String(size));
    return u.toString();
  } catch {
    return url;
  }
}
async function getProductImageBytes(productId, options = {}) {
  const url = options.url ?? getProductImageUrl(productId, options.size);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Product image fetch failed: ${res.status} ${res.statusText} (${url})`
    );
  }
  const buf = await res.arrayBuffer();
  return {
    bytes: new Uint8Array(buf),
    contentType: res.headers.get("content-type") ?? "image/jpeg",
    url
  };
}
function formatProductListItem(p, index) {
  const price = p.price?.formatted ? ` - ${p.price.formatted}` : "";
  const size = p.size ? ` - ${p.size}` : "";
  const brand = p.brand ? ` (${p.brand})` : "";
  const stock = p.inStock ? "" : " [OUT OF STOCK]";
  return `${index + 1}. ${p.name}${brand}${size}${price}${stock} (ID: ${p.productId})`;
}
function formatProductDetails(product) {
  return [
    `**${product.name}**`,
    product.brand ? `Brand: ${product.brand}` : null,
    product.price ? `Price: ${product.price.formatted}` : null,
    product.inStock !== void 0 ? `In Stock: ${product.inStock ? "Yes" : "No"}` : null,
    product.description ? `
Description: ${product.description}` : null,
    product.nutrition?.calories ? `
Nutrition: ${product.nutrition.calories} cal` : null,
    `
SKU ID: ${product.skuId}`
  ].filter(Boolean).join("\n");
}

// src/search.ts
var DEFAULT_SEARCH_LIMIT = 20;
function resolveStoreId2(session, options) {
  const storeIdRaw = options?.storeId ?? session.cookies?.CURR_SESSION_STORE;
  if (!storeIdRaw) {
    throw new Error("No store selected. Set CURR_SESSION_STORE or pass search option storeId.");
  }
  const storeId = Number(storeIdRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeId: ${storeIdRaw}`);
  }
  return storeId;
}
function resolveShoppingContext2(session, options) {
  return options?.shoppingContext ?? resolveShoppingContext(session);
}
function selectMobileSearchGrid(page) {
  const components = page?.layout?.visualComponents ?? [];
  return components.find((c) => c.__typename === "SearchGridV2") ?? components.find((c) => Array.isArray(c.items));
}
function mapMobileFacets(component) {
  if (!component) return void 0;
  const facets = [];
  if (Array.isArray(component.filters)) {
    for (const filter of component.filters) {
      const values = (filter.options ?? []).map((option) => ({
        value: option.id ?? option.displayTitle ?? "",
        count: option.count ?? 0
      }));
      facets.push({
        key: filter.id ?? "",
        label: filter.displayTitle ?? "",
        values
      });
    }
  }
  if (Array.isArray(component.categoryFilters) && component.categoryFilters.length) {
    facets.push({
      key: "category",
      label: "Category",
      values: component.categoryFilters.map((category) => ({
        value: category.categoryId ?? category.displayTitle ?? "",
        count: category.count ?? 0
      }))
    });
  }
  return facets.length ? facets : void 0;
}
async function searchProductsMobile(session, query, options = {}) {
  const limit = Math.max(1, options.limit ?? DEFAULT_SEARCH_LIMIT);
  const storeId = resolveStoreId2(session, options);
  const shoppingContext = resolveShoppingContext2(session, options);
  const response = await persistedQuery(
    session,
    "ProductSearchPageV2",
    {
      isAuthenticated: true,
      params: {
        doNotSuggestPhrase: false,
        pageSize: Math.max(50, limit),
        query,
        shoppingContext,
        storeId
      },
      searchMode: options.searchMode ?? "MAIN_SEARCH",
      searchPageLayout: "MOBILE_SEARCH_PAGE_LAYOUT",
      shoppingContext,
      storeId,
      storeIdID: String(storeId),
      storeIdString: String(storeId)
    }
  );
  if (response.errors?.length) {
    throw new Error(`Search failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const grid = selectMobileSearchGrid(response.data?.productSearchPageV2);
  const rawProducts = grid?.items ?? [];
  const validProducts = rawProducts.map((item) => mapMobileProduct(item, shoppingContext, { includeImages: options.includeImages })).filter((p) => p.productId && p.name);
  const products = validProducts.slice(0, limit);
  const totalCount = grid?.total ?? rawProducts.length;
  return {
    products,
    totalCount,
    page: 1,
    hasNextPage: Boolean(grid?.nextCursor) || totalCount > products.length,
    nextCursor: grid?.nextCursor,
    searchContextToken: grid?.searchContextToken,
    facets: mapMobileFacets(grid)
  };
}
async function typeaheadMobile(session, query) {
  const response = await persistedQuery(
    session,
    "TypeaheadContent",
    { searchMode: "MAIN_SEARCH", term: query }
  );
  if (response.errors?.length) {
    throw new Error(`Typeahead failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const recentSearches = [];
  const trendingSearches = [];
  const stack = response.data?.typeaheadContent?.verticalStack ?? [];
  for (const item of stack) {
    if (Array.isArray(item?.recentSearchTerms)) {
      recentSearches.push(...item.recentSearchTerms);
    }
    if (Array.isArray(item?.trendingSearches)) {
      trendingSearches.push(...item.trendingSearches);
    }
  }
  return {
    recentSearches,
    trendingSearches,
    allTerms: [...recentSearches, ...trendingSearches]
  };
}
async function searchProducts(session, query, options = {}) {
  if (session.authMode !== "bearer") {
    throw new Error("Search requires a bearer session (mobile GraphQL).");
  }
  return searchProductsMobile(session, query, options);
}
async function getBuyItAgain(session, options = {}) {
  if (session.authMode !== "bearer") {
    throw new Error("Buy It Again requires a bearer session (mobile GraphQL).");
  }
  return searchProductsMobile(session, "", { ...options, searchMode: "BIA_SEARCH" });
}
async function typeahead(session, query) {
  if (session.authMode === "bearer") {
    return typeaheadMobile(session, query);
  }
  const response = await persistedQuery(
    session,
    "typeaheadContent",
    { query }
  );
  if (response.errors) {
    throw new Error(`Typeahead failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const data = response.data?.typeaheadContent;
  const recentSearches = [];
  const trendingSearches = [];
  if (data?.verticalStack) {
    for (const item of data.verticalStack) {
      if (item.recentSearchTerms) {
        recentSearches.push(...item.recentSearchTerms);
      }
      if (item.trendingSearches) {
        trendingSearches.push(...item.trendingSearches);
      }
    }
  }
  if (data?.suggestions) {
    for (const s of data.suggestions) {
      if (s.term) {
        trendingSearches.push(s.term);
      }
    }
  }
  return {
    recentSearches,
    trendingSearches,
    allTerms: [...recentSearches, ...trendingSearches]
  };
}

// src/shopping-list.ts
async function getShoppingLists(session) {
  const response = await persistedQuery(
    session,
    "getShoppingListsV2",
    {}
  );
  const data = response.data?.getShoppingListsV2;
  if (!data) {
    throw new Error("Failed to fetch shopping lists");
  }
  const lists = data.lists.map((list) => ({
    id: list.id,
    name: list.name,
    itemCount: list.totalItemCount,
    store: {
      id: list.fulfillment.store.storeNumber,
      name: list.fulfillment.store.name
    },
    createdAt: new Date(list.created),
    updatedAt: new Date(list.updated)
  }));
  const pageInfo = {
    page: data.thisPage.page,
    size: data.thisPage.size,
    totalCount: data.thisPage.totalCount,
    sort: data.thisPage.sort,
    sortDirection: data.thisPage.sortDirection,
    hasMore: Boolean(data.nextPage),
    nextPage: data.nextPage?.page ?? void 0
  };
  return { lists, pageInfo };
}
async function getShoppingList(session, listId, options = {}) {
  const {
    page = 0,
    size = 500,
    sort = "CATEGORY",
    sortDirection = "ASC"
  } = options;
  const response = await persistedQuery(
    session,
    "getShoppingListV2",
    {
      input: {
        id: listId,
        page: {
          page,
          size,
          sort,
          sortDirection
        }
      }
    }
  );
  const data = response.data?.getShoppingListV2;
  if (!data) {
    throw new Error(`Shopping list ${listId} not found`);
  }
  const pageInfoSource = data.itemPage;
  const pageValue = pageInfoSource.page ?? page;
  const sizeValue = pageInfoSource.size ?? size;
  const totalCount = pageInfoSource.totalCount;
  const hasMore = typeof totalCount === "number" ? (pageValue + 1) * sizeValue < totalCount : void 0;
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? void 0,
    role: data.metadata.role,
    visibility: data.metadata.shoppingListVisibilityLevel,
    store: {
      id: data.fulfillment.store.storeNumber,
      name: data.fulfillment.store.name
    },
    createdAt: new Date(data.created),
    updatedAt: new Date(data.updated),
    items: data.itemPage.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.fullDisplayName,
      brand: item.product.brand?.name,
      checked: item.checked,
      quantity: item.quantity,
      weight: item.weight ?? void 0,
      note: item.note ?? void 0,
      category: item.groupHeader,
      price: {
        total: item.itemPrice.totalAmount,
        listPrice: item.itemPrice.listPrice,
        salePrice: item.itemPrice.salePrice,
        onSale: item.itemPrice.onSale
      },
      inStock: item.product.inventory.inventoryState === "IN_STOCK",
      imageUrl: item.product.productImageUrls.find((img) => img.size === "SMALL")?.url ?? item.product.productImageUrls[0]?.url
    })),
    pageInfo: {
      page: pageValue,
      size: sizeValue,
      totalCount,
      hasMore
    }
  };
}
function formatShoppingLists(lists) {
  if (lists.length === 0) {
    return "No shopping lists found.";
  }
  const formatted = lists.map((list, i) => {
    const itemCount = list.itemCount ?? 0;
    const updated = list.updatedAt ? ` (updated ${formatSlotDate(list.updatedAt.toISOString())})` : "";
    return `${i + 1}. ${list.name} - ${itemCount} items${updated} (ID: ${list.id})`;
  }).join("\n");
  return `Found ${lists.length} shopping lists:

${formatted}

Use get_shopping_list(list_id) to see items.`;
}
function formatShoppingList(list) {
  if (list.items.length === 0) {
    return `Shopping list "${list.name}" is empty.`;
  }
  const itemsList = list.items.map((item, i) => {
    const priceStr = item.price?.total ? ` - ${formatCurrency(item.price.total)}` : "";
    const checked = item.checked ? " [x]" : " [ ]";
    return `${i + 1}.${checked} ${item.name}${priceStr} (ID: ${item.productId})`;
  }).join("\n");
  return `**${list.name}** (${list.items.length} items)

${itemsList}`;
}

// src/stores.ts
async function searchStores(session, query, radius = 100) {
  const payload = {
    operationName: "StoreSearch",
    variables: {
      address: query,
      radius,
      fulfillmentChannels: [],
      includeEcommInactive: false,
      retailFormatCodes: ["P", "NP"]
    },
    extensions: {
      persistedQuery: {
        version: 1,
        // Hash from types.ts or hardcoded if necessary, but prefer importing if possible or using the one found
        sha256Hash: "e01fa39e66c3a2c7881322bc48af6a5af97d49b1442d433f2d09d273de2db4b6"
      }
    }
  };
  const response = await graphqlRequest(session, payload);
  if (response.errors) {
    throw new Error(`Store search failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const stores = response.data?.searchStoresByAddress?.stores || [];
  return stores.map((s) => ({
    storeNumber: String(s.store.storeNumber),
    name: s.store.name,
    address: {
      streetAddress: s.store.address.streetAddress,
      city: s.store.address.locality,
      state: s.store.address.region,
      zip: s.store.address.postalCode
    },
    distanceMiles: s.distanceMiles
  }));
}
async function setStore(session, storeId) {
  session.cookies.CURR_SESSION_STORE = storeId;
  if (session.authMode === "bearer") {
    return;
  }
  const payload = {
    operationName: "SelectPickupFulfillment",
    variables: {
      fulfillmentType: "PICKUP",
      pickupStoreId: storeId,
      ignoreCartConflicts: false,
      storeId: Number(storeId),
      userIsLoggedIn: true
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: "8fa3c683ee37ad1bab9ce22b99bd34315b2a89cfc56208d63ba9efc0c49a6323"
      }
    }
  };
  try {
    const response = await graphqlRequest(session, payload);
    if (response.errors) {
      console.warn("Set store server request failed, but cookie was updated:", response.errors);
    }
  } catch (error) {
    console.warn("Set store server request failed, but cookie was updated:", error);
  }
}
function formatStoreSearch(stores, query) {
  if (stores.length === 0) {
    return `No stores found for "${query}"`;
  }
  const formatted = stores.map(
    (s) => `- [${s.storeNumber}] ${s.name} (${s.address.city}, ${s.address.zip}) - ${s.distanceMiles?.toFixed(1) ?? "?"} miles`
  ).join("\n");
  return `Found ${stores.length} stores:

${formatted}

Use set_store(storeId) to select one.`;
}

// src/weekly-ad.ts
function resolveStoreId3(session, options) {
  const storeCodeRaw = options?.storeCode ?? session.cookies?.CURR_SESSION_STORE;
  if (!storeCodeRaw) {
    throw new Error("No store selected. Set CURR_SESSION_STORE or pass weekly ad option storeCode.");
  }
  const storeId = Number(storeCodeRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeCode: ${storeCodeRaw}`);
  }
  return storeId;
}
function normalizeLimit(limit) {
  if (limit === void 0) return 20;
  if (!Number.isFinite(limit) || limit < 0) {
    throw new Error(`Invalid limit: ${limit}`);
  }
  return Math.floor(limit);
}
function mapWeeklyAdProduct(item) {
  const sku = item.skus?.[0];
  const priceObj = sku?.contextPrices?.find((cp) => cp.context === "CURBSIDE" || cp.context === "IN_STORE") ?? sku?.contextPrices?.[0];
  const priceText = priceObj?.salePrice?.formattedAmount ?? priceObj?.listPrice?.formattedAmount ?? item.price?.salePriceString ?? item.price?.priceString;
  const saleStory = priceObj?.isOnSale ? "On Sale" : item.deal?.callout;
  return {
    id: item.productId ?? "",
    name: item.displayName ?? "",
    brand: item.brand?.name,
    imageUrl: item.carouselImageUrls?.[0] ?? item.image?.url,
    priceText,
    saleStory,
    disclaimerText: item.deal?.disclaimer,
    upc: item.twelveDigitUPC ?? sku?.twelveDigitUPC,
    skuId: sku?.id,
    storeLocation: item.productLocation?.location ?? sku?.storeLocation?.location
  };
}
async function getWeeklyAdProducts(session, options = {}) {
  const storeId = resolveStoreId3(session, options);
  const limit = normalizeLimit(options.limit);
  const shoppingContext = resolveShoppingContext(session);
  const cursor = options.cursor ? String(options.cursor) : void 0;
  const categoryFilter = options.category ? [String(options.category)] : null;
  const response = await persistedQuery(
    session,
    "weeklyAdProductCategoryPage",
    {
      filters: {
        categories: categoryFilter
        // null for all/landing
      },
      isAuthenticated: true,
      limit: Math.max(1, limit),
      shoppingContext,
      storeId,
      ...cursor ? { cursor, pageCursor: cursor } : {}
    }
  );
  let landingPageData = response.data?.weeklyAd ?? response.data?.weeklyAdProductCategoryPage;
  if (limit === 0 || !categoryFilter) {
    const landingResponse = await persistedQuery(
      session,
      "weeklyAdLandingPageInfo",
      {
        filters: {},
        isAuthenticated: true,
        storeId
      }
    );
    if (landingResponse.data?.weeklyAd) {
      landingPageData = landingResponse.data.weeklyAd;
    }
  }
  if (response.errors?.length) {
    throw new Error(`Weekly ad fetch failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const data = response.data?.weeklyAd ?? response.data?.weeklyAdProductCategoryPage;
  const productsList = data?.productPage?.products ?? data?.productSearch?.productPage?.products ?? data?.productSearch?.products ?? [];
  const cursorList = data?.productPage?.cursorList ?? data?.productSearch?.productPage?.cursorList ?? data?.productSearch?.cursorList ?? [];
  let nextCursor;
  if (cursorList.length > 0) {
    if (cursor) {
      const index = cursorList.indexOf(cursor);
      if (index >= 0 && index + 1 < cursorList.length) {
        nextCursor = cursorList[index + 1];
      }
    } else if (cursorList.length > 1) {
      nextCursor = cursorList[1];
    } else {
      nextCursor = cursorList[0];
    }
  }
  let products = productsList.map(mapWeeklyAdProduct).filter((p) => p.id && p.name);
  if (limit === 0) {
    products = [];
  } else {
    products = products.slice(0, limit);
  }
  const categorySource = landingPageData?.productSearch?.info?.filterCounts?.categories ?? data?.productSearch?.info?.filterCounts?.categories ?? [];
  const categories = categorySource.map((c) => ({
    id: String(c.filter ?? ""),
    name: c.displayName ?? "Unknown",
    count: c.count ?? 0
  }));
  return {
    products,
    totalCount: data?.productSearch?.info?.total ?? products.length,
    validFrom: data?.productSearch?.info?.total ? void 0 : void 0,
    // Dates not found in new schema yet
    validTo: void 0,
    storeCode: String(storeId),
    categories,
    cursor: nextCursor
  };
}
function formatWeeklyAd(adResults) {
  if (adResults.products.length === 0) {
    return "No products found in the weekly ad matching your filters.";
  }
  const productsList = adResults.products.map((p, i) => {
    const price = p.priceText ? ` - ${p.priceText}` : "";
    const savings = p.saleStory ? ` (${p.saleStory})` : "";
    return `${i + 1}. ${p.name}${price}${savings} (ID: ${p.id}, UPC: ${p.upc ?? "N/A"})`;
  }).join("\n");
  return [
    `**Weekly Ad (${adResults.storeCode})**`,
    adResults.validFrom && adResults.validTo ? `Valid: ${adResults.validFrom} to ${adResults.validTo}` : null,
    `Showing ${adResults.products.length} of ${adResults.totalCount} products.`,
    adResults.cursor ? `Next Cursor: ${adResults.cursor}` : null,
    `
${productsList}`
  ].filter(Boolean).join("\n");
}
function formatWeeklyAdCategories(adResults) {
  const categoriesList = adResults.categories.map(
    (c) => `- ${c.name} (ID: ${c.id}) - ${c.count} items`
  ).join("\n");
  return [
    `**Weekly Ad Categories (${adResults.storeCode})**`,
    adResults.validFrom && adResults.validTo ? `Valid: ${adResults.validFrom} to ${adResults.validTo}` : null,
    `Total Products: ${adResults.totalCount}`,
    `
**Available Categories:**
${categoriesList || "None"}`
  ].filter(Boolean).join("\n");
}

// src/client.ts
var HEBClient = class {
  constructor(session) {
    this.session = session;
  }
  /**
   * Enable or disable detailed debug logging.
   */
  setDebug(enabled) {
    this.session.debug = enabled;
  }
  /**
   * Check if the session is still valid.
   */
  isValid() {
    return isSessionValid(this.session);
  }
  /**
   * Get information about the current session.
   */
  getSessionInfo() {
    return getSessionInfo(this.session);
  }
  // ─────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────
  /**
   * Search for products using the mobile GraphQL API.
   * Requires a bearer session.
   *
   * @param query - Search query
   * @param options - Search options
   *
   * @example
   * const results = await heb.search('cinnamon rolls', { limit: 20 });
   * console.log(`Found ${results.products.length} products`);
   */
  async search(query, options) {
    return searchProducts(this.session, query, options);
  }
  /**
   * Get "Buy It Again" products (previously purchased items).
   * Requires a bearer session.
   *
   * @example
   * const results = await heb.getBuyItAgain({ limit: 20 });
   * console.log(`Found ${results.products.length} buy it again items`);
   */
  async getBuyItAgain(options) {
    return getBuyItAgain(this.session, options);
  }
  /**
   * Get typeahead/autocomplete suggestions.
   * 
   * Returns recent searches and trending searches.
   * Note: These are search terms, not product results.
   * 
   * @example
   * const result = await heb.typeahead('milk');
   * console.log('Recent:', result.recentSearches);
   * console.log('Trending:', result.trendingSearches);
   */
  async typeahead(query) {
    return typeahead(this.session, query);
  }
  // ─────────────────────────────────────────────────────────────
  // Weekly Ad
  // ─────────────────────────────────────────────────────────────
  /**
   * Fetch weekly ad products for the current store.
   */
  async getWeeklyAdProducts(options) {
    return getWeeklyAdProducts(this.session, options);
  }
  // ─────────────────────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────────────────────
  /**
   * Get full product details.
   * Requires a bearer session.
   * 
   * @example
   * const product = await heb.getProduct('1875945');
   * console.log(product.name);        // H-E-B Bakery Two-Bite Cinnamon Rolls
   * console.log(product.brand);       // H-E-B
   * console.log(product.inStock);     // true
   * console.log(product.nutrition);   // { calories: 210, ... }
   */
  async getProduct(productId, options) {
    return getProductDetails(this.session, productId, options);
  }
  /**
   * Get SKU ID for a product.
   */
  async getSkuId(productId) {
    return getProductSkuId(this.session, productId);
  }
  /**
   * Get product image URL.
   */
  getImageUrl(productId, size) {
    return getProductImageUrl(productId, size);
  }
  /**
   * Fetch product image bytes from the HEB CDN.
   *
   * Resolves the real carousel URL from product details (the deterministic
   * `/HEBGrocery/<id>` URL returns a placeholder logo for most IDs — the
   * actual asset lives at `/HEBGrocery/<zero-padded-id>-<n>`).
   *
   * Pass `options.url` to skip the lookup and fetch a specific URL directly.
   *
   * @example
   * const img = await heb.getProductImage('1875945', { size: 500 });
   * await fs.writeFile('rolls.jpg', img.bytes);
   */
  async getProductImage(productId, options) {
    if (options?.url) {
      return getProductImageBytes(productId, options);
    }
    const product = await getProductDetails(this.session, productId, { includeImages: true });
    const resolved = product.imageUrl ?? product.images?.[0];
    if (!resolved) {
      throw new Error(`No image URL found for product ${productId}`);
    }
    const size = options?.size;
    const url = size ? withImageSize(resolved, size) : resolved;
    return getProductImageBytes(productId, { ...options, url });
  }
  // ─────────────────────────────────────────────────────────────
  // Cart
  // ─────────────────────────────────────────────────────────────
  /**
   * Get the current cart contents.
   * 
   * Returns full cart with items, pricing, payment groups, and fees.
   * 
   * @example
   * const cart = await heb.getCart();
   * console.log(`Cart has ${cart.itemCount} items`);
   * console.log(`Subtotal: ${cart.subtotal.formatted}`);
   * cart.items.forEach(item => console.log(`${item.name} x${item.quantity}`));
   */
  async getCart() {
    return getCart(this.session);
  }
  /**
   * Add or update item in cart.
   * 
   * @param productId - Product ID
   * @param skuId - SKU ID (optional, will be fetched if not provided)
   * @param quantity - Quantity to set (not add)
   * 
   * @example
   * const product = await heb.getProduct('1875945');
   * await heb.addToCart(product.productId, product.skuId, 2);
   */
  async addToCart(productId, skuId, quantity) {
    const finalSkuId = skuId || await this.getSkuId(productId);
    return addToCart(this.session, productId, finalSkuId, quantity);
  }
  /**
   * Update cart item quantity.
   */
  async updateCartItem(productId, skuId, quantity) {
    const finalSkuId = skuId || await this.getSkuId(productId);
    return updateCartItem(this.session, productId, finalSkuId, quantity);
  }
  /**
   * Remove item from cart.
   */
  async removeFromCart(productId, skuId) {
    return removeFromCart(this.session, productId, skuId);
  }
  /**
   * Quick add - set quantity to 1.
   */
  async quickAdd(productId, skuId) {
    return quickAdd(this.session, productId, skuId);
  }
  /**
   * Add to cart by product ID only.
   * Fetches SKU ID automatically.
   * 
   * @example
   * // Simplest way to add a product
   * await heb.addToCartById('1875945', 2);
   */
  async addToCartById(productId, quantity) {
    const skuId = await this.getSkuId(productId);
    return this.addToCart(productId, skuId, quantity);
  }
  // ─────────────────────────────────────────────────────────────
  // Checkout
  // ─────────────────────────────────────────────────────────────
  /**
   * Begin checkout for the current cart.
   *
   * Validates the cart, reserved timeslot, and payment method.
   * Does NOT place the order — call {@link commitCheckout} after reviewing.
   */
  async checkoutCart() {
    return checkoutCart(this.session);
  }
  /**
   * Commit checkout and place the order.
   *
   * Charges the default payment method and creates the order.
   *
   * @param tosToken - Terms-of-service acknowledgement token
   */
  async commitCheckout(tosToken) {
    return commitCheckout(this.session, tosToken);
  }
  // ─────────────────────────────────────────────────────────────
  // Orders
  // ─────────────────────────────────────────────────────────────
  /**
   * Get order history (mobile GraphQL payload).
   * Requires a bearer session.
   * 
   * @example
   * const history = await heb.getOrders({ page: 1 });
   * const orders = history.pageProps?.orders ?? [];
   * console.log(`Found ${orders.length} orders`);
   */
  async getOrders(options = {}) {
    return getOrders(this.session, options);
  }
  /**
   * Get order details.
   * Requires a bearer session.
   * 
   * @param orderId - Order ID
   * @returns Raw order details payloads
   */
  async getOrder(orderId) {
    return getOrder(this.session, orderId);
  }
  // ─────────────────────────────────────────────────────────────
  // Account
  // ─────────────────────────────────────────────────────────────
  /**
   * Get account profile details.
   * Requires a bearer session.
   * 
   * Returns the user's profile information including name, email,
   * phone, and saved addresses.
   * 
   * @example
   * const account = await heb.getAccountDetails();
   * console.log(`Welcome, ${account.firstName}!`);
   * console.log(`Email: ${account.email}`);
   */
  async getAccountDetails() {
    return getAccountDetails(this.session);
  }
  // ─────────────────────────────────────────────────────────────
  // Homepage
  // ─────────────────────────────────────────────────────────────
  /**
   * Get the homepage content including banners, promotions, and featured products.
   * Requires a bearer session.
   * 
   * @param options - Optional filtering/limiting options
   * @example
   * const homepage = await heb.getHomepage();
   * console.log(`Found ${homepage.banners.length} banners`);
   * 
   * @example
   * // Get only titled carousel sections with max 5 items
   * const homepage = await heb.getHomepage({
   *   onlyTitledSections: true,
   *   includeSectionTypes: ['carousel'],
   *   maxItemsPerSection: 5,
   * });
   */
  async getHomepage(options = {}) {
    return getHomepage(this.session, options);
  }
  // ─────────────────────────────────────────────────────────────
  // Shopping Lists
  // ─────────────────────────────────────────────────────────────
  /**
   * Get all shopping lists for the current user.
   */
  async getShoppingLists() {
    return getShoppingLists(this.session);
  }
  /**
   * Get a specific shopping list with its items.
   */
  async getShoppingList(listId, options) {
    return getShoppingList(this.session, listId, options);
  }
  // ─────────────────────────────────────────────────────────────
  // Delivery
  // ─────────────────────────────────────────────────────────────
  /**
   * Get available delivery slots.
   */
  async getDeliverySlots(options) {
    return getDeliverySlots(this.session, options);
  }
  /**
   * Reserve a delivery slot.
   */
  async reserveSlot(slotId, date, address, storeId) {
    return reserveSlot(this.session, {
      slotId,
      date,
      address,
      storeId,
      fulfillmentType: "DELIVERY"
    });
  }
  // ─────────────────────────────────────────────────────────────
  // Curbside Pickup
  // ─────────────────────────────────────────────────────────────
  /**
   * Get available curbside pickup slots for a store.
   * 
   * @param options - Options with storeNumber (required)
   * @example
   * const slots = await heb.getCurbsideSlots({ storeNumber: 790 });
   * slots.forEach(s => console.log(`${s.date.toLocaleDateString()} ${s.startTime}-${s.endTime}`));
   */
  async getCurbsideSlots(options) {
    return getCurbsideSlots(this.session, options);
  }
  /**
   * Reserve a curbside pickup slot.
   * 
   * @param slotId - Slot ID from getCurbsideSlots
   * @param date - Date (YYYY-MM-DD)
   * @param storeId - Store ID
   */
  async reserveCurbsideSlot(slotId, date, storeId) {
    return reserveSlot(this.session, {
      slotId,
      date,
      storeId,
      fulfillmentType: "PICKUP"
    });
  }
  // ─────────────────────────────────────────────────────────────
  // Stores
  // ─────────────────────────────────────────────────────────────
  /**
   * Search for H-E-B stores.
   * 
   * @param query - Address, zip, or city (e.g. "78701", "Austin")
   * @example
   * const stores = await heb.searchStores('78701');
   * console.log(`Found ${stores.length} stores`);
   */
  async searchStores(query) {
    return searchStores(this.session, query);
  }
  /**
   * Set the active store for the session.
   * 
   * This updates the session cookie and makes a server request to
   * set the fulfillment context.
   * 
   * @param storeId - Store ID (e.g. "790")
   */
  async setStore(storeId) {
    return setStore(this.session, storeId);
  }
  /**
   * Set the shopping context for the session.
   * 
   * @param context - CURBSIDE_PICKUP, CURBSIDE_DELIVERY, or EXPLORE_MY_STORE
   */
  setShoppingContext(context) {
    this.session.shoppingContext = context;
    if (this.session.cookies) {
      this.session.cookies.shoppingContext = context;
    }
  }
};

// src/cookies.ts
function parseCookies(input) {
  const cookies = {
    sat: "",
    reese84: "",
    incap_ses: ""
  };
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      for (const cookie of parsed) {
        const name = cookie.name || cookie.Name;
        const value = cookie.value || cookie.Value;
        if (!name || !value) continue;
        assignCookie(cookies, name, value);
      }
      return cookies;
    }
  } catch {
  }
  const pairs = input.split(/;\s*/);
  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const name = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    assignCookie(cookies, name, value);
  }
  return cookies;
}
function assignCookie(cookies, name, value) {
  if (name === "sat") {
    cookies.sat = value;
  } else if (name === "reese84") {
    cookies.reese84 = value;
  } else if (name.startsWith("incap_ses")) {
    cookies.incap_ses = value;
    cookies[name] = value;
  } else if (name === "CURR_SESSION_STORE") {
    cookies.CURR_SESSION_STORE = value;
  } else {
    cookies[name] = value;
  }
}
function createSessionFromCookies(cookieInput) {
  const cookies = parseCookies(cookieInput);
  if (!cookies.sat) {
    throw new Error("No sat cookie found in input. Make sure you are logged in.");
  }
  return createSession(cookies);
}

// src/errors.ts
var HEBError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "HEBError";
  }
};
var HEBAuthError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBAuthError";
  }
};
var HEBSessionError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBSessionError";
  }
};
var HEBCartError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBCartError";
  }
};
var HEBProductError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBProductError";
  }
};
var HEBSearchError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBSearchError";
  }
};

// src/index.ts
var formatter = {
  account: formatAccountDetails,
  cart: formatCart,
  curbsideSlots: formatCurbsideSlots,
  deliverySlots: formatDeliverySlots,
  homepage: formatHomepageData,
  orderDetails: formatOrderDetails,
  orderHistory: formatOrderHistory,
  productDetails: formatProductDetails,
  productListItem: formatProductListItem,
  shoppingList: formatShoppingList,
  shoppingLists: formatShoppingLists,
  storeSearch: formatStoreSearch,
  weeklyAd: formatWeeklyAd,
  weeklyAdCategories: formatWeeklyAdCategories
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ENDPOINTS,
  ERROR_CODES,
  GRAPHQL_HASHES,
  HEBAuthError,
  HEBCartError,
  HEBClient,
  HEBError,
  HEBProductError,
  HEBSearchError,
  HEBSessionError,
  MOBILE_GRAPHQL_HASHES,
  SHOPPING_CONTEXT_TO_CATEGORIES,
  addToCart,
  buildBearerHeaders,
  buildHeaders,
  checkoutCart,
  commitCheckout,
  createSession,
  createSessionFromCookies,
  createTokenSession,
  ensureFreshSession,
  formatAccountDetails,
  formatCart,
  formatCookieHeader,
  formatCurbsideSlots,
  formatDeliverySlots,
  formatHomepageData,
  formatOrderDetails,
  formatOrderHistory,
  formatProductDetails,
  formatProductListItem,
  formatShoppingList,
  formatShoppingLists,
  formatStoreSearch,
  formatWeeklyAd,
  formatWeeklyAdCategories,
  formatter,
  getAccountDetails,
  getCart,
  getCurbsideSlots,
  getDeliverySlots,
  getErrorMessages,
  getHomepage,
  getOrder,
  getOrders,
  getProductDetails,
  getProductImageBytes,
  getProductImageUrl,
  getProductSkuId,
  getSessionInfo,
  getShoppingList,
  getShoppingLists,
  getWeeklyAdProducts,
  graphqlRequest,
  hasErrorCode,
  isSessionAuthenticated,
  isSessionValid,
  parseCookies,
  parseJwtExpiry,
  persistedQuery,
  quickAdd,
  removeFromCart,
  reserveSlot,
  resolveEndpoint,
  resolveShoppingContext,
  searchProducts,
  searchStores,
  setStore,
  typeahead,
  updateCartItem,
  updateTokenSession
});
