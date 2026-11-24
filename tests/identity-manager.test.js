import * as bip39 from 'bip39'

import { describe, expect, test } from '@jest/globals'

import IdentityManager, { IdentityError, IdentityErrorReason } from '../src/identity/index.js'

import { DisposalError, NotImplementedError, ValueError } from '../index.js'

const SEED_PHRASE = 'cook voyage document eight skate token alien guide drink uncle term abuse'

const SEED = bip39.mnemonicToSeedSync(SEED_PHRASE)

class DummyIdentityManager extends IdentityManager { }

describe('IdentityManager', () => {
  describe('constructor', () => {
    test('should successfully initialize an identity manager for the given seed phrase', () => {
      const identityManager = new DummyIdentityManager(SEED_PHRASE)

      expect(identityManager.seed).toEqual(new Uint8Array(SEED))
    })

    test('should successfully initialize an identity manager for the given seed', () => {
      const identityManager = new DummyIdentityManager(SEED)

      expect(identityManager.seed).toEqual(new Uint8Array(SEED))
    })

    test('should keep its own copy of the seed', () => {
      const seed = new Uint8Array(SEED)

      const identityManager = new DummyIdentityManager(seed)

      expect(identityManager.seed).not.toBe(seed)
    })

    test('should store the configuration', () => {
      const identityManager = new DummyIdentityManager(SEED, { network: 'testnet' })

      expect(identityManager._config).toEqual({ network: 'testnet' })
    })

    test('should throw if the seed phrase is invalid', () => {
      expect(() => new DummyIdentityManager('invalid seed phrase'))
        .toThrow(new ValueError('Invalid seed phrase.'))
    })

    test('should throw if the seed is neither a seed phrase nor a Uint8Array', () => {
      expect(() => new DummyIdentityManager(42))
        .toThrow(new ValueError('The seed must be a seed phrase or a Uint8Array.'))
    })
  })

  describe('abstract methods', () => {
    const identityManager = new DummyIdentityManager(SEED)

    test.each([
      ['getProviders', [], 'getProviders()'],
      ['startVerification', [{ provider: '0', returnUrl: 'https://wallet.example/return' }], 'startVerification(options)'],
      ['completeVerification', [{}, 'https://wallet.example/return#reply'], 'completeVerification(identity, reply)'],
      ['recover', [], 'recover()'],
      ['createAccount', [{}], 'createAccount(identity, options?)'],
      ['exportIdentity', [{}], 'exportIdentity(identity)'],
      ['importIdentity', ['{}'], 'importIdentity(exported)'],
      ['prove', [{}, {}], 'prove(identity, request)']
    ])('%s should throw a not implemented error', async (method, args, signature) => {
      await expect(identityManager[method](...args))
        .rejects.toThrow(new NotImplementedError(signature))
    })
  })

  describe('dispose', () => {
    test('should erase its copy of the seed', () => {
      const identityManager = new DummyIdentityManager(SEED)

      const seed = identityManager.seed

      identityManager.dispose()

      expect(seed.every((byte) => byte === 0)).toBe(true)
    })

    test('should not erase the seed it was given', () => {
      const given = new Uint8Array(SEED)

      const identityManager = new DummyIdentityManager(given)

      identityManager.dispose()

      expect(given).toEqual(new Uint8Array(SEED))
    })

    test('should set disposed to true', () => {
      const identityManager = new DummyIdentityManager(SEED)

      expect(identityManager.disposed).toBe(false)

      identityManager.dispose()

      expect(identityManager.disposed).toBe(true)
    })

    test('should throw when reading the seed after disposal', () => {
      const identityManager = new DummyIdentityManager(SEED)

      identityManager.dispose()

      expect(() => identityManager.seed)
        .toThrow(new DisposalError('The identity manager has been disposed.'))
    })

    test('should do nothing when called twice', () => {
      const identityManager = new DummyIdentityManager(SEED)

      identityManager.dispose()

      expect(() => identityManager.dispose()).not.toThrow()
    })
  })
})

describe('IdentityError', () => {
  test('should offer every reason a chain-neutral identity operation can fail with', () => {
    expect(Object.keys(IdentityErrorReason)).toEqual([
      'PROVIDER_ERROR', 'VERIFICATION_REJECTED', 'IDENTITY_NOT_FOUND', 'IDENTITY_EXPIRED', 'ACCOUNT_LIMIT_REACHED',
      'INVALID_REQUEST', 'CANNOT_PROVE', 'CHAIN_ERROR'
    ])
  })

  test('should carry its name and reason', () => {
    const error = new IdentityError('The provider refused the identity.', { reason: IdentityErrorReason.VERIFICATION_REJECTED })

    expect(error.name).toBe('IdentityError')
    expect(error.reason).toBe('VERIFICATION_REJECTED')
    expect(error.message).toBe('The provider refused the identity.')
  })
})
