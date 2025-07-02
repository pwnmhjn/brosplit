export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "BroSplit API",
    version: "1.0.0",
    description: "Expense sharing and group insights backend API",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Development server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication routes" },
  ],
  paths: {
    "/api/v1/auth/users/sign-up": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Bad Request",
          },
        },
      },
    },
    "/api/v1/auth/users/sign-in": {
      post: {
        tags: ["Auth"],
        summary: "User Sign In",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignInRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
            headers: {
              "Set-Cookie": {
                description: "Refresh token cookie (httpOnly)",
                schema: {
                  type: "string",
                  example:
                    "refreshToken=abcd1234; HttpOnly; Secure; SameSite=Strict",
                },
              },
            },
          },
          "400": {
            description: "Invalid credentials or missing fields",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      SignUpRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            example: "john@example.com",
          },
          password: {
            type: "string",
            example: "password123",
          },
        },
      },
      SignInRequest: {
        anyOf: [
          {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: {
                type: "string",
                example: "john@example.com",
              },
              password: {
                type: "string",
                example: "password123",
              },
            },
          },
          {
            type: "object",
            required: ["username", "password"],
            properties: {
              username: {
                type: "string",
                example: "john_doe",
              },
              password: {
                type: "string",
                example: "password123",
              },
            },
          },
        ],
      },
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "64f83f7bfe27133a33b1b1aa",
          },
          email: {
            type: "string",
            example: "john@example.com",
          },
          username: {
            type: "string",
            example: "john_doe",
          },
          createdAt: {
            type: "string",
            example: "2024-07-01T10:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-07-01T10:00:00.000Z",
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          statusCode: {
            type: "integer",
            example: 200,
          },
          message: {
            type: "string",
            example: "User logged in",
          },
          data: {
            type: "object",
            properties: {
              user: {
                $ref: "#/components/schemas/User",
              },
              accessToken: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
            },
          },
        },
      },
    },
  },
};
