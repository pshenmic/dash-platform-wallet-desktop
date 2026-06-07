import { useCallback, useEffect, useState } from 'react'
import { API } from '@renderer/api'
import { Contact, Network } from '@renderer/api/types'
import { useAuth } from '@renderer/contexts/AuthContext'

export interface UseAddressBook {
  contacts: Contact[]
  loading: boolean
  network: Network | undefined
  reload: () => void
  addContact: (label: string, address: string) => Promise<{ success: boolean; errorMessage: string | null }>
  deleteContact: (id: number) => Promise<void>
}

export function useAddressBook(): UseAddressBook {
  const { status } = useAuth()
  const network = (status?.network ?? undefined) as Network | undefined
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    if (!network) {
      setContacts([])
      setLoading(false)
      return
    }
    setLoading(true)
    API.getContacts(network)
      .then((list) => setContacts(list ?? []))
      .catch((e) => console.error('getContacts failed', e))
      .finally(() => setLoading(false))
  }, [network])

  useEffect(() => {
    reload()
  }, [reload])

  const addContact = useCallback(
    async (label: string, address: string) => {
      if (!network) {
        return { success: false, errorMessage: 'No active network' }
      }
      const res = await API.addContact(label, address, network)
      if (res.success) reload()
      return res
    },
    [network, reload],
  )

  const deleteContact = useCallback(
    async (id: number) => {
      const res = await API.deleteContact(id)
      if (res.success) reload()
    },
    [reload],
  )

  return { contacts, loading, network, reload, addContact, deleteContact }
}
