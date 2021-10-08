# BANCO SOLAR

# Autor

* **Eduardo Montenegro Sepúlveda**

# GitHub

* **https://github.com/MetaKaiserZen/banco-solar**

# Versiones

* **V1.0**

* *Se agrega la ruta '/usuarios'*

* **V1.0**

* *Se agrega la ruta '/transferencias'*

# Datos Adicionales

* *Se agregó la función getTransferencias en la constante eliminarUsuario para actualizar transferencias actuales*

* *Se modifició la función getTransferencias del archivo index.html para recorrer correctamente los datos enviados por el JSON utilizando para ello la Notación Literal*

* *La transacción que realiza una transferencia necesita ser corregida para poder ser llamada como función directamente desde el archivo consultas.js. A pesar de que funciona correctamente se considera que no se utilizaron las mejores prácticas para ello, puesto que se vuelve a llamar a la conexión mediante Pool pero la transacción en sí funciona sin errores y con su restricción correspondiente*
