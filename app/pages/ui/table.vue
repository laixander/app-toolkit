<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~/types'
import UserModal from '~/components/UserModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

definePageMeta({
    title: 'Table UI',
    headerActions: [
        { label: 'Add User', icon: 'i-lucide-user-plus', event: 'addUser', color: 'primary', variant: 'solid', size: 'md' },
    ]
})

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const { users, save, isPending: pending } = useUsers()
const events = useEvents()
const overlay = useOverlay()
const userModal = overlay.create(UserModal)
const confirmModal = overlay.create(ConfirmationModal)

const isAddUserOpen = ref(false)

events.on('addUser', () => {
    isAddUserOpen.value = true
})

function handleAddUser(userForm: Omit<User, 'id'>) {
    const newId = users.value.length > 0 ? Math.max(...users.value.map(u => u.id)) + 1 : 1
    const newUser = { id: newId, ...userForm }
    // Add to the beginning of the list
    save([newUser, ...users.value])
}

function handleEditUser(user: User) {
    userModal.open({
        user,
        title: 'Edit User',
        onSubmit: (userForm: Omit<User, 'id'>) => {
            // UserModal closes itself on submit. Now open confirmation.
            confirmModal.open({
                title: 'Confirm Changes',
                description: `Are you sure you want to save changes to ${userForm.name}?`,
                confirmLabel: 'Save Changes',
                confirmColor: 'warning',
                onConfirm: () => {
                    const index = users.value.findIndex(u => u.id === user.id)
                    if (index !== -1) {
                        const updatedUsers = [...users.value]
                        updatedUsers[index] = { id: user.id, ...userForm }
                        save(updatedUsers)
                    }
                }
            })
        }
    })
}

function handleDeleteUser(user: User) {
    confirmModal.open({
        title: 'Delete User',
        description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: () => {
            const updatedUsers = users.value.filter(u => u.id !== user.id)
            save(updatedUsers)
        }
    })
}

function getSortableHeader(label: string) {
    return ({ column }: any) => {
        const isSorted = column.getIsSorted()

        return h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            label,
            icon: isSorted
                ? isSorted === 'asc'
                    ? 'i-lucide-arrow-up-narrow-wide'
                    : 'i-lucide-arrow-down-wide-narrow'
                : 'i-lucide-arrow-up-down',
            class: '-mx-2.5',
            onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        })
    }
}

const columns: TableColumn<User>[] = [
    {
        accessorKey: 'id',
        header: getSortableHeader('ID'),
        cell: ({ row }) => `${row.getValue('id')}`
    },
    {
        accessorKey: 'name',
        header: getSortableHeader('Name'),
        cell: ({ row }) => `${row.getValue('name')}`
    },
    {
        accessorKey: 'email',
        header: getSortableHeader('Email'),
        cell: ({ row }) => `${row.getValue('email')}`
    },
    {
        accessorKey: 'role',
        header: getSortableHeader('Role'),
        cell: ({ row }) => {
            return h(UBadge, {
                label: `${row.getValue('role')}`,
                color: `${row.getValue('role') === 'Admin' ? 'primary' : row.getValue('role') === 'Editor' ? 'secondary' : 'success'}`,
                variant: 'subtle'
            })
        }
    },
    {
        id: 'actions',
        meta: {
            class: {
                td: 'text-right'
            }
        },
        cell: ({ row }) => {
            return h('div', {
                class: 'inline-flex gap-2'
            }, [
                h(UButton, {
                    icon: 'i-lucide-edit',
                    color: 'primary',
                    variant: 'ghost',
                    size: 'sm',
                    onClick: () => handleEditUser(row.original)
                }),
                h(UButton, {
                    icon: 'i-lucide-trash',
                    color: 'error',
                    variant: 'ghost',
                    size: 'sm',
                    onClick: () => handleDeleteUser(row.original)
                })
            ])
        }
    }
]
</script>

<template>
    <UTable :data="users" :columns="columns"
        class="flex-1" :ui="{ root: 'border-1 border-default rounded-xl bg-muted/50' }">
        <template #empty>
            <Empty :loading="pending" title="No users found"
                description="Your user database is currently empty. Click the 'Deploy Demo Data' FAB button or add one manually."
                icon="i-lucide-users">
                <template #action>
                    <UButton label="Add First User" icon="i-lucide-user-plus" color="primary" size="lg"
                        @click="events.emit('addUser')" />
                </template>
            </Empty>
        </template>
    </UTable>
    <UserModal v-model:open="isAddUserOpen" @submit="handleAddUser" />
</template>