/** @typedef {import('../protocols/errors.js').IdentityError} IdentityError */
/** @typedef {import('../errors.js').ProviderError} ProviderError */
/**
 * A chain's configuration for its identity manager (e.g., the network and where its identity providers are listed).
 *
 * @typedef {Object<string, any>} IdentityConfig
 */
/**
 * An organisation that verifies a person (or a company) and issues an identity.
 *
 * @typedef {Object} IdentityProvider
 * @property {string} id - The provider's identifier, as `startVerification` takes it.
 * @property {string} name - The provider's display name.
 * @property {string} [description] - A short description, for the wallet's provider list.
 * @property {string} [url] - The provider's website.
 */
/**
 * A reference to one identity held by the manager. Its content is chain-specific: the wallet keeps it and passes it
 * back, without reading it.
 *
 * @typedef {Object<string, any>} IdentityReference
 */
/**
 * An account created from an identity.
 *
 * @typedef {Object} IdentityAccount
 * @property {string} path - The account's derivation path, as the chain's wallet manager's `getAccountByPath` takes it.
 * @property {string} address - The account's address.
 */
/**
 * What a wallet may show about an identity: no personal data.
 *
 * @typedef {Object} IdentitySummary
 * @property {IdentityReference} identity - The identity's reference.
 * @property {string} [provider] - The identifier of the provider that issued it.
 * @property {Date} [createdAt] - When it was issued.
 * @property {Date} [validTo] - When it stops being valid.
 * @property {IdentityAccount[]} [accounts] - The accounts created from it, if known.
 */
/**
 * @typedef {Object} StartVerificationOptions
 * @property {string} provider - The identifier of the provider to verify with.
 * @property {string} returnUrl - Where the provider sends the user back to, with its reply.
 */
/**
 * @typedef {Object} VerificationStart
 * @property {string} url - The provider's page, for the user to open.
 * @property {IdentityReference} identity - The reference of the identity being issued, for `completeVerification`.
 */
/**
 * @typedef {Object} CreateAccountOptions
 * @property {number} [index] - Which account of the identity to create (default: the next free one).
 */
/**
 * A request from a website to prove facts about the user (in the chain's own format).
 *
 * @typedef {Object<string, any> | string} ProofRequest
 */
/**
 * The answer to a proof request (in the chain's own format), for the website to check.
 *
 * @typedef {Object<string, any>} Presentation
 */
/** @interface */
export class IIdentityManager {
    /**
     * Returns the identity providers the user can verify with.
     *
     * @returns {Promise<IdentityProvider[]>} The identity providers.
     * @throws {ProviderError} If the list of providers cannot be read.
     */
    getProviders(): Promise<IdentityProvider[]>;
    /**
     * Starts the verification of a new identity with a provider.
     *
     * @param {StartVerificationOptions} options - The verification's options.
     * @returns {Promise<VerificationStart>} The provider's page for the user to open, and the new identity's reference.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {ValueError} If the options are not valid.
     * @throws {IdentityError} If the provider cannot be used.
     */
    startVerification(options: StartVerificationOptions): Promise<VerificationStart>;
    /**
     * Collects an identity once the provider has verified the user.
     *
     * @param {IdentityReference} identity - The identity's reference, from `startVerification`.
     * @param {string} reply - The provider's reply (e.g., the address the provider sent the user back to).
     * @returns {Promise<IdentitySummary>} The identity's summary.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the provider refused the identity, or the reply is not for this identity.
     */
    completeVerification(identity: IdentityReference, reply: string): Promise<IdentitySummary>;
    /**
     * Finds the user's identities and their accounts again from the seed alone (e.g., on a new device).
     *
     * @returns {Promise<IdentitySummary[]>} The identities found, each with its accounts.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {ProviderError} If a provider or the chain cannot be reached.
     */
    recover(): Promise<IdentitySummary[]>;
    /**
     * Creates an account from an identity.
     *
     * @param {IdentityReference} identity - The identity's reference.
     * @param {CreateAccountOptions} [options] - The account's options.
     * @returns {Promise<IdentityAccount>} The new account's path and address.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the identity is not held, has expired, or has no accounts left.
     */
    createAccount(identity: IdentityReference, options?: CreateAccountOptions): Promise<IdentityAccount>;
    /**
     * Exports an identity, for the wallet to keep in its own secure storage. The result is sensitive: keep it like the
     * seed phrase.
     *
     * @param {IdentityReference} identity - The identity's reference.
     * @returns {Promise<string>} The exported identity.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the identity is not held.
     */
    exportIdentity(identity: IdentityReference): Promise<string>;
    /**
     * Imports an identity exported earlier, after checking it belongs to this seed.
     *
     * @param {string} exported - The exported identity.
     * @returns {Promise<IdentitySummary>} The identity's summary.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the export cannot be read or does not belong to this seed.
     */
    importIdentity(exported: string): Promise<IdentitySummary>;
    /**
     * Proves facts to a website from the identity itself, without naming an account (where the chain allows it).
     *
     * @param {IdentityReference} identity - The identity's reference.
     * @param {ProofRequest} request - The website's request.
     * @returns {Promise<Presentation>} The answer, for the website to check.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the request is not valid, or the identity cannot prove it.
     */
    prove(identity: IdentityReference, request: ProofRequest): Promise<Presentation>;
    /**
     * Disposes the identity manager, erasing its copy of the seed and any identity it holds from memory.
     */
    dispose(): void;
}
/**
 * Abstract base class for a chain's identity manager.
 *
 * An identity manager sits at the wallet's level, next to the chain's wallet manager, and receives the same seed: it
 * verifies the user's identity with an identity provider, creates accounts from it, and finds both again from the
 * seed alone. Proving from a given account is done by the chain's identity protocol (see `IdentityProtocol`).
 *
 * @abstract
 * @implements {IIdentityManager}
 */
