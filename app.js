const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();

// Para usar CSS, imágenes, etc. desde la carpeta public
app.use(express.static('public'));

// Para recibir datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));

// Para usar archivos .ejs en la carpeta views
app.set('view engine', 'ejs');

// ===============================
// CONEXIÓN CON MYSQL
// ===============================
// Funciona localmente y también en internet con Railway u otro hosting

const conexion = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'hispano',
    port: process.env.DB_PORT || 3306
});

// Verificar conexión
conexion.connect((error) => {
    if (error) {
        console.log('Error al conectar con MySQL');
        console.log(error);
    } else {
        console.log('Conectado a la base de datos');
    }
});

// ===============================
// LOGIN
// ===============================

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', (req, res) => {
    const usuario = req.body.usuario.trim();
    const contraseña = req.body.contraseña.trim();

    const sql = 'SELECT * FROM usuarios WHERE usuario = ? AND `contraseña` = ?';

    conexion.query(sql, [usuario, contraseña], (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error en la consulta del login');
        } else {
            if (resultados.length > 0) {
                res.render('inicio', { usuario: usuario });
            } else {
                res.send('Usuario o contraseña incorrectos');
            }
        }
    });
});

app.get('/inicio', (req, res) => {
    res.render('inicio', { usuario: 'edi' });
});

// ===============================
// REGISTRO DE USUARIO
// ===============================

app.get('/registro-usuario', (req, res) => {
    res.render('registro_usuario');
});

app.post('/registro-usuario/guardar', (req, res) => {
    const usuario = req.body.usuario.trim();
    const contraseña = req.body.contraseña.trim();

    const sql = 'INSERT INTO usuarios (usuario, `contraseña`) VALUES (?, ?)';

    conexion.query(sql, [usuario, contraseña], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al registrar usuario');
        } else {
            res.redirect('/');
        }
    });
});

// ===============================
// RUTAS DEL PANEL
// ===============================

app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios';

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al mostrar usuarios');
        } else {
            res.render('usuarios', { usuarios: resultados });
        }
    });
});

app.get('/equipos', (req, res) => {
    const sql = 'SELECT * FROM equipos';

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al mostrar equipos');
        } else {
            res.render('equipos', { equipos: resultados });
        }
    });
});

app.get('/registro-ingreso', (req, res) => {
    const sql = 'SELECT * FROM rgingreso';

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al mostrar registro de ingreso');
        } else {
            res.render('registro_ingreso', { ingresos: resultados });
        }
    });
});

// ===============================
// LABORATORIOS
// ===============================

app.get('/laboratorios', (req, res) => {
    const sql = 'SELECT * FROM laboratorios';

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al mostrar laboratorios');
        } else {
            res.render('laboratorios', { laboratorios: resultados });
        }
    });
});

app.post('/laboratorios/guardar', (req, res) => {
    const nombrelab = req.body.nombrelab;
    const encargado = req.body.encargado;
    const numerodelab = req.body.numerodelab;
    const numerodecom = req.body.numerodecom;

    const sql = 'INSERT INTO laboratorios (nombrelab, encargado, numerodelab, numerodecom) VALUES (?, ?, ?, ?)';

    conexion.query(sql, [nombrelab, encargado, numerodelab, numerodecom], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al guardar laboratorio');
        } else {
            res.redirect('/laboratorios');
        }
    });
});

app.get('/laboratorios/eliminar/:numerodelab', (req, res) => {
    const numerodelab = req.params.numerodelab;

    const sql = 'DELETE FROM laboratorios WHERE numerodelab = ?';

    conexion.query(sql, [numerodelab], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al eliminar laboratorio');
        } else {
            res.redirect('/laboratorios');
        }
    });
});

// ===============================
// CRUD TABLA REGISTRO
// ===============================

app.get('/registro', (req, res) => {
    const sql = 'SELECT * FROM registro';

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al mostrar registros');
        } else {
            res.render('registro', { registros: resultados });
        }
    });
});

app.post('/registro/guardar', (req, res) => {
    const codigo = req.body.codigo;
    const marca = req.body.marca;
    const laboratorio = req.body.laboratorio;
    const estado = req.body.estado;
    const fecha = req.body.fecha;

    const sql = 'INSERT INTO registro (codigo, marca, laboratorio, estado, fecha) VALUES (?, ?, ?, ?, ?)';

    conexion.query(sql, [codigo, marca, laboratorio, estado, fecha], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al guardar registro');
        } else {
            res.redirect('/registro');
        }
    });
});

app.get('/registro/editar/:codigo', (req, res) => {
    const codigo = req.params.codigo;

    const sql = 'SELECT * FROM registro WHERE codigo = ?';

    conexion.query(sql, [codigo], (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al buscar registro');
        } else {
            res.render('editar_registro', { registro: resultados[0] });
        }
    });
});

