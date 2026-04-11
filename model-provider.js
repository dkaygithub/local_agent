/**
 * Multi-provider model resolution.
 *
 * Parses qualified model ID strings ("provider:model-id") and creates
 * LanguageModel instances using the appropriate AI SDK provider package.
 *
 * Provider packages are dynamically imported so that only the packages
 * for providers actually in use need to be installed.
 *
 * Adding a new provider requires:
 * 1. Adding the identifier to ProviderId
 * 2. Adding a case to createLanguageModel()
 * 3. Optionally adding a key field to UserConfig
 * 4. Installing the @ai-sdk/<provider> package
 */
/**
 * Returns a proxy-aware fetch function if HTTPS_PROXY or HTTP_PROXY is set.
 * Memoized: the ProxyAgent and fetch wrapper are created once and reused.
 */
let cachedProxyFetch;
let cachedProxyUrl;
async function getProxyFetch() {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (!proxyUrl)
        return undefined;
    if (cachedProxyFetch && cachedProxyUrl === proxyUrl)
        return cachedProxyFetch;
    const { ProxyAgent, fetch: undiciFetch } = await import('undici');
    const dispatcher = new ProxyAgent(proxyUrl);
    // undici's fetch types are structurally incompatible with globalThis.fetch
    // but fully compatible at runtime. The AI SDK only uses standard fetch semantics.
    const proxyFetch = (input, init) => undiciFetch(input, {
        ...init,
        dispatcher,
    });
    cachedProxyUrl = proxyUrl;
    cachedProxyFetch = proxyFetch;
    return cachedProxyFetch;
}
/** Default provider when no prefix is specified. */
const DEFAULT_PROVIDER = 'anthropic';
/** Known provider identifiers for validation. */
const KNOWN_PROVIDERS = new Set(['anthropic', 'google', 'openai']);
/**
 * Parses a qualified model ID string into provider and model components.
 *
 * Format: "provider:model-id" or just "model-id" (defaults to anthropic).
 *
 * @throws Error if the model ID is empty after a recognized provider prefix (e.g. "anthropic:").
 * Unknown prefixes are treated as part of the model ID and default to the anthropic provider.
 */
export function parseModelId(qualifiedId) {
    const colonIndex = qualifiedId.indexOf(':');
    if (colonIndex === -1) {
        return { provider: DEFAULT_PROVIDER, modelId: qualifiedId };
    }
    const prefix = qualifiedId.substring(0, colonIndex);
    // Only treat the prefix as a provider if it's a known provider name.
    // Otherwise the entire string is a model ID (e.g. Ollama tags like
    // "qwen3.5-uncensored:35b" where the colon separates name from tag).
    if (!KNOWN_PROVIDERS.has(prefix)) {
        return { provider: DEFAULT_PROVIDER, modelId: qualifiedId };
    }
    const modelId = qualifiedId.substring(colonIndex + 1);
    if (!modelId) {
        throw new Error(`Empty model ID in "${qualifiedId}". ` + `Expected format: "provider:model-id"`);
    }
    return { provider: prefix, modelId };
}
/**
 * Creates a LanguageModel from a qualified model ID and user config.
 *
 * Resolves the API key from config based on the model's provider,
 * then delegates to createLanguageModelFromEnv().
 *
 * @param qualifiedId - Model specifier like "anthropic:claude-sonnet-4-6"
 * @param config - Resolved user config for API key lookup
 * @returns A LanguageModelV3 instance ready for use with generateText()
 */
export async function createLanguageModel(qualifiedId, config) {
    const { provider } = parseModelId(qualifiedId);
    return createLanguageModelFromEnv(qualifiedId, resolveApiKeyForProvider(provider, config), resolveBaseUrlForProvider(provider, config));
}
/**
 * Creates a LanguageModel from a qualified model ID and an explicit API key.
 *
 * Unlike createLanguageModel(), this does not require a ResolvedUserConfig.
 * Designed for use in the proxy process, which receives the model ID and
 * API key via environment variables.
 *
 * @param qualifiedId - Model specifier like "anthropic:claude-haiku-4-5"
 * @param apiKey - Explicit API key for the model's provider (empty string uses env/default)
 * @returns A LanguageModelV3 instance ready for use with generateText()
 */
export async function createLanguageModelFromEnv(qualifiedId, apiKey, baseURL) {
    const { provider, modelId } = parseModelId(qualifiedId);
    const key = apiKey || undefined;
    const url = baseURL || undefined;
    const fetch = await getProxyFetch();
    switch (provider) {
        case 'anthropic': {
            const { createAnthropic } = await import('@ai-sdk/anthropic');
            return createAnthropic({ apiKey: key, baseURL: url, fetch })(modelId);
        }
        case 'google': {
            const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
            return createGoogleGenerativeAI({ apiKey: key, baseURL: url, fetch })(modelId);
        }
        case 'openai': {
            const { createOpenAI } = await import('@ai-sdk/openai');
            
            const fetchInterceptor = async (input, init) => {
                let currentFetch = fetch || globalThis.fetch;
                if (init && init.body && typeof init.body === 'string') {
                    try {
                        const bodyData = JSON.parse(init.body);
                        
                        // Deep scrub function to brutally murder any 'item_reference' object anywhere
                        const scrub = (obj) => {
                            if (Array.isArray(obj)) {
                                return obj.filter(item => !(item && item.type === 'item_reference')).map(scrub);
                            } else if (obj !== null && typeof obj === 'object') {
                                const newObj = {};
                                for (const [key, value] of Object.entries(obj)) {
                                    newObj[key] = scrub(value);
                                }
                                return newObj;
                            }
                            return obj;
                        };
                        
                        const scrubbedData = scrub(bodyData);
                        
                        // Log exactly what's going to Ollama to trace deep hidden structures
                        console.log('Sending to Ollama:', JSON.stringify(scrubbedData, null, 2));
                        
                        init.body = JSON.stringify(scrubbedData);
                    } catch (e) { }
                }
                return currentFetch(input, init);
            };

            return createOpenAI({ apiKey: key, baseURL: url, fetch: fetchInterceptor, compatibility: 'compatible' })(modelId);
        }
    }
}
/**
 * Resolves the API key for a given provider from user config.
 * Returns empty string when no key is configured.
 */
export function resolveApiKeyForProvider(provider, config) {
    switch (provider) {
        case 'anthropic':
            return config.anthropicApiKey;
        case 'google':
            return config.googleApiKey;
        case 'openai':
            return config.openaiApiKey;
    }
}
/**
 * Resolves the base URL override for a given provider from user config.
 * Returns empty string when no override is configured.
 */
export function resolveBaseUrlForProvider(provider, config) {
    switch (provider) {
        case 'anthropic':
            return config.anthropicBaseUrl;
        case 'google':
            return config.googleBaseUrl;
        case 'openai':
            return config.openaiBaseUrl;
    }
}
//# sourceMappingURL=model-provider.js.map