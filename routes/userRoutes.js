const express = require('express')
const userController = require("../controllers/userController")
const authController = require("../controllers/authController")

const router = express.Router();

router
 .route('/signup')
 .post(authController.signup);

router
 .route('/login')
 .post(authController.login);


router
 .route('/forgotPassword')
 .post(authController.forgotPassword);

router
 .route('/resetPassword/:token')
 .patch(authController.resetPassword);

router.use(authController.protect)

router
 .route('/updateMyPassword')
 .patch(authController.updatePassword);

router
 .route('/deleteMe')
 .patch(authController.deleteMe);

router.get('/me',userController.getMe,userController.getUserById)
router.patch('/updateMe',userController.getMe,userController.uploadUserPhoto,userController.updateUser)

router.use(authController.restrictTo('admin','lead-guide'));
router
 .route('/')
 .get(userController.getAllUsers)
 .post(userController.createUser);

router
 .route('/:id')
 .get(userController.getUserById)
 .patch(userController.updateUser)
 .delete(userController.deleteUser);

module.exports = router;