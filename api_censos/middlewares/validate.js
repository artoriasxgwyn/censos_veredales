export const validate = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }
};
