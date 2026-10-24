'use strict';
const pool = require('../config/database');
async function managesHotel(userId, hotelId) {
  const [rows] = await pool.execute(
    'SELECT 1 FROM tb_admin_hotel WHERE id_usuario = ? AND id_hotel = ? AND ativo = 1 LIMIT 1',
    [userId, hotelId]
  );
  return rows.length > 0;
}
module.exports = { managesHotel };
