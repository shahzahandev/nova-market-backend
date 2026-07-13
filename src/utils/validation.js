let emptyFillValidation = (res, ...fields) => {
     if (fields.includes("") || fields.includes(undefined)) {
        return res.status(400).json({ 
            success: false,
            message: "All required fields must be provided." 
        })
    }
}

module.exports = {emptyFillValidation}