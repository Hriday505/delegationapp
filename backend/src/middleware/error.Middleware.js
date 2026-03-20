//** give error  */
const errorMiddleware = (err,req, res, next) => {
  
    console.log(err.stack)

    const statusCode = res.statusCode ? res.statusCode : 500
    res.status(statusCode)
    res.json({

        message: err.message,
        stack: err.stack,
    })

};

module.exports = errorMiddleware;
