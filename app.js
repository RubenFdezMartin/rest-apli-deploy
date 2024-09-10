const express = require('express') // require porque estamos usando commonJS
const crypto = require('node:crypto') // biblioteca nativa para crear ids unicas
const movies = require('./movies.json') // cargar el archivo JSON como un objeto JavaScript.

const { validateMovie, validatePartialMovie } = require('./schemas/movies.js') // importo la funcion validateMovie para usar en el metodo post

const app = express()

app.use(express.json()) // para poder acceder al request.body para enviar la info en el post
app.disable('x-powered-by') // deshabilitar el header X-Powered-By

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:50507',
  'http://localhost:49505',
  'http://localhost:1234'
]

app.get('/', (req, res) => {
  res.json({ message: 'Hola Mundo' })
})

// Todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    // todos los origenes que no sean nuestro propio origen pero esten permitidos (para que puedas acceder desde localhost:8000 , 1234, etc...
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { genre } = req.query
  const { id } = req.query

  if (genre) {
    /*
    *
    * La opción 'include' solo te encontraría si se llaman exactamente igual (mayusc y minusc) */
    // const movieToGenre = movies.filter(movie => movie.genre.includes(genre))

    /* La opción 'some' es más correcta para encontrar independientemente de si son mayusc o minusc */
    const movieToGenre = movies.filter(movie => movie.genre.some(
      g => g.toLowerCase() === genre.toLowerCase())
    )

    // Devuelvo la respuesta
    return res.json(movieToGenre)
  }

  if (id) {
    const movieToId = movies.find(movie => movie.id === id)
    return res.json(movieToId)
  }

  res.json(movies)
})

// Mostrar una pelicula por id y titulo
app.get('/movies/:id/:title', (req, res) => { // tb se podria usar path-to-regexp (expr.regulares)
  const { id, title } = req.params
  const movie = movies.find(movie => movie.id === id && movie.title === title)
  if (movie) {
    return res.json(movie)
  } else {
    res.status(404).json({ message: 'Movie not found' })
  }
})

// Añadir una pelicula
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), // se crea un id unico universal
    ...result.data
  }

  // Esto no sería REST porque estamos guardando
  // el estado de la aplicación en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

// Eliminar una pelicula
app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    // todos los origenes que no sean nuestro propio origen pero esten permitidos (para que puedas acceder desde localhost:8000 , 1234, etc...
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1) // elimino la pelicula

  return res.json({ message: ' Movie deleted' })
})

// Utilizar el metodo validatePartialMovie para actualizar una pelicula
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body) // buscamos el resultado (en este ejemplo, la pelicula)

  if (!result.success) { // si no la encontramos, error 404
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params // recuperamos el id
  const movieIndex = movies.findIndex(movie => movie.id === id) // comparamos el id

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie // actualizamos la pelicula

  return res.json(updateMovie) // devolvemos el json de la pelicula actualizada
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    // todos los origenes que no sean nuestro propio origen pero esten permitidos (para que puedas acceder desde localhost:8000 , 1234, etc...
    res.header('Access-Control-Allow-Origin', origin)
    // IMPORTANTE: Debo crear tb una cabecera que le indique los metodos que puede utilizar
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})

const PORT = process.env.PORT ?? 1234 // Importante: tenerlo siempre con la opcion process.env.PORT o dará problemas con el puerto. De esta forma, se asigna el puerto que nos de el servidor
// Las plataformas proporcionen un puerto a través de esta variable para que tu aplicación escuche en el puerto adecuado.

app.listen(PORT, () => {
  console.log(`Server escuchando en el puerto http://localhost:${PORT}`)
})
