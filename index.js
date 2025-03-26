const express = require('express')
const app = express()
const port = 3000

const mysql = require('mysql2')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Definir la conexion de MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password1234!',
    database: 'dreaming_flowers'
})

db.connect((errorDB) => {
    if (errorDB) {
        console.log('Error al conectarse al MySQL: ')
        console.log(errorDB.stack)
        return
    }
    console.log('Conectado a MySQL')
})

// ================================
//        SECCIÓN DE FLORERÍAS
// ================================

// Ruta principal
app.get('/', (req, res) => {
    res.send('Bienvenidos al servidor')
})

// Ruta de contacto
app.get('/contacto', (req, res) => {
    res.send('Comuniquese a smalldickenergy@getalife.com')
})

/**
 * @swagger
 * tags:
 *      name: Florerias
 *      description: API del catálogo de florerías
 */

/**
 * @swagger
 * components:
 *      schemas:
 *          Floreria:
 *             type: object
 *             required:
 *                  - nombre
 *                  - ubicacion
 *                  - telefono
 *             properties:
 *                  id:
 *                      type: integer
 *                      description: ID autoincrementable de la florería
 *                  nombre:
 *                      type: string
 *                      description: Nombre de la florería
 *                  ubicacion:
 *                      type: string
 *                      description: Lugar de la florería
 *                  telefono:
 *                      type: string
 *                      description: Número de teléfono de la florería
 *             example:
 *                  nombre: "El girasol de Benja"
 *                  ubicacion: "Av 125"
 *                  telefono: "1222345"
 */

/**
 * @swagger
 * /florerias:
 *   get:
 *     summary: Listado de Florerías
 *     tags: [Florerias]
 *     responses:
 *       200:
 *         description: Muestra la lista de florerías
 */
app.get('/florerias', (req, res) => {
    db.query('SELECT * FROM florerias', (err, results) => {
        if (err) {
            console.log('Error al ejecutar la consulta')
        }
        res.json(results)
    })
})

/**
 * @swagger
 * /florerias/{id}:
 *   get:
 *     summary: Detalle de una Florería
 *     tags: [Florerias]
 *     parameters:
 *      - name: id
 *        in: path
 *        description: ID de la florería
 *        required: true
 *     responses:
 *       200:
 *         description: Muestra la florería especificada
 */
app.get('/florerias/:id', (req, res) => {
    const idfloreria = parseInt(req.params.id)
    db.query(
        'SELECT * FROM florerias WHERE idflorerias = ?',
        [idfloreria],
        (err, results) => {
            if (err) {
                res.status(400).send('Error al obtener florería')
                return
            }
            res.json(results)
        }
    )
})

/**
 * @swagger
 * /guardar:
 *   post:
 *     summary: Crear florería
 *     tags: [Florerias]
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Floreria'
 *     responses:
 *       201:
 *         description: Florería creada
 *       400:
 *         description: Datos incompletos
 */
app.post('/guardar', (req, res) => {
    const { nombre, ubicacion, telefono } = req.body
    if (!nombre || !ubicacion || !telefono) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }
    db.query(
        'INSERT INTO florerias(nombre, ubicacion, telefono) VALUES(?,?,?)',
        [nombre, ubicacion, telefono],
        (err, result) => {
            if (err) {
                res.status(400).send('Error al crear la florería')
                return
            }
            res.status(201).send('Florería creada')
        }
    )
})

/**
 * @swagger
 * /florerias/{id}:
 *   put:
 *     summary: Editar florería
 *     tags: [Florerias]
 *     parameters:
 *        - name: id
 *          in: path
 *          description: ID de la florería
 *          required: true
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Floreria'
 *     responses:
 *       200:
 *         description: Florería actualizada
 *       400:
 *         description: Error en la actualización
 */
app.put('/florerias/:id', (req, res) => {
    const { nombre, ubicacion, telefono } = req.body
    const idflorerias = parseInt(req.params.id)
    db.query(
        'UPDATE florerias SET nombre = ?, ubicacion = ?, telefono = ? WHERE idflorerias = ?',
        [nombre, ubicacion, telefono, idflorerias],
        (err, result) => {
            if (err) {
                res.status(400).send('Error al editar una florería' + err.stack)
                return
            }
            res.send('Florería actualizada')
        }
    )
})

/**
 * @swagger
 * /florerias/{id}:
 *   delete:
 *     summary: Eliminar florería
 *     tags: [Florerias]
 *     parameters:
 *      - name: id
 *        in: path
 *        description: ID de la florería
 *        required: true
 *     responses:
 *       200:
 *         description: Florería eliminada
 *       400:
 *         description: Error en la eliminación
 */
