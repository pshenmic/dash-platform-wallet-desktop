export async function up (knex) {
  await knex.schema.createTable('wallet', table => {
    table.text('wallet_id').primary()
    table.text('network').notNullable().checkIn(['testnet', 'mainnet'])
    table.text('encrypted_mnemonic').notNullable()
    table.text('label')
    table.boolean('selected').notNullable().defaultTo(false)

    table.unique('encrypted_mnemonic', {
      useConstraint: true
    })
    table.unique('wallet_id', {
      indexName: 'wallet_id_idx'
    })
    table.index('network', 'wallet_network_idx')
  })

  await knex.raw('CREATE UNIQUE INDEX one_selected_wallet ON wallet (selected) WHERE selected = 1')

  await knex.schema.createTable('addresses', table => {
    table.increments('id').primary()
    table.text('wallet_id').notNullable().references('wallet_id').inTable('wallet')
    table.text('address').notNullable()
    table.text('derivation_path').notNullable()
    table.integer('account_id').notNullable()
    table.integer('index').notNullable()
    table.boolean('is_change').notNullable().defaultTo(false)

    table.index('wallet_id', 'address_wallet_id_idx')
    table.index('address', 'address_idx')
  })
};

export async function down (knex) {
  await knex.schema.dropTableIfExists('wallet')
};