export default class IdentityManager implements IIdentityManager {
    /**
     * Creates a new identity manager.
     *
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase, or its seed.
     * @param {IdentityConfig} [config] - The identity manager's configuration.
     * @throws {ValueError} If the seed phrase is not valid.
     */
    constructor(seed: string | Uint8Array, config?: IdentityConfig);
    /**
     * The identity manager's own copy of the seed (erased on dispose, without touching the caller's).
     *
     * @protected
     * @type {Uint8Array}
     */
    protected _seed: Uint8Array;
    /**
     * The identity manager's configuration.
     *
     * @protected
     * @type {IdentityConfig}
     */
    protected _config: IdentityConfig;
    /**
     * @private
     * @type {boolean}
     */
    private _disposed;
    /**
     * True if the identity manager has been disposed.
     *
     * @type {boolean}
     */
    get disposed(): boolean;
    /**
     * The seed of the identity manager.
     *
     * @type {Uint8Array}
     * @throws {DisposalError} If the identity manager has been disposed.
     */
    get seed(): Uint8Array;
    /**
     * Returns the identity providers the user can verify with.
     *
     * @abstract
     * @returns {Promise<IdentityProvider[]>} The identity providers.
     * @throws {ProviderError} If the list of providers cannot be read.
     */
    getProviders(): Promise<IdentityProvider[]>;
    /**
     * Starts the verification of a new identity with a provider.
     *
     * @abstract
     * @param {StartVerificationOptions} options - The verification's options.
     * @returns {Promise<VerificationStart>} The provider's page for the user to open, and the new identity's reference.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {ValueError} If the options are not valid.
     * @throws {IdentityError} If the provider cannot be used.
     */
    startVerification(options: StartVerificationOptions): Promise<VerificationStart>;
    /**
     * Collects an identity once the provider has verified the user.
     *
     * @abstract
     * @param {IdentityReference} identity - The identity's reference, from `startVerification`.
     * @param {string} reply - The provider's reply (e.g., the address the provider sent the user back to).
     * @returns {Promise<IdentitySummary>} The identity's summary.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the provider refused the identity, or the reply is not for this identity.
     */
    completeVerification(identity: IdentityReference, reply: string): Promise<IdentitySummary>;
    /**
     * Finds the user's identities and their accounts again from the seed alone (e.g., on a new device).
     *
     * @abstract
     * @returns {Promise<IdentitySummary[]>} The identities found, each with its accounts.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {ProviderError} If a provider or the chain cannot be reached.
     */
    recover(): Promise<IdentitySummary[]>;
    /**
     * Creates an account from an identity.
     *
     * @abstract
     * @param {IdentityReference} identity - The identity's reference.
     * @param {CreateAccountOptions} [options] - The account's options.
     * @returns {Promise<IdentityAccount>} The new account's path and address.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the identity is not held, has expired, or has no accounts left.
     */
    createAccount(identity: IdentityReference, options?: CreateAccountOptions): Promise<IdentityAccount>;
    /**
     * Exports an identity, for the wallet to keep in its own secure storage. The result is sensitive: keep it like the
     * seed phrase.
     *
     * @abstract
     * @param {IdentityReference} identity - The identity's reference.
     * @returns {Promise<string>} The exported identity.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the identity is not held.
     */
    exportIdentity(identity: IdentityReference): Promise<string>;
    /**
     * Imports an identity exported earlier, after checking it belongs to this seed.
     *
     * @abstract
     * @param {string} exported - The exported identity.
     * @returns {Promise<IdentitySummary>} The identity's summary.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the export cannot be read or does not belong to this seed.
     */
    importIdentity(exported: string): Promise<IdentitySummary>;
    /**
     * Proves facts to a website from the identity itself, without naming an account (where the chain allows it).
     *
     * @abstract
     * @param {IdentityReference} identity - The identity's reference.
     * @param {ProofRequest} request - The website's request.
     * @returns {Promise<Presentation>} The answer, for the website to check.
     * @throws {DisposalError} If the identity manager has been disposed.
     * @throws {IdentityError} If the request is not valid, or the identity cannot prove it.
     */
    prove(identity: IdentityReference, request: ProofRequest): Promise<Presentation>;
    /**
     * Disposes the identity manager, erasing its copy of the seed from memory. Subclasses that hold identities erase
     * them too, and call `super.dispose()`.
     */
    dispose(): void;
}
export type IdentityError = import("../protocols/errors.js").IdentityError;
export type ProviderError = import("../errors.js").ProviderError;
/**
 * A chain's configuration for its identity manager (e.g., the network and where its identity providers are listed).
 */
