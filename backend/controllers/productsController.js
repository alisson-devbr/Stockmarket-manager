const db = require("../config/database");

exports.list = async (req, res, next) => {
  try {
    const term = `%${req.query.search || ""}%`;
    const [rows] = await db.execute(
      "SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? OR category LIKE ? ORDER BY name",
      [term, term, term]
    );
    res.json(rows);
  } catch (error) { next(error); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.execute("SELECT * FROM products WHERE id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Produto não encontrado." });
    res.json(rows[0]);
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, sku, category, cost_price, sale_price, quantity, min_quantity } = req.body;
    const nums = [cost_price, sale_price, quantity, min_quantity].map(Number);
    if (!name?.trim() || !sku?.trim() || !category?.trim() ||
        nums.some(n => !Number.isFinite(n) || n < 0) ||
        !Number.isInteger(nums[2]) || !Number.isInteger(nums[3])) {
      return res.status(400).json({ message: "Preencha os campos corretamente. Quantidades devem ser inteiras e não negativas." });
    }
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        "INSERT INTO products (name,sku,category,cost_price,sale_price,quantity,min_quantity) VALUES (?,?,?,?,?,?,?)",
        [name.trim(), sku.trim(), category.trim(), ...nums]
      );
      if (nums[2] > 0) {
        await connection.execute(
          "INSERT INTO stock_movements (product_id,movement_type,quantity,note) VALUES (?,'entrada',?,'Estoque inicial')",
          [result.insertId, nums[2]]
        );
      }
      await connection.commit();
      res.status(201).json({ id: result.insertId, message: "Produto cadastrado." });
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "SKU já cadastrado." });
      throw error;
    } finally { connection.release(); }
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, sku, category, cost_price, sale_price, min_quantity } = req.body;
    const nums = [cost_price, sale_price, min_quantity].map(Number);
    if (!name?.trim() || !sku?.trim() || !category?.trim() ||
        nums.some(n => !Number.isFinite(n) || n < 0) || !Number.isInteger(nums[2])) {
      return res.status(400).json({ message: "Informe dados válidos." });
    }
    const [result] = await db.execute(
      "UPDATE products SET name=?,sku=?,category=?,cost_price=?,sale_price=?,min_quantity=? WHERE id=?",
      [name.trim(), sku.trim(), category.trim(), ...nums, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Produto não encontrado." });
    res.json({ message: "Produto atualizado." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "SKU já cadastrado." });
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [moves] = await db.execute("SELECT id FROM stock_movements WHERE product_id=? LIMIT 1", [req.params.id]);
    if (moves.length) return res.status(409).json({ message: "Produto possui histórico. Preserve os registros de movimentação." });
    const [result] = await db.execute("DELETE FROM products WHERE id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Produto não encontrado." });
    res.json({ message: "Produto excluído." });
  } catch (error) { next(error); }
};

exports.move = async (req, res, next) => {
  const { type, quantity, note = "" } = req.body;
  const amount = Number(quantity);
  if (!["entrada", "saida"].includes(type) || !Number.isInteger(amount) || amount <= 0)
    return res.status(400).json({ message: "Movimentação inválida." });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT quantity FROM products WHERE id=? FOR UPDATE", [req.params.id]);
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Produto não encontrado." });
    }
    const current = rows[0].quantity;
    if (type === "saida" && amount > current) {
      await connection.rollback();
      return res.status(400).json({ message: "Estoque insuficiente." });
    }
    const updated = type === "entrada" ? current + amount : current - amount;
    await connection.execute("UPDATE products SET quantity=? WHERE id=?", [updated, req.params.id]);
    await connection.execute(
      "INSERT INTO stock_movements (product_id,movement_type,quantity,note) VALUES (?,?,?,?)",
      [req.params.id, type, amount, note.trim() || null]
    );
    await connection.commit();
    res.status(201).json({ message: "Movimentação registrada.", quantity: updated });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally { connection.release(); }
};

exports.dashboard = async (_req, res, next) => {
  try {
    const [[summary]] = await db.query(
      "SELECT COUNT(*) total_products, COALESCE(SUM(quantity),0) total_units, " +
      "COALESCE(SUM(quantity*cost_price),0) stock_cost_value, " +
      "COALESCE(SUM(CASE WHEN quantity<=min_quantity THEN 1 ELSE 0 END),0) low_stock FROM products"
    );
    const [recent] = await db.query(
      "SELECT m.id,p.name product_name,m.movement_type,m.quantity,m.note,m.created_at " +
      "FROM stock_movements m JOIN products p ON p.id=m.product_id ORDER BY m.created_at DESC LIMIT 8"
    );
    res.json({ ...summary, recent });
  } catch (error) { next(error); }
};
