const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors');
const logger = require('../config/logger');

const SALT_ROUNDS = 12;

const authService = {
  /**
   * Register a new user with email and password.
   */
  async register({ email, password, firstName, lastName, phone, role }) {
    // Check if user already exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role,
    });

    logger.info('User registered', { userId: user.id, email: user.email, role: user.role });

    // Generate tokens
    const tokens = await this._generateTokenPair(user);

    return { user, ...tokens };
  },

  /**
   * Login with email and password.
   */
  async login({ email, password }, meta = {}) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    logger.info('User logged in', { userId: user.id, email: user.email });

    const tokens = await this._generateTokenPair(user, meta);

    // Return user without sensitive fields
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  },

  /**
   * Refresh the access token using a valid refresh token.
   * Implements token rotation — old token is revoked, new pair issued.
   */
  async refreshToken(token, meta = {}) {
    if (!token) {
      throw new AuthenticationError('Refresh token required');
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Check if token exists in DB and is not revoked
    const storedToken = await refreshTokenRepository.findByToken(token);
    if (!storedToken) {
      throw new AuthenticationError('Refresh token not found');
    }

    if (storedToken.isRevoked) {
      // Potential token reuse — revoke all tokens for this user
      await refreshTokenRepository.revokeAllByUser(storedToken.userId);
      logger.warn('Refresh token reuse detected', { userId: storedToken.userId });
      throw new AuthenticationError('Token reuse detected. All sessions revoked.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AuthenticationError('Refresh token expired');
    }

    // Revoke current token (rotation)
    await refreshTokenRepository.revokeByToken(token);

    // Issue new token pair
    const user = storedToken.user;
    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    const tokens = await this._generateTokenPair(user, meta);
    const { passwordHash, ...safeUser } = user;

    return { user: safeUser, ...tokens };
  },

  /**
   * Logout — revoke the refresh token.
   */
  async logout(refreshToken, userId) {
    if (refreshToken) {
      try {
        await refreshTokenRepository.revokeByToken(refreshToken);
      } catch {
        // Token might not exist — that's fine
      }
    }
    logger.info('User logged out', { userId });
  },

  /**
   * Logout from all devices — revoke all refresh tokens.
   */
  async logoutAll(userId) {
    await refreshTokenRepository.revokeAllByUser(userId);
    logger.info('User logged out from all devices', { userId });
  },

  /**
   * Get current user profile.
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId, true);
    if (!user) {
      throw new NotFoundError('User');
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Update user profile.
   */
  async updateProfile(userId, data) {
    return userRepository.update(userId, data);
  },

  /**
   * Change password.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(userId, { passwordHash });

    // Revoke all refresh tokens to force re-login
    await refreshTokenRepository.revokeAllByUser(userId);

    logger.info('Password changed', { userId });
  },

  // ── Private helpers ──

  async _generateTokenPair(user, meta = {}) {
    const payload = { userId: user.id, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in DB
    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return { accessToken, refreshToken };
  },
};

module.exports = authService;
