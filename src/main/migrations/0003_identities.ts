export async function up (knex) {
  await knex.schema.createTable('identities', table => {
    table.integer('id').primary()
    table.text('identifier').notNullable()
    table.integer('identity_index').notNullable()

    table.index('identifier', 'identities_identifier_idx')
    table.index('identity_index', 'identities_index_idx')
  })
};

export async function down (knex) {
  await knex.schema.dropTableIfExists('wallet')
};
