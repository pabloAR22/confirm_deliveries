const express = require('express');
const { serve, setup } = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const router = express.Router();
const path = require('path');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentación de la API confirm-deliveries con Swagger',
        },
        servers: [
            {
                url: 'https://us-central1-confirm-deliveries.cloudfunctions.net/confirm-deliveries-api/api/v1',
                description: 'Cloud fucntion de GCP'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                  type: 'http',
                  scheme: 'bearer',
                  bearerFormat: 'JWT'
                }
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'username del usuario',
                            example: 'pabloRada1'
                        },
                        password: {
                            type: 'string',
                            description: 'Contraseña del usuario',
                            example: 'contraseña123'
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        user: {
                            type: 'string',
                            description: 'username del usuario',
                            example: 'pabloRada1'
                        },
                        password: {
                            type: 'string',
                            description: 'Contraseña del usuario',
                            example: 'contraseña123'
                        }
                    }
                },
                GuidesRequest: {
                    type: 'object',
                    required: ['guia', 'ubicacion', 'ciudad_destino', 'departamento_destino', 'codigo_postal', 'telefono_contacto', 'valor_productos', 'costo_envio', 'id_proveedor', 'numero_cuenta'],
                    properties: {
                        guia: {
                            type: 'string',
                            description: 'guide number',
                            example: '123dsg'
                        },
                        ubicacion: {
                            type: 'string',
                            description: 'delivery address',
                            example: 'calle XX ...'
                        },
                        ciudad_destino : {
                            type: 'string',
                            description: 'Delivery city',
                            example: 'Medellín'
                        },
                        departamento_destino : {
                            type: 'string',
                            description: 'Delivery department',
                            example: 'Antioquía'
                        },
                        codigo_postal : {
                            type: 'string',
                            description: 'Postal Code',
                            example: '050001'
                        },
                        telefono_contacto : {
                            type: 'string',
                            description: 'User cell phone number',
                            example: '3504710922'
                        },
                        valor_productos : {
                            type: 'string',
                            description: 'Value package',
                            example: '200000'
                        },
                        costo_envio : {
                            type: 'string',
                            description: 'Delivery cost',
                            example: '80000'
                        },
                        id_proveedor : {
                            type: 'string',
                            description: 'Provider identification',
                            example: '1111'
                        },
                        numero_cuenta : {
                            type: 'string',
                            description: 'Account number',
                            example: '24500000'
                        },
                        observaciones : {
                            type: 'string',
                            description: 'Observations',
                            example: 'lorem ipsum dolor sit amet'
                        },
                        linea_contacto : {
                            type: 'string',
                            description: 'Line contact',
                            example: '32378965423'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Login successful'
                        },
                        token: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        success: {
                            type: 'boolean',
                            example: false
                        }
                    }
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'F0iNGjpf3ruzQlrQz6U7'
                        },
                        username: {
                            type: 'string',
                            example: 'PabloRada1'
                        },
                        password: {
                            type: 'string',
                            example: '$2a$10$REuYqXh/gHVWYpFOqMnK1.GXBZcmngYnTVMAtagdrV7NhMUitUSj6'
                        }
                    }
                },
                GuidesResponse: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'F0iNGjpf3ruzQlrQz6U7'
                        },
                        guia: {
                            type: 'string',
                            example: '123dsg'
                        },
                        ubicacion: {
                            type: 'string',
                            example: 'calle XX ...'
                        },
                        ciudad_destino : {
                            type: 'string',
                            example: 'Medellín'
                        },
                        departamento_destino : {
                            type: 'string',
                            example: 'Antioquía'
                        },
                        codigo_postal : {
                            type: 'string',
                            example: '050001'
                        },
                        telefono_contacto : {
                            type: 'string',
                            example: '3504710922'
                        },
                        valor_productos : {
                            type: 'string',
                            example: '200000'
                        },
                        costo_envio : {
                            type: 'string',
                            example: '80000'
                        },
                        id_proveedor : {
                            type: 'string',
                            example: '1111'
                        },
                        numero_cuenta : {
                            type: 'string',
                            example: '24500000'
                        },
                        observaciones : {
                            type: 'string',
                            example: 'lorem ipsum dolor sit amet'
                        },
                        linea_contacto : {
                            type: 'string',
                            example: '32378965423'
                        }
                    }
                }
            }
        }
    },
    apis: [path.join(__dirname, '*.js')]
};

const swaggerSpecs = swaggerJsDoc(swaggerOptions);
console.log(swaggerSpecs.paths);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints relacionados con autenticación
 *   - name: Users
 *     description: Endpoints relacionados con gestión de usuarios
 *   - name: Guides
 *     description: Endpoints relacionados con gestión de Guias
 * /

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created Correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created!"
 *                 user:
 *                   type: string
 *                   example: "PabloRada4"
 *       409:
 *         description: Cant create user: User already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Auth Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: Register succesful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       500:
 *         description: Auth Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login succesful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       500:
 *         description: Auth Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Gets the list of all registered users
 *     description: Returns an array with all the users registered on the platform
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list successfully obtained
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *               example: [
 *                 {
 *                   "id": "F0iNGjpf3ruzQlrQz6U7",
 *                   "username": "PabloRada1",
 *                   "password": "$2a$10$REuYqXh/gHVWYpFOqMnK1.GXBZcmngYnTVMAtagdrV7NhMUitUSj6"
 *                 },
 *                 {
 *                   "id": "MFGFGUQ1ipjFmNrNWtup",
 *                   "username": "PabloRada4",
 *                   "password": "$2a$10$3ybJ0zNIJr48JfLtEi/YjO9NqxLnrOV02pZkFAhUxfIkgdzlf.kEa"
 *                 }
 *               ]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /guides:
 *   get:
 *     tags:
 *       - Guides
 *     summary: Gets the list of all registered guides
 *     description: Returns an array with all the guides registered on the platform
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list successfully obtained
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GuidesResponse'
 *               example: [
 *                    {
 *                       "id": "4BPIivTMkexo4QOZRWis",
 *                       "guia": "12346",
 *                       "ubicacion": "Calle 109",
 *                       "ciudad_destino": "Medellín",
 *                       "departamento_destino": "Anioquia",
 *                       "codigo_postal": "050001",
 *                       "telefono_contacto": "3504710926",
 *                       "valor_productos": "20000",
 *                       "costo_envio": "8000",
 *                       "id_proveedor": "123",
 *                       "numero_cuenta": "24500002345"
 *                   }
 *               ]
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token inválido"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /guides:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Guides
 *     summary: Register a new(s) guide(s)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuidesRequest'
 *     responses:
 *       201:
 *         description: Register guide succesful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuidesResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Register Guide Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.use('/api-docs', serve, setup(swaggerSpecs));

module.exports = router;