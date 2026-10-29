const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5434/sole_store?schema=public';
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('render.com') ? { rejectUnauthorized: false } : false,
});

const uuid = () => crypto.randomUUID();

// Helper to format rows to JS camelCase
const mapProduct = (row, sizes = [], images = []) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: row.category,
    description: row.description,
    price: parseFloat(row.price),
    salePrice: row.saleprice !== null && row.saleprice !== undefined ? parseFloat(row.saleprice) : (row.salePrice !== null && row.salePrice !== undefined ? parseFloat(row.salePrice) : null),
    imageUrl: row.imageurl || row.imageUrl,
    featured: Boolean(row.featured),
    createdAt: row.createdat || row.createdAt,
    updatedAt: row.updatedat || row.updatedAt,
    sizes: sizes.map((s) => ({
      id: s.id,
      productId: s.productid || s.productId,
      size: parseFloat(s.size),
      stockQuantity: parseInt(s.stockquantity || s.stockQuantity || 0, 10),
    })),
    images: images.map((img) => ({
      id: img.id,
      productId: img.productid || img.productId,
      imageUrl: img.imageurl || img.imageUrl,
      displayOrder: parseInt(img.displayorder || img.displayOrder || 0, 10),
    })),
  };
};

const createClient = (executor = pool) => {
  const query = (text, params) => executor.query(text, params);

  return {
    user: {
      findUnique: async ({ where }) => {
        let res;
        if (where.email) {
          res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [where.email.trim()]);
        } else if (where.id) {
          res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [where.id]);
        }
        if (!res || res.rows.length === 0) return null;
        const r = res.rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          passwordHash: r.passwordhash || r.passwordHash,
          role: r.role,
          createdAt: r.createdat || r.createdAt,
          updatedAt: r.updatedat || r.updatedAt,
        };
      },
      findMany: async ({ where = {} } = {}) => {
        let q = 'SELECT * FROM users';
        const params = [];
        if (where.role) {
          q += ' WHERE role = $1';
          params.push(where.role);
        }
        q += ' ORDER BY createdat DESC';
        const res = await query(q, params);
        return res.rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          createdAt: r.createdat || r.createdAt,
          updatedAt: r.updatedat || r.updatedAt,
          _count: { orders: 0 },
        }));
      },
      create: async ({ data }) => {
        const id = data.id || uuid();
        const now = new Date();
        const res = await query(
          `INSERT INTO users (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [id, data.name, data.email, data.passwordHash, data.role || 'customer', now, now]
        );
        const r = res.rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          createdAt: r.createdat || r.createdAt,
          updatedAt: r.updatedat || r.updatedAt,
        };
      },
      upsert: async ({ where, update, create }) => {
        let existing;
        if (where.email) {
          const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [where.email.trim()]);
          existing = res.rows[0];
        }
        if (existing) {
          const res = await query(
            `UPDATE users SET name = $1, "passwordHash" = $2, role = $3, "updatedAt" = NOW()
             WHERE id = $4 RETURNING *`,
            [update.name || existing.name, update.passwordHash || existing.passwordhash, update.role || existing.role, existing.id]
          );
          const r = res.rows[0];
          return { id: r.id, name: r.name, email: r.email, role: r.role, createdAt: r.createdat, updatedAt: r.updatedat };
        }
        return createClient(executor).user.create({ data: create });
      },
      count: async ({ where = {} } = {}) => {
        let q = 'SELECT COUNT(*)::int as count FROM users';
        const params = [];
        if (where.role) {
          q += ' WHERE role = $1';
          params.push(where.role);
        }
        const res = await query(q, params);
        return parseInt(res.rows[0].count, 10);
      },
    },

    product: {
      findMany: async ({ where = {}, orderBy = {}, skip = 0, take = 50, distinct = [] } = {}) => {
        if (distinct.includes('category')) {
          const res = await query('SELECT DISTINCT category FROM products ORDER BY category ASC');
          return res.rows;
        }
        if (distinct.includes('brand')) {
          const res = await query('SELECT DISTINCT brand FROM products ORDER BY brand ASC');
          return res.rows;
        }

        const conditions = [];
        const params = [];
        let pIdx = 1;

        if (where.category && where.category.equals) {
          conditions.push(`LOWER(category) = LOWER($${pIdx++})`);
          params.push(where.category.equals);
        } else if (where.category && typeof where.category === 'string') {
          conditions.push(`LOWER(category) = LOWER($${pIdx++})`);
          params.push(where.category);
        }

        if (where.brand && where.brand.equals) {
          conditions.push(`LOWER(brand) = LOWER($${pIdx++})`);
          params.push(where.brand.equals);
        }

        if (where.featured !== undefined) {
          conditions.push(`featured = $${pIdx++}`);
          params.push(where.featured);
        }

        if (where.price) {
          if (where.price.gte !== undefined) {
            conditions.push(`price >= $${pIdx++}`);
            params.push(where.price.gte);
          }
          if (where.price.lte !== undefined) {
            conditions.push(`price <= $${pIdx++}`);
            params.push(where.price.lte);
          }
        }

        if (where.OR && Array.isArray(where.OR)) {
          const orParts = [];
          for (const item of where.OR) {
            const field = Object.keys(item)[0];
            const term = item[field]?.contains;
            if (term) {
              orParts.push(`LOWER(${field}) LIKE LOWER($${pIdx++})`);
              params.push(`%${term}%`);
            }
          }
          if (orParts.length > 0) {
            conditions.push(`(${orParts.join(' OR ')})`);
          }
        }

        if (where.sizes && where.sizes.some) {
          conditions.push(`id IN (SELECT "productId" FROM product_sizes WHERE size = $${pIdx++} AND "stockQuantity" > 0)`);
          params.push(where.sizes.some.size);
        }

        if (where.id && where.id.not) {
          conditions.push(`id != $${pIdx++}`);
          params.push(where.id.not);
        }

        let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        let orderClause = 'ORDER BY "createdAt" DESC';
        if (orderBy.price === 'asc') orderClause = 'ORDER BY price ASC';
        if (orderBy.price === 'desc') orderClause = 'ORDER BY price DESC';
        if (orderBy.name === 'asc') orderClause = 'ORDER BY name ASC';

        let limitClause = '';
        if (take) {
          limitClause = `LIMIT $${pIdx++} OFFSET $${pIdx++}`;
          params.push(take, skip || 0);
        }

        const sql = `SELECT * FROM products ${whereClause} ${orderClause} ${limitClause}`;
        const res = await query(sql, params);
        if (res.rows.length === 0) return [];

        const productIds = res.rows.map((r) => r.id);
        const [sizesRes, imagesRes] = await Promise.all([
          query('SELECT * FROM product_sizes WHERE "productId" = ANY($1::text[]) ORDER BY size ASC', [productIds]),
          query('SELECT * FROM product_images WHERE "productId" = ANY($1::text[]) ORDER BY "displayOrder" ASC', [productIds]),
        ]);

        return res.rows.map((r) => {
          const s = sizesRes.rows.filter((sz) => (sz.productid || sz.productId) === r.id);
          const img = imagesRes.rows.filter((im) => (im.productid || im.productId) === r.id);
          return mapProduct(r, s, img);
        });
      },

      findUnique: async ({ where }) => {
        let res;
        if (where.id) {
          res = await query('SELECT * FROM products WHERE id = $1 LIMIT 1', [where.id]);
        } else if (where.slug) {
          res = await query('SELECT * FROM products WHERE slug = $1 LIMIT 1', [where.slug]);
        }
        if (!res || res.rows.length === 0) return null;
        const r = res.rows[0];
        const [sizesRes, imagesRes] = await Promise.all([
          query('SELECT * FROM product_sizes WHERE "productId" = $1 ORDER BY size ASC', [r.id]),
          query('SELECT * FROM product_images WHERE "productId" = $1 ORDER BY "displayOrder" ASC', [r.id]),
        ]);
        return mapProduct(r, sizesRes.rows, imagesRes.rows);
      },

      findFirst: async () => {
        const res = await query('SELECT * FROM products ORDER BY "createdAt" DESC LIMIT 1');
        if (res.rows.length === 0) return null;
        const r = res.rows[0];
        const [sizesRes, imagesRes] = await Promise.all([
          query('SELECT * FROM product_sizes WHERE "productId" = $1 ORDER BY size ASC', [r.id]),
          query('SELECT * FROM product_images WHERE "productId" = $1 ORDER BY "displayOrder" ASC', [r.id]),
        ]);
        return mapProduct(r, sizesRes.rows, imagesRes.rows);
      },

      count: async ({ where = {} } = {}) => {
        const conditions = [];
        const params = [];
        let pIdx = 1;

        if (where.category && where.category.equals) {
          conditions.push(`LOWER(category) = LOWER($${pIdx++})`);
          params.push(where.category.equals);
        }
        if (where.brand && where.brand.equals) {
          conditions.push(`LOWER(brand) = LOWER($${pIdx++})`);
          params.push(where.brand.equals);
        }
        if (where.featured !== undefined) {
          conditions.push(`featured = $${pIdx++}`);
          params.push(where.featured);
        }
        if (where.price) {
          if (where.price.gte !== undefined) {
            conditions.push(`price >= $${pIdx++}`);
            params.push(where.price.gte);
          }
          if (where.price.lte !== undefined) {
            conditions.push(`price <= $${pIdx++}`);
            params.push(where.price.lte);
          }
        }
        if (where.OR && Array.isArray(where.OR)) {
          const orParts = [];
          for (const item of where.OR) {
            const field = Object.keys(item)[0];
            const term = item[field]?.contains;
            if (term) {
              orParts.push(`LOWER(${field}) LIKE LOWER($${pIdx++})`);
              params.push(`%${term}%`);
            }
          }
          if (orParts.length > 0) {
            conditions.push(`(${orParts.join(' OR ')})`);
          }
        }
        if (where.sizes && where.sizes.some) {
          conditions.push(`id IN (SELECT "productId" FROM product_sizes WHERE size = $${pIdx++} AND "stockQuantity" > 0)`);
          params.push(where.sizes.some.size);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const res = await query(`SELECT COUNT(*)::int as count FROM products ${whereClause}`, params);
        return parseInt(res.rows[0].count, 10);
      },

      create: async ({ data }) => {
        const id = data.id || uuid();
        const now = new Date();
        const res = await query(
          `INSERT INTO products (id, name, slug, brand, category, description, price, "salePrice", "imageUrl", featured, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
          [
            id,
            data.name,
            data.slug,
            data.brand,
            data.category,
            data.description,
            data.price,
            data.salePrice,
            data.imageUrl,
            Boolean(data.featured),
            now,
            now,
          ]
        );

        if (data.sizes && data.sizes.create) {
          for (const s of data.sizes.create) {
            await query(
              `INSERT INTO product_sizes (id, "productId", size, "stockQuantity") VALUES ($1, $2, $3, $4)`,
              [uuid(), id, s.size, s.stockQuantity || 0]
            );
          }
        }

        if (data.images && data.images.create) {
          for (const img of data.images.create) {
            await query(
              `INSERT INTO product_images (id, "productId", "imageUrl", "displayOrder") VALUES ($1, $2, $3, $4)`,
              [uuid(), id, img.imageUrl, img.displayOrder || 0]
            );
          }
        }

        return createClient(executor).product.findUnique({ where: { id } });
      },

      update: async ({ where, data }) => {
        const fields = [];
        const params = [];
        let idx = 1;

        if (data.name !== undefined) { fields.push(`name = $${idx++}`); params.push(data.name); }
        if (data.slug !== undefined) { fields.push(`slug = $${idx++}`); params.push(data.slug); }
        if (data.brand !== undefined) { fields.push(`brand = $${idx++}`); params.push(data.brand); }
        if (data.category !== undefined) { fields.push(`category = $${idx++}`); params.push(data.category); }
        if (data.description !== undefined) { fields.push(`description = $${idx++}`); params.push(data.description); }
        if (data.price !== undefined) { fields.push(`price = $${idx++}`); params.push(data.price); }
        if (data.salePrice !== undefined) { fields.push(`"salePrice" = $${idx++}`); params.push(data.salePrice); }
        if (data.imageUrl !== undefined) { fields.push(`"imageUrl" = $${idx++}`); params.push(data.imageUrl); }
        if (data.featured !== undefined) { fields.push(`featured = $${idx++}`); params.push(data.featured); }

        fields.push(`"updatedAt" = NOW()`);
        params.push(where.id);

        await query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${idx}`, params);
        return createClient(executor).product.findUnique({ where: { id: where.id } });
      },

      delete: async ({ where }) => {
        await query('DELETE FROM products WHERE id = $1', [where.id]);
        return { id: where.id };
      },
    },

    productSize: {
      findMany: async ({ where = {}, orderBy = {}, take } = {}) => {
        let q = 'SELECT * FROM product_sizes';
        const params = [];
        let idx = 1;

        if (where.stockQuantity && where.stockQuantity.lt !== undefined) {
          q += ` WHERE "stockQuantity" < $${idx++}`;
          params.push(where.stockQuantity.lt);
        }

        q += ' ORDER BY "stockQuantity" ASC';
        if (take) {
          q += ` LIMIT $${idx++}`;
          params.push(take);
        }

        const res = await query(q, params);
        if (res.rows.length === 0) return [];

        const productIds = res.rows.map((r) => r.productId || r.productid);
        const prodRes = await query('SELECT id, name, brand, "imageUrl" FROM products WHERE id = ANY($1::text[])', [productIds]);

        return res.rows.map((r) => {
          const prod = prodRes.rows.find((p) => p.id === (r.productId || r.productid));
          return {
            id: r.id,
            productId: r.productId || r.productid,
            size: parseFloat(r.size),
            stockQuantity: parseInt(r.stockQuantity || r.stockquantity || 0, 10),
            product: prod ? {
              id: prod.id,
              name: prod.name,
              brand: prod.brand,
              imageUrl: prod.imageurl || prod.imageUrl,
            } : null,
          };
        });
      },

      deleteMany: async ({ where }) => {
        if (where.productId) {
          await query('DELETE FROM product_sizes WHERE "productId" = $1', [where.productId]);
        }
      },

      createMany: async ({ data }) => {
        for (const item of data) {
          await query(
            'INSERT INTO product_sizes (id, "productId", size, "stockQuantity") VALUES ($1, $2, $3, $4)',
            [uuid(), item.productId, item.size, item.stockQuantity || 0]
          );
        }
      },

      update: async ({ where, data }) => {
        if (data.stockQuantity && data.stockQuantity.decrement !== undefined) {
          const res = await query(
            'UPDATE product_sizes SET "stockQuantity" = "stockQuantity" - $1 WHERE id = $2 RETURNING *',
            [data.stockQuantity.decrement, where.id]
          );
          return res.rows[0];
        }
      },
    },

    productImage: {
      deleteMany: async ({ where }) => {
        if (where.productId) {
          await query('DELETE FROM product_images WHERE "productId" = $1', [where.productId]);
        }
      },

      createMany: async ({ data }) => {
        for (const item of data) {
          await query(
            'INSERT INTO product_images (id, "productId", "imageUrl", "displayOrder") VALUES ($1, $2, $3, $4)',
            [uuid(), item.productId, item.imageUrl, item.displayOrder || 0]
          );
        }
      },
    },

    cartItem: {
      findMany: async ({ where, include, orderBy }) => {
        const res = await query(
          'SELECT * FROM cart_items WHERE "userId" = $1 ORDER BY "createdAt" DESC',
          [where.userId]
        );
        if (res.rows.length === 0) return [];

        const productIds = res.rows.map((r) => r.productId || r.productid);
        const prods = await query('SELECT * FROM products WHERE id = ANY($1::text[])', [productIds]);
        const sizes = await query('SELECT * FROM product_sizes WHERE "productId" = ANY($1::text[])', [productIds]);

        return res.rows.map((r) => {
          const p = prods.rows.find((prod) => prod.id === (r.productId || r.productid));
          const pSizes = sizes.rows.filter((s) => (s.productId || s.productid) === (r.productId || r.productid));
          return {
            id: r.id,
            userId: r.userId || r.userid,
            productId: r.productId || r.productid,
            size: parseFloat(r.size),
            quantity: parseInt(r.quantity, 10),
            createdAt: r.createdAt || r.createdat,
            updatedAt: r.updatedAt || r.updatedat,
            product: mapProduct(p, pSizes, []),
          };
        });
      },

      findUnique: async ({ where }) => {
        let res;
        if (where.id) {
          res = await query('SELECT * FROM cart_items WHERE id = $1 LIMIT 1', [where.id]);
        } else if (where.userId_productId_size) {
          res = await query(
            'SELECT * FROM cart_items WHERE "userId" = $1 AND "productId" = $2 AND size = $3 LIMIT 1',
            [where.userId_productId_size.userId, where.userId_productId_size.productId, where.userId_productId_size.size]
          );
        }
        if (!res || res.rows.length === 0) return null;
        const r = res.rows[0];
        const pRes = await query('SELECT * FROM products WHERE id = $1', [r.productId || r.productid]);
        const sRes = await query('SELECT * FROM product_sizes WHERE "productId" = $1', [r.productId || r.productid]);
        return {
          id: r.id,
          userId: r.userId || r.userid,
          productId: r.productId || r.productid,
          size: parseFloat(r.size),
          quantity: parseInt(r.quantity, 10),
          product: pRes.rows[0] ? mapProduct(pRes.rows[0], sRes.rows, []) : null,
        };
      },

      upsert: async ({ where, update, create }) => {
        const cond = where.userId_productId_size;
        const existing = await query(
          'SELECT * FROM cart_items WHERE "userId" = $1 AND "productId" = $2 AND size = $3 LIMIT 1',
          [cond.userId, cond.productId, cond.size]
        );

        if (existing.rows.length > 0) {
          const res = await query(
            'UPDATE cart_items SET quantity = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
            [update.quantity, existing.rows[0].id]
          );
          return res.rows[0];
        }

        const res = await query(
          `INSERT INTO cart_items (id, "userId", "productId", size, quantity, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
          [uuid(), create.userId, create.productId, create.size, create.quantity || 1]
        );
        return res.rows[0];
      },

      update: async ({ where, data }) => {
        const res = await query(
          'UPDATE cart_items SET quantity = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
          [data.quantity, where.id]
        );
        return res.rows[0];
      },

      delete: async ({ where }) => {
        await query('DELETE FROM cart_items WHERE id = $1', [where.id]);
        return { id: where.id };
      },

      deleteMany: async ({ where }) => {
        if (where.userId) {
          await query('DELETE FROM cart_items WHERE "userId" = $1', [where.userId]);
        }
      },

      count: async ({ where }) => {
        const res = await query('SELECT COUNT(*)::int as count FROM cart_items WHERE "userId" = $1', [where.userId]);
        return parseInt(res.rows[0].count, 10);
      },
    },

    wishlistItem: {
      findMany: async ({ where }) => {
        const res = await query(
          'SELECT * FROM wishlist_items WHERE "userId" = $1 ORDER BY "createdAt" DESC',
          [where.userId]
        );
        if (res.rows.length === 0) return [];

        const productIds = res.rows.map((r) => r.productId || r.productid);
        const prods = await query('SELECT * FROM products WHERE id = ANY($1::text[])', [productIds]);
        const sizes = await query('SELECT * FROM product_sizes WHERE "productId" = ANY($1::text[]) ORDER BY size ASC', [productIds]);

        return res.rows.map((r) => {
          const p = prods.rows.find((prod) => prod.id === (r.productId || r.productid));
          const pSizes = sizes.rows.filter((s) => (s.productId || s.productid) === (r.productId || r.productid));
          return {
            id: r.id,
            userId: r.userId || r.userid,
            productId: r.productId || r.productid,
            createdAt: r.createdAt || r.createdat,
            product: mapProduct(p, pSizes, []),
          };
        });
      },

      findUnique: async ({ where }) => {
        let res;
        if (where.id) {
          res = await query('SELECT * FROM wishlist_items WHERE id = $1 LIMIT 1', [where.id]);
        } else if (where.userId_productId) {
          res = await query(
            'SELECT * FROM wishlist_items WHERE "userId" = $1 AND "productId" = $2 LIMIT 1',
            [where.userId_productId.userId, where.userId_productId.productId]
          );
        }
        if (!res || res.rows.length === 0) return null;
        return res.rows[0];
      },

      create: async ({ data }) => {
        const id = uuid();
        const res = await query(
          'INSERT INTO wishlist_items (id, "userId", "productId", "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
          [id, data.userId, data.productId]
        );
        return res.rows[0];
      },

      delete: async ({ where }) => {
        await query('DELETE FROM wishlist_items WHERE id = $1', [where.id]);
        return { id: where.id };
      },

      count: async ({ where }) => {
        const res = await query('SELECT COUNT(*)::int as count FROM wishlist_items WHERE "userId" = $1', [where.userId]);
        return parseInt(res.rows[0].count, 10);
      },
    },

    order: {
      findMany: async ({ where = {}, orderBy, skip = 0, take, select } = {}) => {
        let q = 'SELECT * FROM orders';
        const params = [];
        let idx = 1;

        const conds = [];
        if (where.userId) {
          conds.push(`"userId" = $${idx++}`);
          params.push(where.userId);
        }
        if (where.status && where.status !== 'All') {
          if (where.status.not) {
            conds.push(`status != $${idx++}`);
            params.push(where.status.not);
          } else {
            conds.push(`status = $${idx++}`);
            params.push(where.status);
          }
        }
        if (where.OR && Array.isArray(where.OR)) {
          const orParts = [];
          for (const item of where.OR) {
            const field = Object.keys(item)[0];
            const term = item[field]?.contains;
            if (term) {
              orParts.push(`LOWER("${field}") LIKE LOWER($${idx++})`);
              params.push(`%${term}%`);
            }
          }
          if (orParts.length > 0) conds.push(`(${orParts.join(' OR ')})`);
        }

        if (conds.length > 0) q += ` WHERE ${conds.join(' AND ')}`;
        q += ' ORDER BY "createdAt" DESC';
        if (take) {
          q += ` LIMIT $${idx++} OFFSET $${idx++}`;
          params.push(take, skip || 0);
        }

        const res = await query(q, params);
        if (res.rows.length === 0) return [];

        const orderIds = res.rows.map((r) => r.id);
        const userIds = res.rows.map((r) => r.userId || r.userid);

        const [itemsRes, usersRes] = await Promise.all([
          query('SELECT * FROM order_items WHERE "orderId" = ANY($1::text[])', [orderIds]),
          query('SELECT id, name, email FROM users WHERE id = ANY($1::text[])', [userIds]),
        ]);

        const prodIds = itemsRes.rows.map((i) => i.productId || i.productid).filter(Boolean);
        const prodRes = prodIds.length > 0
          ? await query('SELECT id, "imageUrl", brand, slug FROM products WHERE id = ANY($1::text[])', [prodIds])
          : { rows: [] };

        return res.rows.map((r) => {
          const oItems = itemsRes.rows.filter((it) => (it.orderId || it.orderid) === r.id);
          const u = usersRes.rows.find((usr) => usr.id === (r.userId || r.userid));

          return {
            id: r.id,
            orderNumber: r.orderNumber || r.ordernumber,
            userId: r.userId || r.userid,
            customerName: r.customerName || r.customername,
            phone: r.phone,
            deliveryAddress: r.deliveryAddress || r.deliveryaddress,
            city: r.city,
            state: r.state,
            postalCode: r.postalCode || r.postalcode,
            subtotal: parseFloat(r.subtotal),
            shippingCost: parseFloat(r.shippingCost || r.shippingcost),
            totalAmount: parseFloat(r.totalAmount || r.totalamount),
            status: r.status,
            createdAt: r.createdAt || r.createdat,
            updatedAt: r.updatedAt || r.updatedat,
            user: u || null,
            orderItems: oItems.map((oi) => {
              const p = prodRes.rows.find((p) => p.id === (oi.productId || oi.productid));
              return {
                id: oi.id,
                orderId: oi.orderId || oi.orderid,
                productId: oi.productId || oi.productid,
                productNameSnapshot: oi.productNameSnapshot || oi.productnamesnapshot,
                size: parseFloat(oi.size),
                quantity: parseInt(oi.quantity, 10),
                unitPrice: parseFloat(oi.unitPrice || oi.unitprice),
                lineTotal: parseFloat(oi.lineTotal || oi.linetotal),
                product: p ? { imageUrl: p.imageurl || p.imageUrl, brand: p.brand, slug: p.slug } : null,
              };
            }),
          };
        });
      },

      findUnique: async ({ where }) => {
        let res;
        if (where.id) {
          res = await query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [where.id]);
        } else if (where.orderNumber) {
          res = await query('SELECT * FROM orders WHERE "orderNumber" = $1 LIMIT 1', [where.orderNumber]);
        }
        if (!res || res.rows.length === 0) return null;
        const r = res.rows[0];

        const [itemsRes, usersRes] = await Promise.all([
          query('SELECT * FROM order_items WHERE "orderId" = $1', [r.id]),
          query('SELECT id, name, email FROM users WHERE id = $1', [r.userId || r.userid]),
        ]);

        const prodIds = itemsRes.rows.map((i) => i.productId || i.productid).filter(Boolean);
        const prodRes = prodIds.length > 0
          ? await query('SELECT id, "imageUrl", brand, slug FROM products WHERE id = ANY($1::text[])', [prodIds])
          : { rows: [] };

        return {
          id: r.id,
          orderNumber: r.orderNumber || r.ordernumber,
          userId: r.userId || r.userid,
          customerName: r.customerName || r.customername,
          phone: r.phone,
          deliveryAddress: r.deliveryAddress || r.deliveryaddress,
          city: r.city,
          state: r.state,
          postalCode: r.postalCode || r.postalcode,
          subtotal: parseFloat(r.subtotal),
          shippingCost: parseFloat(r.shippingCost || r.shippingcost),
          totalAmount: parseFloat(r.totalAmount || r.totalamount),
          status: r.status,
          createdAt: r.createdAt || r.createdat,
          updatedAt: r.updatedAt || r.updatedat,
          user: usersRes.rows[0] || null,
          orderItems: itemsRes.rows.map((oi) => {
            const p = prodRes.rows.find((p) => p.id === (oi.productId || oi.productid));
            return {
              id: oi.id,
              orderId: oi.orderId || oi.orderid,
              productId: oi.productId || oi.productid,
              productNameSnapshot: oi.productNameSnapshot || oi.productnamesnapshot,
              size: parseFloat(oi.size),
              quantity: parseInt(oi.quantity, 10),
              unitPrice: parseFloat(oi.unitPrice || oi.unitprice),
              lineTotal: parseFloat(oi.lineTotal || oi.linetotal),
              product: p ? { imageUrl: p.imageurl || p.imageUrl, brand: p.brand, slug: p.slug } : null,
            };
          }),
        };
      },

      create: async ({ data }) => {
        const id = data.id || uuid();
        const now = new Date();
        const res = await query(
          `INSERT INTO orders (id, "orderNumber", "userId", "customerName", phone, "deliveryAddress", city, state, "postalCode", subtotal, "shippingCost", "totalAmount", status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
          [
            id,
            data.orderNumber,
            data.userId,
            data.customerName,
            data.phone,
            data.deliveryAddress,
            data.city,
            data.state,
            data.postalCode,
            data.subtotal,
            data.shippingCost,
            data.totalAmount,
            data.status || 'Confirmed',
            now,
            now,
          ]
        );

        if (data.orderItems && data.orderItems.create) {
          for (const item of data.orderItems.create) {
            await query(
              `INSERT INTO order_items (id, "orderId", "productId", "productNameSnapshot", size, quantity, "unitPrice", "lineTotal")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [uuid(), id, item.productId, item.productNameSnapshot, item.size, item.quantity, item.unitPrice, item.lineTotal]
            );
          }
        }

        return createClient(executor).order.findUnique({ where: { id } });
      },

      update: async ({ where, data }) => {
        const res = await query(
          'UPDATE orders SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
          [data.status, where.id]
        );
        return createClient(executor).order.findUnique({ where: { id: where.id } });
      },

      count: async ({ where = {} } = {}) => {
        let q = 'SELECT COUNT(*)::int as count FROM orders';
        const params = [];
        if (where.status && where.status !== 'All') {
          q += ' WHERE status = $1';
          params.push(where.status);
        }
        const res = await query(q, params);
        return parseInt(res.rows[0].count, 10);
      },
    },

    orderItem: {
      create: async ({ data }) => {
        const res = await query(
          `INSERT INTO order_items (id, "orderId", "productId", "productNameSnapshot", size, quantity, "unitPrice", "lineTotal")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [uuid(), data.orderId, data.productId, data.productNameSnapshot, data.size, data.quantity, data.unitPrice, data.lineTotal]
        );
        return res.rows[0];
      },
    },

    $transaction: async (callback) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const txClient = createClient(client);
        const result = await callback(txClient);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    $queryRaw: async (strings, ...values) => {
      let text = strings[0];
      for (let i = 1; i < strings.length; i++) {
        text += `$${i}${strings[i]}`;
      }
      return pool.query(text, values);
    },

    $connect: async () => {
      const client = await pool.connect();
      client.release();
      return true;
    },

    $disconnect: async () => {
      await pool.end();
    },
  };
};

module.exports = {
  createClient,
  pool,
};
