const { Router } = require("express");
const registerUser = require('../controllers/user.controller.js');
const upload = require('../middleware/multer.middleware.js');
const loginUser = require('../controllers/user.controller.js');
const logoutUser = require('../controllers/user.controller.js');
const verifyJWT = require('../middleware/auth.middleware.js');

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

// secured routes
router.route('/logout').post(verifyJWT, logoutUser)

module.exports = router
