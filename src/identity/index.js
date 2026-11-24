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

/** @typedef {import('./identity-manager.js').IdentityConfig} IdentityConfig */
/** @typedef {import('./identity-manager.js').IdentityProvider} IdentityProvider */
/** @typedef {import('./identity-manager.js').IdentityReference} IdentityReference */
/** @typedef {import('./identity-manager.js').IdentityAccount} IdentityAccount */
/** @typedef {import('./identity-manager.js').IdentitySummary} IdentitySummary */
/** @typedef {import('./identity-manager.js').StartVerificationOptions} StartVerificationOptions */
/** @typedef {import('./identity-manager.js').VerificationStart} VerificationStart */
/** @typedef {import('./identity-manager.js').CreateAccountOptions} CreateAccountOptions */
/** @typedef {import('./identity-manager.js').ProofRequest} ProofRequest */
/** @typedef {import('./identity-manager.js').Presentation} Presentation */

/** @typedef {import('../protocols/errors.js').IdentityErrorOptions} IdentityErrorOptions */

export { default, IIdentityManager } from './identity-manager.js'

export { IdentityError, IdentityErrorReason } from '../protocols/errors.js'