app.post('/registro/actualizar/:codigo', (req, res) => {
    const codigoOriginal = req.params.codigo;

    const codigo = req.body.codigo;
    const marca = req.body.marca;
    const laboratorio = req.body.laboratorio;
    const estado = req.body.estado;
    const fecha = req.body.fecha;

    const sql = 'UPDATE registro SET codigo = ?, marca = ?, laboratorio = ?, estado = ?, fecha = ? WHERE codigo = ?';

    conexion.query(sql, [codigo, marca, laboratorio, estado, fecha, codigoOriginal], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al actualizar registro');
        } else {
            res.redirect('/registro');
        }
    });
});

app.get('/registro/eliminar/:codigo', (req, res) => {
    const codigo = req.params.codigo;

    const sql = 'DELETE FROM registro WHERE codigo = ?';

    conexion.query(sql, [codigo], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al eliminar registro');
        } else {
            res.redirect('/registro');
        }
    });
});

// ===============================
// MANTENIMIENTO
// ===============================

app.get('/mantenimiento', (req, res) => {
    const sql = 'SELECT * FROM mantenimiento';

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al mostrar mantenimiento');
        } else {
            res.render('mantenimiento', { mantenimiento: resultados });
        }
    });
});

app.get('/mantenimiento/verificar/:codigo', (req, res) => {
    const codigo = req.params.codigo;

    const sql = 'SELECT * FROM registro WHERE codigo = ?';

    conexion.query(sql, [codigo], (error, resultados) => {
        if (error) {
            console.log(error);
            res.json({ existe: false });
        } else {
            res.json({ existe: resultados.length > 0 });
        }
    });
});

app.post('/mantenimiento/guardar', (req, res) => {
    const codigo = req.body.codigo;
    const fecha = req.body.fecha;
    const encargado = req.body.encargado;
    const descripcion = req.body.descripcion;

    const verificar = 'SELECT * FROM registro WHERE codigo = ?';

    conexion.query(verificar, [codigo], (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al verificar equipo');
        } else {
            if (resultados.length > 0) {
                const sql = 'INSERT INTO mantenimiento (codigo, fecha, encargado, descripcion) VALUES (?, ?, ?, ?)';

                conexion.query(sql, [codigo, fecha, encargado, descripcion], (error) => {
                    if (error) {
                        console.log(error);
                        res.send('Error al guardar mantenimiento');
                    } else {
                        res.redirect('/mantenimiento');
                    }
                });
            } else {
                res.send('El equipo no está registrado. No se puede guardar el mantenimiento.');
            }
        }
    });
});

app.get('/mantenimiento/eliminar/:codigo', (req, res) => {
    const codigo = req.params.codigo;

    const sql = 'DELETE FROM mantenimiento WHERE codigo = ?';

    conexion.query(sql, [codigo], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al eliminar mantenimiento');
        } else {
            res.redirect('/mantenimiento');
        }
    });
});

// ===============================
// MOVIMIENTO
// ===============================

app.get('/movimiento', (req, res) => {
    const sql = 'SELECT * FROM movimiento';

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al mostrar movimientos');
        } else {
            res.render('movimiento', { movimiento: resultados });
        }
    });
});

app.get('/movimiento/verificar/:codigo', (req, res) => {
    const codigo = req.params.codigo;

    const sql = 'SELECT * FROM registro WHERE codigo = ?';

    conexion.query(sql, [codigo], (error, resultados) => {
        if (error) {
            console.log(error);
            res.json({ existe: false });
        } else {
            res.json({ existe: resultados.length > 0 });
        }
    });
});

app.post('/movimiento/guardar', (req, res) => {
    const codigo = req.body.codigo;
    const responsable = req.body.responsable;
    const fecha = req.body.fecha;
    const estado = req.body.estado;
    const tipomv = req.body.tipomv;

    const verificar = 'SELECT * FROM registro WHERE codigo = ?';

    conexion.query(verificar, [codigo], (error, resultados) => {
        if (error) {
            console.log(error);
            res.send('Error al verificar equipo');
        } else {
            if (resultados.length > 0) {
                const sql = 'INSERT INTO movimiento (responsable, fecha, estado, tipomv, codigo) VALUES (?, ?, ?, ?, ?)';

                conexion.query(sql, [responsable, fecha, estado, tipomv, codigo], (error) => {
                    if (error) {
                        console.log(error);
                        res.send('Error al guardar movimiento');
                    } else {
                        res.redirect('/movimiento');
                    }
                });
            } else {
                res.send('El equipo no está registrado. No se puede guardar el movimiento.');
            }
        }
    });
});

app.get('/movimiento/eliminar/:codigo', (req, res) => {
    const codigo = req.params.codigo;

    const sql = 'DELETE FROM movimiento WHERE codigo = ?';

    conexion.query(sql, [codigo], (error) => {
        if (error) {
            console.log(error);
            res.send('Error al eliminar movimiento');
        } else {
            res.redirect('/movimiento');
        }
    });
});

// ===============================
// INICIAR SERVIDOR
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Servidor iniciado en el puerto ' + PORT);
});