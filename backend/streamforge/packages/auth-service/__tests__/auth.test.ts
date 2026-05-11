// ============================================================
//  Auth Service Tests
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { build } from '../test-helpers/build-app'
import { createTestUser, cleanDb } from '../test-helpers/db'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

beforeEach(async () => {
  app = await build()
  await cleanDb()
})

afterEach(async () => {
  await app.close()
})

// ─── Register ─────────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: {
        email:    'test@streamforge.app',
        username: 'testuser',
        password: 'SecurePass1',
      },
    })

    expect(res.statusCode).toBe(201)

    const body = res.json()
    expect(body.success).toBe(true)
    expect(body.data.user.email).toBe('test@streamforge.app')
    expect(body.data.user.plan).toBe('FREE')
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.user.passwordHash).toBeUndefined()
  })

  it('rejects duplicate email', async () => {
    await createTestUser({ email: 'dupe@test.com', username: 'user1' })

    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: {
        email:    'dupe@test.com',
        username: 'user2',
        password: 'SecurePass1',
      },
    })

    expect(res.statusCode).toBe(409)
    expect(res.json().error.code).toBe('AUTH_005')
  })

  it('rejects duplicate username', async () => {
    await createTestUser({ email: 'user1@test.com', username: 'takenname' })

    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: {
        email:    'user2@test.com',
        username: 'takenname',
        password: 'SecurePass1',
      },
    })

    expect(res.statusCode).toBe(409)
    expect(res.json().error.code).toBe('AUTH_006')
  })

  it('rejects weak password', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: {
        email:    'user@test.com',
        username: 'testuser',
        password: 'weak',
      },
    })

    expect(res.statusCode).toBe(400)
  })

  it('rejects invalid email format', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: {
        email:    'not-an-email',
        username: 'testuser',
        password: 'SecurePass1',
      },
    })

    expect(res.statusCode).toBe(400)
  })
})

// ─── Login ────────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: {
        email:    'login@test.com',
        username: 'loginuser',
        password: 'SecurePass1',
      },
    })
  })

  it('logs in with email', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/login',
      payload: { identifier: 'login@test.com', password: 'SecurePass1' },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.user.email).toBe('login@test.com')
  })

  it('logs in with username', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/login',
      payload: { identifier: 'loginuser', password: 'SecurePass1' },
    })

    expect(res.statusCode).toBe(200)
  })

  it('rejects wrong password', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/login',
      payload: { identifier: 'login@test.com', password: 'WrongPass1' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('AUTH_001')
  })

  it('rejects non-existent user', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/login',
      payload: { identifier: 'nobody@test.com', password: 'SecurePass1' },
    })

    expect(res.statusCode).toBe(401)
  })

  it('sets HttpOnly refresh token cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/login',
      payload: { identifier: 'login@test.com', password: 'SecurePass1' },
    })

    const cookies = res.cookies
    const rtCookie = cookies.find(c => c.name === '__sf_rt')
    expect(rtCookie).toBeDefined()
    expect(rtCookie?.httpOnly).toBe(true)
  })
})

// ─── Refresh Token ─────────────────────────────────────────────
describe('POST /api/v1/auth/refresh', () => {
  it('issues new access token from valid refresh token in body', async () => {
    // Register + login to get tokens
    const loginRes = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: { email: 'r@test.com', username: 'refresher', password: 'SecurePass1' },
    })

    const { accessToken } = loginRes.json().data
    const rtCookie = loginRes.cookies.find(c => c.name === '__sf_rt')

    const refreshRes = await app.inject({
      method:  'POST',
      url:     '/api/v1/auth/refresh',
      cookies: { __sf_rt: rtCookie!.value },
    })

    expect(refreshRes.statusCode).toBe(200)
    const body = refreshRes.json()
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.accessToken).not.toBe(accessToken) // New token issued
  })

  it('rejects missing refresh token', async () => {
    const res = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/refresh',
    })

    expect(res.statusCode).toBe(401)
  })
})

// ─── Protected Routes ──────────────────────────────────────────
describe('GET /api/v1/users/me', () => {
  it('returns user profile with valid token', async () => {
    const regRes = await app.inject({
      method: 'POST',
      url:    '/api/v1/auth/register',
      payload: { email: 'me@test.com', username: 'meuser', password: 'SecurePass1' },
    })

    const { accessToken } = regRes.json().data

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/users/me',
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data.email).toBe('me@test.com')
  })

  it('rejects request without token', async () => {
    const res = await app.inject({
      method: 'GET',
      url:    '/api/v1/users/me',
    })

    expect(res.statusCode).toBe(401)
  })

  it('rejects expired/invalid token', async () => {
    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/users/me',
      headers: { Authorization: 'Bearer invalid.jwt.token' },
    })

    expect(res.statusCode).toBe(401)
  })
})

// ─── Email Verification ────────────────────────────────────────
describe('POST /api/v1/auth/verify-email', () => {
  it('rejects invalid token', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/auth/verify-email',
      payload: { token: 'invalid-token-xyz' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('AUTH_004')
  })
})

// ─── Password Reset ────────────────────────────────────────────
describe('Password Reset Flow', () => {
  it('forgot-password always returns 200 (prevent enumeration)', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/auth/forgot-password',
      payload: { email: 'nonexistent@test.com' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().success).toBe(true)
  })

  it('reset-password rejects invalid token', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/auth/reset-password',
      payload: {
        token:           'invalid-token',
        password:        'NewSecure1',
        confirmPassword: 'NewSecure1',
      },
    })

    expect(res.statusCode).toBe(400)
  })

  it('reset-password rejects mismatched passwords', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/auth/reset-password',
      payload: {
        token:           'some-token',
        password:        'NewSecure1',
        confirmPassword: 'DifferentPass1',
      },
    })

    expect(res.statusCode).toBe(400)
  })
})

// ─── Plans ────────────────────────────────────────────────────
describe('GET /api/v1/subscriptions/plans', () => {
  it('returns all plan tiers', async () => {
    const res = await app.inject({
      method: 'GET',
      url:    '/api/v1/subscriptions/plans',
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    const plans = body.data.plans
    expect(plans).toHaveLength(4)
    expect(plans.map((p: any) => p.id)).toEqual(['FREE', 'PRO', 'CREATOR', 'ENTERPRISE'])
  })
})
