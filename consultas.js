const { Pool } = require('pg');

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

const insertar = async (datos) =>
{
    const consulta =
    {
        text: 'INSERT INTO usuarios (nombre, balance) values ($1, $2)',
        values: datos,
    };

    try
    {
        const resultado = await pool.query(consulta);

        return resultado;
    }
    catch (error)
    {
        return error;
    }
};

const consultar = async () =>
{
    const consulta =
    {
        text: 'SELECT id, nombre, balance FROM usuarios',
    }

    try
    {
        const resultado = await pool.query(consulta);

        return resultado.rows;
    }
    catch (error)
    {
        console.log(error.code);

        return error;
    }
};

const editar = async (datos) =>
{
    const consulta =
    {
        text: 'UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *;',
        values: datos,
    };

    try
    {
        const resultado = await pool.query(consulta);

        return resultado;
    }
    catch (error)
    {
        console.log("Codigo de error", error.code);

        return error;
    }
};

const eliminar = async (id) =>
{
    const consulta =
    {
        text: `DELETE FROM usuarios WHERE id = ${id}`,
    };

    try
    {
        const resultado = await pool.query(consulta);

        return resultado;
    }
    catch (error)
    {
        console.log("Codigo de error", error.code);

        return error;
    }
};

module.exports = { insertar, consultar, editar, eliminar };
