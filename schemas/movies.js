const z = require('zod') // zod: se utiliza para validar datos. IMPORTANTE: instalar previamente la dependencia dentro de Clase 3: npm install zod -E

// Validaciones para la pelicula
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El titulo debe ser una cadena de texto',
    required_error: 'El titulo de la pelicula es necesario'
  }),
  year: z.number().int().positive().min(1900).max(2024),
  director: z.string({
    invalid_type_error: 'El titulo debe ser una cadena de texto',
    required_error: 'El titulo de la pelicula es necesario'
  }),
  duration: z.number().int().positive().min(5).max(500),
  rate: z.number().min(0).max(10),
  poster: z.string().url({
    message: 'El poster debe ser una url válida'
  }).endsWith('.jpg'), // endsWith podria validar que fuera otro tipo de dato o no usarse, es un ejemplo para que veas todo lo que permite zod
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      invalid_type_error: 'El género debe pertenecer a alguno de los listados en el array de géneros',
      required_error: 'El género de la pelicula es necesario'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object) // en vez de parse, usamos safeParse, que devuelve un objeto result que te va a decir si hay un error o si hay datos
}

function validatePartialMovie (object) { // validar solo una parte de los datos
  return movieSchema.partial().safeParse(object) // partial hace que cada una de las propiedades sean opcionales. Si alguna propiedad no está no pasa nada, pero si está la tiene que validar
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