app.delete('/florerias/:id', (req, res) => {
    const idflorerias = parseInt(req.params.id)
    db.query('DELETE FROM florerias WHERE idflorerias = ?', [idflorerias], (err, result) => {
        if (err) {
            res.status(400).send('Error al eliminar una florería')
            return
        }
        res.send('Florería eliminada correctamente')
    })
})

// ================================
//          SECCIÓN DE PRODUCTOS
// ================================

/**
 * @swagger
 * tags:
 *      name: Productos
 *      description: API del catálogo de productos
 */

/**
 * @swagger
 * components:
 *      schemas:
 *          Producto:
 *             type: object
 *             required:
 *                  - nombre
 *                  - precio
 *                  - floreria
 *                  - categoria
 *             properties:
 *                  id:
 *                      type: integer
 *                      description: ID autoincrementable del producto
 *                  nombre:
 *                      type: string
 *                      description: Nombre del producto
 *                  precio:
 *                      type: number
 *                      description: Precio del producto
 *                  floreria:
 *                      type: interger
 *                      description: ID de la florería
 *                  categoria:
 *                      type: interger
 *                      description: Categoria del producto
 *             example:
 *                  nombre: "Ramo de rosas"
 *                  precio: 150.00
 *                  floreria: 3
 *                  categoria: 2
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Listado de productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Muestra la lista de productos
 */
app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) {
            console.log('Error al ejecutar la consulta')
        }
        res.json(results)
    })
})

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Detalle de un producto
 *     tags: [Productos]
 *     parameters:
 *      - name: id
 *        in: path
 *        description: ID del producto
 *        required: true
 *     responses:
 *       200:
 *         description: Muestra el producto especificado
 */
app.get('/productos/:id', (req, res) => {
    const idproducto = parseInt(req.params.id)
    db.query(
        'SELECT * FROM productos WHERE idproducto = ?',
        [idproducto],
        (err, results) => {
            if (err) {
                res.status(400).send('Error al obtener producto')
                return
            }
            res.json(results)
        }
    )
})

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear producto
 *     tags: [Productos]
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Producto'
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos incompletos
 */
app.post('/productos', (req, res) => {
    const { nombre, precio, floreria, categoria } = req.body

    // Validación de campos obligatorios
    if (!nombre || !precio || !floreria || !categoria) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    // Consulta SQL actualizada
    db.query(
        'INSERT INTO productos (nombre, precio, floreria, categoria) VALUES (?, ?, ?, ?)',
        [nombre, precio, floreria, categoria],
        (err, result) => {
            if (err) {
                console.error('Error al crear el producto:', err)
                return res.status(500).send('Error al crear el producto')
            }
            res.status(201).send('Producto creado correctamente')
        }
    )
})


/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Editar producto
 *     tags: [Productos]
 *     parameters:
 *        - name: id
 *          in: path
 *          description: ID del producto
 *          required: true
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Error en la actualización
 */
app.put('/productos/:id', (req, res) => {
    const { nombre, precio, floreria, categoria } = req.body
    const idproducto = parseInt(req.params.id)
    db.query(
        'UPDATE productos SET nombre = ?, precio = ?, floreria = ?, categoria = ? WHERE idproducto = ?',
        [nombre, precio, floreria, categoria, idproducto],
        (err, result) => {
            if (err) {
                res.status(400).send('Error al editar el producto' + err.stack)
                return
            }
            res.send('Producto actualizado')
        }
    )
})

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Productos]
 *     parameters:
 *      - name: id
 *        in: path
 *        description: ID del producto
 *        required: true
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       400:
 *         description: Error en la eliminación
 */
app.delete('/productos/:id', (req, res) => {
    const idproducto = parseInt(req.params.id)
    db.query('DELETE FROM productos WHERE idproducto = ?', [idproducto], (err, result) => {
        if (err) {
            res.status(400).send('Error al eliminar un producto')
            return
        }
        res.send('Producto eliminado correctamente')
    })
})

// CONFIGURAR SWAGGER PARA LA DOCUMENTACION DE LAS API
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.1.0',
        info: {
            title: 'API de Dreaming Flowers',
            version: '1.0.0',
            description: 'API de florerias'
        },
    },
    apis: ['*.js'],
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/apis-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Hacer disponible servidor
app.listen(port, () => {
    console.log("Servidor iniciado")
})