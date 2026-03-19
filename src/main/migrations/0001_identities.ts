export async function up (knex) {
  await knex.schema.createTable('identities', table => {
    table.increments('id').primary()
    table.text('wallet_id').notNullable().references('wallet_id').inTable('wallet')
    table.integer('identity_index').notNullable()
    table.text('public_key_hash').notNullable()
    table.text('derivation_path').notNullable()

    table.index('wallet_id', 'identity_wallet_id_idx')
    table.index('public_key_hash', 'identity_public_key_hash_idx')
  })
}

export async function down (knex) {
  await knex.schema.dropTableIfExists('identities')
}
