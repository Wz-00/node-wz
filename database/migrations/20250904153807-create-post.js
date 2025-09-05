'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // cek apakah tabel posts ada (MySQL)
    const [rows] = await queryInterface.sequelize.query("SHOW TABLES LIKE 'posts'");

    if (!rows || rows.length === 0) {
      // jika belum ada, buat table lengkap sesuai model (versi sederhana)
      await queryInterface.createTable('posts', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: { type: Sequelize.INTEGER, allowNull: false },
        title: { type: Sequelize.STRING, allowNull: false },
        slug: { type: Sequelize.STRING, allowNull: false, unique: true },
        excerpt: { type: Sequelize.STRING(512) },
        content: { type: Sequelize.TEXT('long') },
        featured_image: { type: Sequelize.STRING },
        status: { type: Sequelize.ENUM('draft','published'), defaultValue: 'draft' },
        published_at: { type: Sequelize.DATE, allowNull: true },
        category_id: { type: Sequelize.INTEGER, allowNull: true },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        deleted_at: { type: Sequelize.DATE, allowNull: true }
      });
      return;
    }

    // jika tabel sudah ada, tambahkan/ubah kolom dengan aman (abaikan jika kolom sudah ada)
    try {
      await queryInterface.addColumn('posts', 'category_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    } catch (e) {
      // kolom sudah ada atau error non-fatal — log dan lanjut
      console.warn('addColumn category_id skipped:', e.message);
    }

    try {
      await queryInterface.addColumn('posts', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (e) {
      console.warn('addColumn deleted_at skipped:', e.message);
    }

    try {
      await queryInterface.changeColumn('posts', 'published_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (e) {
      console.warn('changeColumn published_at skipped:', e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // jika tabel ada, coba kembalikan perubahan
    const [rows] = await queryInterface.sequelize.query("SHOW TABLES LIKE 'posts'");
    if (!rows || rows.length === 0) return;

    try {
      await queryInterface.changeColumn('posts', 'published_at', {
        type: Sequelize.DATE,
        allowNull: false,
      });
    } catch (e) {
      console.warn('down changeColumn published_at skipped:', e.message);
    }

    try { await queryInterface.removeColumn('posts', 'deleted_at'); } catch (e) { console.warn('down removeColumn deleted_at skipped:', e.message); }
    try { await queryInterface.removeColumn('posts', 'category_id'); } catch (e) { console.warn('down removeColumn category_id skipped:', e.message); }
  }
};