export type IdentityConfig = {
    [x: string]: any;
};
/**
 * An organisation that verifies a person (or a company) and issues an identity.
 */
export type IdentityProvider = {
    /**
     * - The provider's identifier, as `startVerification` takes it.
     */
    id: string;
    /**
     * - The provider's display name.
     */
    name: string;
    /**
     * - A short description, for the wallet's provider list.
     */
    description?: string;
    /**
     * - The provider's website.
     */
    url?: string;
};
/**
 * A reference to one identity held by the manager. Its content is chain-specific: the wallet keeps it and passes it
 * back, without reading it.
 */
export type IdentityReference = {
    [x: string]: any;
};
/**
 * An account created from an identity.
 */
export type IdentityAccount = {
    /**
     * - The account's derivation path, as the chain's wallet manager's `getAccountByPath` takes it.
     */
    path: string;
    /**
     * - The account's address.
     */
    address: string;
};
/**
 * What a wallet may show about an identity: no personal data.
 */
export type IdentitySummary = {
    /**
     * - The identity's reference.
     */
    identity: IdentityReference;
    /**
     * - The identifier of the provider that issued it.
     */
    provider?: string;
    /**
     * - When it was issued.
     */
    createdAt?: Date;
    /**
     * - When it stops being valid.
     */
    validTo?: Date;
    /**
     * - The accounts created from it, if known.
     */
    accounts?: IdentityAccount[];
};
export type StartVerificationOptions = {
    /**
     * - The identifier of the provider to verify with.
     */
    provider: string;
    /**
     * - Where the provider sends the user back to, with its reply.
     */
    returnUrl: string;
};
export type VerificationStart = {
    /**
     * - The provider's page, for the user to open.
     */
    url: string;
    /**
     * - The reference of the identity being issued, for `completeVerification`.
     */
    identity: IdentityReference;
};
export type CreateAccountOptions = {
    /**
     * - Which account of the identity to create (default: the next free one).
     */
    index?: number;
};
/**
 * A request from a website to prove facts about the user (in the chain's own format).
 */
export type ProofRequest = {
    [x: string]: any;
} | string;
/**
 * The answer to a proof request (in the chain's own format), for the website to check.
 */
export type Presentation = {
    [x: string]: any;
};
