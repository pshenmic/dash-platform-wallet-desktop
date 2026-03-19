export async function up (knex): Promise<void> {
  await knex.schema.createTable('identities', table => {
    table.increments('id').primary()
    table.text('wallet_id').notNullable().references('wallet_id').inTable('wallet')
    table.integer('identity_index').notNullable()
    table.text('derivation_path').notNullable()
    table.text('identifier').notNullable()

    table.index('identifier', 'identity_identifier_idx')
    table.index('wallet_id', 'identity_wallet_id_idx')
  })
}

export async function down (knex): Promise<void> {
  await knex.schema.dropTableIfExists('identities')
}
