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

import { NotImplementedError } from './errors.js'

/** @typedef {import('../wallet-account-read-only.js').IWalletAccountReadOnly} IWalletAccountReadOnly */
/** @typedef {import('../wallet-account.js').IWalletAccount} IWalletAccount */

/** @typedef {import('../identity/identity-manager.js').IIdentityManager} IIdentityManager */
/** @typedef {import('../identity/identity-manager.js').ProofRequest} ProofRequest */
/** @typedef {import('../identity/identity-manager.js').Presentation} Presentation */

/** @typedef {import('./errors.js').AccountRequiredError} AccountRequiredError */
/** @typedef {import('./errors.js').DisposalError} DisposalError */
/** @typedef {import('./errors.js').IdentityError} IdentityError */

/**
 * One thing a website asks, in words a wallet can show on its consent screen.
 *
 * @typedef {Object} ProofRequestAsk
 * @property {'reveal' | 'prove'} kind - Whether the detail itself is shown ('reveal'), or only a fact about it is proved ('prove').
 * @property {string} attribute - The detail asked about (e.g., 'dateOfBirth').
 * @property {string} text - The ask in plain words (e.g., 'prove you are at least 18, without showing your date of birth').
 */

/**
 * A website's request, described for the user's consent.
 *
 * @typedef {Object} ProofRequestDescription
 * @property {string} [requester] - Who asks, as the request names it (compare it with the site the wallet is connected to).
 * @property {string} [purpose] - Why, as the request says.
 * @property {ProofRequestAsk[]} asks - What is asked.
 */

/** @interface */
export class IIdentityProtocol {
  /**
   * Describes a website's request for the user's consent, without answering it.
   *
   * @param {ProofRequest} request - The website's request.
   * @returns {Promise<ProofRequestDescription>} The request's description.
   * @throws {IdentityError} If the request is not valid.
   */
  async describeRequest (request) {
    throw new NotImplementedError('describeRequest(request)')
  }

  /**
   * Proves facts to a website from this account (the answer names the account).
   *
   * @param {ProofRequest} request - The website's request.
   * @returns {Promise<Presentation>} The answer, for the website to check.
   * @throws {AccountRequiredError} If the protocol requires a full account to prove.
   * @throws {DisposalError} If the account or the identity manager has been disposed.
   * @throws {IdentityError} If the request is not valid, or the account's identity cannot prove it.
   */
  async prove (request) {
    throw new NotImplementedError('prove(request)')
  }
}

/**
 * Abstract base class for identity protocols: proving facts to websites from an account.
 *
 * Unlike the other protocols, an identity protocol also needs the identity behind the account, which the chain's
 * identity manager holds: it receives that manager next to the account.
 *
 * @abstract
 * @implements {IIdentityProtocol}
 */
export default class IdentityProtocol {
  /**
   * Creates a new read-only identity protocol (it can describe requests, not prove).
   *
   * @overload
   * @param {IWalletAccountReadOnly} account - The wallet account to use to interact with the protocol.
   * @param {IIdentityManager} [identityManager] - The chain's identity manager, which holds the account's identity.
   */

  /**
   * Creates a new identity protocol.
   *
   * @overload
   * @param {IWalletAccount} account - The wallet account to use to interact with the protocol.
   * @param {IIdentityManager} [identityManager] - The chain's identity manager, which holds the account's identity.
   */
  constructor (account, identityManager) {
    /**
     * The wallet account to use to interact with the protocol.
     *
     * @protected
     * @type {IWalletAccountReadOnly | IWalletAccount}
     */
    this._account = account

    /**
     * The chain's identity manager, which holds the account's identity.
     *
     * @protected
     * @type {IIdentityManager | undefined}
     */
    this._identityManager = identityManager
  }

  /**
   * Describes a website's request for the user's consent, without answering it.
   *
   * @abstract
   * @param {ProofRequest} request - The website's request.
   * @returns {Promise<ProofRequestDescription>} The request's description.
   * @throws {IdentityError} If the request is not valid.
   */
  async describeRequest (request) {
    throw new NotImplementedError('describeRequest(request)')
  }

  /**
   * Proves facts to a website from this account (the answer names the account).
   *
   * @abstract
   * @param {ProofRequest} request - The website's request.
   * @returns {Promise<Presentation>} The answer, for the website to check.
   * @throws {AccountRequiredError} If the protocol requires a full account to prove.
   * @throws {DisposalError} If the account or the identity manager has been disposed.
   * @throws {IdentityError} If the request is not valid, or the account's identity cannot prove it.
   */
  async prove (request) {
    throw new NotImplementedError('prove(request)')
  }
}
