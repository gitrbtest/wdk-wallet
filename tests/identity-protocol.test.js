import { describe, expect, test } from '@jest/globals'

import { IdentityProtocol } from '../src/protocols/index.js'

import { NotImplementedError } from '../index.js'

class DummyIdentityProtocol extends IdentityProtocol { }

describe('IdentityProtocol', () => {
  describe('constructor', () => {
    test('should keep the account and the identity manager', () => {
      const account = { path: "m/0'/0/1" }

      const identityManager = { prove: async () => ({}) }

      const protocol = new DummyIdentityProtocol(account, identityManager)

      expect(protocol._account).toBe(account)
      expect(protocol._identityManager).toBe(identityManager)
    })

    test('should accept a missing identity manager (a read-only protocol)', () => {
      const protocol = new DummyIdentityProtocol({})

      expect(protocol._identityManager).toBeUndefined()
    })
  })

  describe('abstract methods', () => {
    const protocol = new DummyIdentityProtocol({}, {})

    test('describeRequest should throw a not implemented error', async () => {
      await expect(protocol.describeRequest({}))
        .rejects.toThrow(new NotImplementedError('describeRequest(request)'))
    })

    test('prove should throw a not implemented error', async () => {
      await expect(protocol.prove({}))
        .rejects.toThrow(new NotImplementedError('prove(request)'))
    })
  })
})
