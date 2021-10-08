const http = require("http");
const fs = require('fs');
const url = require('url');

const { insertar, consultar, editar, eliminar } = require('./consultas');
const { transferir, movimiento } = require('./consultas');

http
    .createServer(async (request, response) =>
    {
        // Devuelve la aplicación cliente disponible en el apoyo de la prueba

        if (request.url == '/' && request.method === 'GET')
        {
            response.setHeader('content-type', 'text/html');
            response.end(fs.readFileSync('index.html', 'utf-8'));
        }

        // Recibe los datos de un nuevo usuario y los almacena en PostgreSQL

        if (request.url.startsWith('/usuario') && request.method === 'POST')
        {
            let body = '';

            request.on('data', (chunk) =>
            {
                body += chunk;
            });

            request.on('end', async () =>
            {
                const datos = Object.values(JSON.parse(body));

                const respuesta = await insertar(datos);

                response.statusCode = 201

                response.end(JSON.stringify(respuesta));
            });      
        }

        // Devuelve todos los usuarios registrados con sus balances

        if (request.url.startsWith('/usuarios') && request.method === 'GET')
        {
            const registros = await consultar();

            response.statusCode = 200;

            response.end(JSON.stringify(registros));
        }

        // Recibe los datos modificados de un usuario registrado y los actualiza

        if (request.url.startsWith('/usuario')  && request.method === 'PUT')
        {
            let body = '';

            request.on('data', (chunk) =>
            {
                body += chunk;
            });

            request.on('end', async () =>
            {
                const datos = Object.values(JSON.parse(body));

                const respuesta = await editar(datos);

                response.statusCode = 200;

                response.end(JSON.stringify(respuesta));
            });
        }

        // Recibe el id de un usuario registrado y lo elimina

        if (request.url.startsWith('/usuario') && request.method === 'DELETE')
        {
            const { id } = url.parse(request.url, true).query;

            const respuesta = await eliminar(id);

            response.statusCode = 200;

            response.end(JSON.stringify(respuesta));
        }

        // Recibe los datos para realizar una nueva transferencia. Se debe ocupar una transacción SQL en la consulta a la base de datos

        if (request.url.startsWith('/transferencia') && request.method === 'POST')
        {
            let body = '';

            request.on('data', (chunk) =>
            {
                body += chunk;
            });

            request.on('end', async () =>
            {
                const datos = Object.values(JSON.parse(body));

                const { Pool } = require("pg");

                const config =
                {
                    user: 'postgres',
                    host: 'localhost',
                    password: '12345',
                    port: 5432,
                    database: 'bancosolar',
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000,
                }

                const pool = new Pool(config);

                pool.connect(async (error_conexion, client, release) =>
                {
                    await client.query('BEGIN');

                    try
                    {
                        const descontar = "UPDATE usuarios SET balance = balance - " + datos[2] + " WHERE nombre = '" + datos[0] + "'";
                        const descuento =  await client.query(descontar);

                        const acreditar = "UPDATE usuarios SET balance = balance + " + datos[2] + " WHERE nombre = '" + datos[1] + "'";
                        const acreditacion = await client.query(acreditar);

                        const consulta = "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ((SELECT id FROM usuarios WHERE nombre ='" + datos[0] + "'), (SELECT id FROM usuarios WHERE nombre ='" + datos[1] + "'), " + datos[2] + ", NOW())";
                        const resultado = await client.query(consulta);

                        await client.query('COMMIT');
                    }
                    catch (e)
                    {
                        await client.query('ROLLBACK');

                        console.log('Error código: ' + e.code);
                        console.log('Detalle del error: ' + e.detail);
                        console.log('Tabla originaria del error: ' + e.table);
                        console.log('Restricción violada en el campo: ' + e.constraint);
                    }

                    release();
                    pool.end();
                });

                response.statusCode = 201

                response.end(JSON.stringify('OK'));
            });
        }

        // Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo

        if (request.url.startsWith('/transferencias') && request.method === 'GET')
        {
            const registros = await movimiento();

            response.statusCode = 200;

            response.end(JSON.stringify(registros));
        }
    })
    .listen(3000, console.log("Server ON"));
