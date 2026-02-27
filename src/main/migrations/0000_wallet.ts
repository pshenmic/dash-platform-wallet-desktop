export async function up (knex) {
  await knex.schema.createTable('wallet', table => {
    table.integer('id').primary()
    table.text('wallet_id').notNullable()
    table.text('network').notNullable().checkIn(['testnet', 'mainnet'])
    table.text('encrypted_mnemonic').notNullable()
    table.text('label')

    table.unique('encrypted_mnemonic', {
      useConstraint: true
    })
    table.unique('wallet_id', {
      indexName: 'wallet_id_idx'
    })
    table.index('network', 'wallet_network_idx')
  })
};

export async function down (knex) {
  await knex.schema.dropTableIfExists('wallet')
};
