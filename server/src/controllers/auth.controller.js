const authService = require('../services/auth.service');
const { successResponse, createdResponse } = require('../utils/response');
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/jwt');

const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      setRefreshTokenCookie(res, result.refreshToken);

      createdResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'Registration successful');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      };

      const result = await authService.login(req.body, meta);

      setRefreshTokenCookie(res, result.refreshToken);

      successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      // Get refresh token from cookie or body
      const token = req.cookies?.refreshToken || req.body?.refreshToken;

      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      };

      const result = await authService.refreshToken(token, meta);

      setRefreshTokenCookie(res, result.refreshToken);

      successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(refreshToken, req.user?.id);

      clearRefreshTokenCookie(res);

      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout-all
   */
  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.id);

      clearRefreshTokenCookie(res);

      successResponse(res, null, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      successResponse(res, { user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      successResponse(res, { user }, 'Profile updated');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);

      clearRefreshTokenCookie(res);

      successResponse(res, null, 'Password changed. Please login again.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
