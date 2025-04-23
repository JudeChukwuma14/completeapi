

const send = (req, res) => {
    res.status(200).json({ message: "Hello World!", success: true });
}

module.exports = send;