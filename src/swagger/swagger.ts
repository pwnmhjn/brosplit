export const swaggerSpec = {
  openapi: '3.0.4',
  info: {
    title: 'BroSplit API',
    version: '1.0.0',
    description: `BroSplit is an expense sharing and group insights backend API.
This documentation follows the OpenAPI 3.0 standard.`,
    termsOfService: 'https://brosplit.com/terms/',
    contact: {
      email: 'support@brosplit.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'User authentication and session management' },
    { name: 'Profile', description: 'User profile operations' },
    // Add other tags like Groups, Expenses, etc.
  ],
  paths: {
    '/api/v1/auth/users/sign-up': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new user account with email and password.',
        operationId: 'signUpUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignUpRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid input or user already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users/sign-in': {
      post: {
        tags: ['Auth'],
        summary: 'User Sign In',
        description: 'Authenticate user and return access and refresh tokens.',
        operationId: 'signInUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignInRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User logged in successfully',
            headers: {
              'Set-Cookie': {
                description: 'Refresh token cookie (httpOnly)',
                schema: {
                  type: 'string',
                  example:
                    'refreshToken=abcd1234; HttpOnly; Secure; SameSite=Strict',
                },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid credentials or missing fields',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/users/sign-out': {
      post: {
        tags: ['Auth'],
        summary: 'User Sign Out',
        description:
          'Log out user by invalidating refresh token and clearing cookie.',
        operationId: 'signOutUser',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User logged out successfully',
            headers: {
              'Set-Cookie': {
                description: 'Refresh token cookie cleared (httpOnly)',
                schema: {
                  type: 'string',
                  example:
                    'refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
                },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized (if token is missing or invalid)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/v1/profile': {
      post: {
        tags: ['Profile'],
        summary: 'Create user profile',
        description:
          'Create a user profile with additional details and avatar.',
        operationId: 'createProfile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfileRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Profile created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProfileResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid input or profile already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Profile'],
        summary: 'Update user profile',
        description: "Update any field(s) of the user's profile.",
        operationId: 'updateProfile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfileRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProfileResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Profile'],
        summary: "Get current user's profile",
        description: "Retrieve the authenticated user's profile.",
        operationId: 'getProfile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile fetched successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProfileResponse' },
              },
            },
          },
          '404': {
            description: 'Profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Profile'],
        summary: 'Delete user profile',
        description:
          "Delete the user's profile and cascade delete the user account.",
        operationId: 'deleteProfile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '404': {
            description: 'Profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      SignUpRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      SignInRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'User logged in' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64f83f7bfe27133a33b1b1aa' },
          email: { type: 'string', example: 'john@example.com' },
          username: { type: 'string', example: 'john_doe' },
          createdAt: { type: 'string', example: '2024-07-01T10:00:00.000Z' },
          updatedAt: { type: 'string', example: '2024-07-01T10:00:00.000Z' },
        },
      },
      ProfileRequest: {
        type: 'object',
        properties: {
          firstname: { type: 'string', example: 'John' },
          lastname: { type: 'string', example: 'Doe' },
          contact: { type: 'string', example: '+91-9876543210' },
          bio: { type: 'string', example: 'Fitness enthusiast' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          currency: {
            type: 'string',
            enum: ['inr', 'usd', 'eur', 'rub', 'cny', 'gbp'],
          },
          location: { type: 'string', example: 'New Delhi, India' },
          avatar: {
            type: 'string',
            example:
              'https://cdn.vectorstock.com/i/2000v/51/99/user-avatar-icon-flat-style-vector-3125199.avif',
          },
        },
      },
      ProfileResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Profile created successfully' },
          data: {
            type: 'object',
            properties: {
              profile: { $ref: '#/components/schemas/ProfileRequest' },
            },
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation successful' },
        },
      },
      Error: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Invalid request' },
        },
      },
    },
  },
};
