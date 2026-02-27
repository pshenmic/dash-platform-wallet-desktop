export async function up (knex) {
  await knex.schema.createTable('transactions_l1', table => {
    table.integer('id').primary()
    table.text('hash').notNullable()
    table.text('raw_data').notNullable()
    table.integer('timestamp').notNullable()

    table.index('hash', 'transactions_l1_hash_idx')
  })
};

export async function down (knex) {
  await knex.schema.dropTableIfExists('wallet')
};
