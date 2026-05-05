<script setup lang="ts">
definePageMeta({
    title: 'Table',
    headerActions: [
        // { label: 'Export All', icon: 'i-lucide-download', event: 'exportAll', color: 'primary' },
        { label: 'Reset', icon: 'i-lucide-rotate-ccw', event: 'reset', color: 'neutral' },
        { label: 'History', icon: 'i-lucide-history', event: 'viewLogs' }
    ]
})

import { ref, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'

const data = useLocalStorage<any[]>('users-data', [])

async function fetchUsers() {
    const users = await $fetch<any[]>('/api/users')
    if (users) {
        data.value = users
    }
}

onMounted(fetchUsers)

const columns = ref([
    {
        accessorKey: 'id',
        header: 'ID'
    },
    {
        accessorKey: 'name',
        header: 'Name'
    },
    {
        accessorKey: 'email',
        header: 'Email'
    },
    {
        accessorKey: 'role',
        header: 'Role'
    },
    {
        id: 'actions',
        header: 'Actions'
    }
])

const isModalOpen = ref(false)
const newUser = ref({
    name: '',
    email: '',
    role: 'Member'
})

function addUser() {
    isModalOpen.value = true
}

async function confirmAddUser() {
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: newUser.value
        })
        await fetchUsers()
        isModalOpen.value = false
        newUser.value = { name: '', email: '', role: 'Member' }
    } catch (e) {
        alert('Failed to add user')
    }
}

async function editUser(user: any) {
    const newName = prompt('Edit Name:', user.name)
    if (newName !== null) {
        try {
            await $fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                body: { name: newName }
            })
            await fetchUsers()
        } catch (e) {
            alert('Failed to update user')
        }
    }
}

async function deleteUser(user: any) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await $fetch(`/api/users/${user.id}`, {
                method: 'DELETE'
            })
            await fetchUsers()
        } catch (e) {
            alert('Failed to delete user')
        }
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-end">
            <UButton icon="i-lucide-plus" label="Add User" color="primary" @click="addUser" />
        </div>
        <UTable :data="data" :columns="columns" class="flex-1">
            <template #actions-cell="{ row }">
                <div class="flex items-center gap-2">
                    <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" @click="editUser(row.original)" />
                    <UButton icon="i-lucide-trash" variant="ghost" color="error" @click="deleteUser(row.original)" />
                </div>
            </template>
        </UTable>

        <UModal v-model:open="isModalOpen" title="Add User" description="Enter the details of the new user."
            :ui="{ content: 'sm:max-w-md' }">
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Name">
                        <UInput v-model="newUser.name" placeholder="Name" class="w-full" />
                    </UFormField>
                    <UFormField label="Email">
                        <UInput v-model="newUser.email" placeholder="Email" class="w-full" />
                    </UFormField>
                    <UFormField label="Role">
                        <USelect v-model="newUser.role" :items="['Admin', 'Member']" class="w-full" />
                    </UFormField>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="isModalOpen = false" />
                    <UButton label="Save" color="primary" @click="confirmAddUser" />
                </div>
            </template>
        </UModal>
    </div>
</template>