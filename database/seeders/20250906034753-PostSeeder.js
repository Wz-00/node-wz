'use strict';
const { Post } = require('../../app/models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('posts', [{
      user_id: 1,
      title: 'Jika 17+8 Tuntutan Rakyat Tidak Dipenuhi, Apa yang Terjadi?',
      slug: 'jika-17-8-tuntutan-rakyat-tidak-dipenuhi-apa-yang-terjadi',
      content: '<p>Ketua BEM Kema Universitas Padjajaran Vincent Thomas menegaskan, masyarakat akan terus bergerak apabila 17+8 Tuntutan Rakyat tidak dipenuhi pemerintah.</p> <p>Unpad yang merupakan bagian dari Kolektif 17+8 Indonesia Berbenah akan segera mengkaji langkah lanjutan.</p>',
      featured_image: '/uploads/img2.png',
      status: 'published',
      category_id: 1,
      published_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }, {
      user_id: 1,
      title: 'Laptop Gaming Lenovo Legion Pro 7 Meluncur, Kini dengan Prosesor Ryzen 9000 HX',
      slug: 'laptop-gaming-lenovo-legion-pro-7-meluncur-kini-dengan-prosesor-ryzen-9000-hx',
      content: '<p>Perusahaan teknologi Lenovo merilis laptop gaming Legion Pro 7. Laptop ini dirilis dalam acara Lenovo Innovation World yang digelar di Berlin, Jerman, Kamis (4/9/2025).</p><p>Jurnalis KOMPAS.com, Lely Maulida, turut menghadiri acara peluncuran itu secara langsung dari Berlin.</p>',
      featured_image: '/uploads/img3.jpg',
      status: 'published',
      category_id: 2,
      published_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }, {
      user_id: 2,
      title: 'Update Harga Terbaru Toyota Trueno AE86',
      slug: 'update-harga-terbaru-toyota-trueno-ae86',
      content: "<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>",
      featured_image: '/uploads/img1.jpg',
      category_id: 4,
      status: 'published',
      published_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }, {
      user_id: 2,
      title: 'Solidaritas Lintas Batas: Dari Jiran Ke Ojol Jakarta',
      slug: 'solidaritas-lintas-batas-dari-jiran-ke-ojol-jakarta',
      content: "<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>",
      featured_image: '/uploads/img4.jpg',
      status: 'published',
      category_id: 1,
      published_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('posts', null, {});
  }
};
