<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { h, ref, useTemplateRef } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useOverlay } from '#imports'
import { UButton, UBadge } from '#components'

// Types
import type { User } from '~/types'

// Components
import UserModal from '~/components/UserModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

// ============================================================================
// Page Configuration
// ============================================================================
definePageMeta({
    title: 'Table UI',
    isTable: true,
    headerActions: [
        { label: 'Add User', icon: 'i-lucide-user-plus', event: 'addUser', color: 'primary', variant: 'solid', size: 'md' },
    ]
})

// ============================================================================
// Composables & State
// ============================================================================
// Services
const { users, addUser, updateUser, deleteUser, isPending: pending } = useUsers()
const events = useEvents()
const overlay = useOverlay()

// Modals
const userModal = overlay.create(UserModal)
const confirmModal = overlay.create(ConfirmationModal)

// Local State
const isAddUserOpen = ref(false)

// ============================================================================
// Event Listeners
// ============================================================================
// Global event listeners (e.g., triggered from header actions)
events.on('addUser', () => {
    isAddUserOpen.value = true
})

// ============================================================================
// Methods
// ============================================================================

/**
 * Handle Add User
 * Submits the form data from the Add User modal.
 */
async function handleAddUser(userForm: Omit<User, 'id'>) {
    await addUser(userForm)
    isAddUserOpen.value = false
}

/**
 * Handle Edit User
 * Opens the User Modal pre-filled with user data, then prompts for confirmation before saving.
 */
function handleEditUser(user: User) {
    userModal.open({
        user,
        title: 'Edit User',
        onSubmit: async (userForm: Omit<User, 'id'>) => {
            confirmModal.open({
                title: 'Confirm Changes',
                description: `Are you sure you want to save changes to ${userForm.name}?`,
                confirmLabel: 'Save Changes',
                confirmColor: 'warning',
                onConfirm: () => updateUser(user.id, userForm)
            })
        }
    })
}

/**
 * Handle Delete User
 * Opens a confirmation modal before deleting a user.
 */
function handleDeleteUser(user: User) {
    confirmModal.open({
        title: 'Delete User',
        description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
        onConfirm: () => deleteUser(user.id)
    })
}

// ============================================================================
// Table Configuration
// ============================================================================

/**
 * Column Definitions
 */
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
            const role = row.getValue('role') as string
            const badgeColor = role === 'Admin' ? 'primary' : role === 'Editor' ? 'secondary' : 'success'

            return h(UBadge, {
                label: role,
                color: badgeColor,
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
            return h('div', { class: 'inline-flex gap-2' }, [
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
const table = useTemplateRef('table')
const globalFilter = ref('')
const columnVisibility = ref({
    id: false
})
</script>

<template>
    <UPageCard title="Users Table"
        description="Below is a fully functional table component with CRUD operations. It uses server-side data fetching and Nuxt UI's UTable component. You can add, edit, and delete users, and the table will update in real-time."
        variant="naked" orientation="horizontal" class="border-b border-default rounded-none p-4">
        <div class="flex justify-end gap-2 flex-1">
            <TableGlobalFilter v-model="globalFilter" />
            <TableColumnToggle :table="table" />
        </div>
    </UPageCard>

    <UTable sticky ref="table" :data="users" :columns="columns" :loading="pending"
        v-model:column-visibility="columnVisibility" v-model:global-filter="globalFilter" class="flex-1 scrollbar">
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