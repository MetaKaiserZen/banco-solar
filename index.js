const http = require("http");
const fs = require('fs');
const url = require('url');

const { insertar, consultar, editar, eliminar } = require('./consultas');

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
            //
        }

        // Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo

        if (request.url.startsWith('/transferencias') && request.method === 'GET')
        {
            //
        }
    })
    .listen(3000, console.log("Server ON"));
