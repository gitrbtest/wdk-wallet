// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict'

import * as bip39 from 'bip39'

import { DisposalError, NotImplementedError, ValueError } from '../errors.js'

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
  async getProviders () {
    throw new NotImplementedError('getProviders()')
  }

  /**
   * Starts the verification of a new identity with a provider.
   *
   * @param {StartVerificationOptions} options - The verification's options.
   * @returns {Promise<VerificationStart>} The provider's page for the user to open, and the new identity's reference.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {ValueError} If the options are not valid.
   * @throws {IdentityError} If the provider cannot be used.
   */
  async startVerification (options) {
    throw new NotImplementedError('startVerification(options)')
  }

  /**
   * Collects an identity once the provider has verified the user.
   *
   * @param {IdentityReference} identity - The identity's reference, from `startVerification`.
   * @param {string} reply - The provider's reply (e.g., the address the provider sent the user back to).
   * @returns {Promise<IdentitySummary>} The identity's summary.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {IdentityError} If the provider refused the identity, or the reply is not for this identity.
   */
  async completeVerification (identity, reply) {
    throw new NotImplementedError('completeVerification(identity, reply)')
  }

  /**
   * Finds the user's identities and their accounts again from the seed alone (e.g., on a new device).
   *
   * @returns {Promise<IdentitySummary[]>} The identities found, each with its accounts.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {ProviderError} If a provider or the chain cannot be reached.
   */
  async recover () {
    throw new NotImplementedError('recover()')
  }

  /**
   * Creates an account from an identity.
   *
   * @param {IdentityReference} identity - The identity's reference.
   * @param {CreateAccountOptions} [options] - The account's options.
   * @returns {Promise<IdentityAccount>} The new account's path and address.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {IdentityError} If the identity is not held, has expired, or has no accounts left.
   */
  async createAccount (identity, options) {
    throw new NotImplementedError('createAccount(identity, options?)')
  }

  /**
   * Exports an identity, for the wallet to keep in its own secure storage. The result is sensitive: keep it like the
   * seed phrase.
   *
   * @param {IdentityReference} identity - The identity's reference.
   * @returns {Promise<string>} The exported identity.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {IdentityError} If the identity is not held.
   */
  async exportIdentity (identity) {
    throw new NotImplementedError('exportIdentity(identity)')
  }

  /**
   * Imports an identity exported earlier, after checking it belongs to this seed.
   *
   * @param {string} exported - The exported identity.
   * @returns {Promise<IdentitySummary>} The identity's summary.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {IdentityError} If the export cannot be read or does not belong to this seed.
   */
  async importIdentity (exported) {
    throw new NotImplementedError('importIdentity(exported)')
  }

  /**
   * Proves facts to a website from the identity itself, without naming an account (where the chain allows it).
   *
   * @param {IdentityReference} identity - The identity's reference.
   * @param {ProofRequest} request - The website's request.
   * @returns {Promise<Presentation>} The answer, for the website to check.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {IdentityError} If the request is not valid, or the identity cannot prove it.
   */
  async prove (identity, request) {
    throw new NotImplementedError('prove(identity, request)')
  }

  /**
   * Disposes the identity manager, erasing its copy of the seed and any identity it holds from memory.
   */
  dispose () {
    throw new NotImplementedError('dispose()')
  }
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
export default class IdentityManager {
  /**
   * Creates a new identity manager.
   *
   * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase, or its seed.
   * @param {IdentityConfig} [config] - The identity manager's configuration.
   * @throws {ValueError} If the seed phrase is not valid.
   */
  constructor (seed, config = {}) {
    if (typeof seed === 'string') {
      if (!bip39.validateMnemonic(seed)) {
        throw new ValueError('Invalid seed phrase.')
      }

      seed = bip39.mnemonicToSeedSync(seed)
    }

    if (!(seed instanceof Uint8Array)) {
      throw new ValueError('The seed must be a seed phrase or a Uint8Array.')
    }

    /**
     * The identity manager's own copy of the seed (erased on dispose, without touching the caller's).
     *
     * @protected
     * @type {Uint8Array}
     */
    this._seed = new Uint8Array(seed)

    /**
     * The identity manager's configuration.
     *
     * @protected
     * @type {IdentityConfig}
     */
    this._config = config

    /**
     * @private
     * @type {boolean}
     */
    this._disposed = false
  }

  /**
   * True if the identity manager has been disposed.
   *
   * @type {boolean}
   */
  get disposed () {
    return this._disposed
  }

  /**
   * The seed of the identity manager.
   *
   * @type {Uint8Array}
   * @throws {DisposalError} If the identity manager has been disposed.
   */
  get seed () {
    if (this._disposed) {
      throw new DisposalError('The identity manager has been disposed.')
    }

    return this._seed
  }

  /**
   * Returns the identity providers the user can verify with.
   *
   * @abstract
   * @returns {Promise<IdentityProvider[]>} The identity providers.
   * @throws {ProviderError} If the list of providers cannot be read.
   */
  async getProviders () {
    throw new NotImplementedError('getProviders()')
  }

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
  async startVerification (options) {
    throw new NotImplementedError('startVerification(options)')
  }

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
  async completeVerification (identity, reply) {
    throw new NotImplementedError('completeVerification(identity, reply)')
  }

  /**
   * Finds the user's identities and their accounts again from the seed alone (e.g., on a new device).
   *
   * @abstract
   * @returns {Promise<IdentitySummary[]>} The identities found, each with its accounts.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {ProviderError} If a provider or the chain cannot be reached.
   */
  async recover () {
    throw new NotImplementedError('recover()')
  }

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
  async createAccount (identity, options) {
    throw new NotImplementedError('createAccount(identity, options?)')
  }

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
  async exportIdentity (identity) {
    throw new NotImplementedError('exportIdentity(identity)')
  }

  /**
   * Imports an identity exported earlier, after checking it belongs to this seed.
   *
   * @abstract
   * @param {string} exported - The exported identity.
   * @returns {Promise<IdentitySummary>} The identity's summary.
   * @throws {DisposalError} If the identity manager has been disposed.
   * @throws {IdentityError} If the export cannot be read or does not belong to this seed.
   */
  async importIdentity (exported) {
    throw new NotImplementedError('importIdentity(exported)')
  }

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
  async prove (identity, request) {
    throw new NotImplementedError('prove(identity, request)')
  }

  /**
   * Disposes the identity manager, erasing its copy of the seed from memory. Subclasses that hold identities erase
   * them too, and call `super.dispose()`.
   */
  dispose () {
    if (this._disposed) return

    this._seed.fill(0)

    this._disposed = true
  }
}
