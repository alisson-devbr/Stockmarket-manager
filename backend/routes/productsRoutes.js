const router = require("express").Router();
const controller = require("../controllers/productsController");

router.get("/", controller.list);
router.get("/dashboard", controller.dashboard);
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/:id/movements", controller.move);

module.exports = router;
