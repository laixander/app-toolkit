<script setup lang="ts">
import type { User } from '~/types'

interface Props {
    title?: string
    user?: User
}

const props = withDefaults(defineProps<Props>(), {
    title: 'User Details'
})

const emit = defineEmits<{
    (e: 'submit', user: { name: string; email: string; role: string }): void
    (e: 'cancel'): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const form = reactive({
    name: props.user?.name || '',
    email: props.user?.email || '',
    role: props.user?.role || 'Viewer'
})

watch(() => props.user, (newVal) => {
    if (newVal) {
        form.name = newVal.name
        form.email = newVal.email
        form.role = newVal.role
    } else {
        resetForm()
    }
}, { deep: true, immediate: true })

const roles = ['Admin', 'Editor', 'Viewer']

function onSubmit() {
    if (!form.name.trim() || !form.email.trim()) return

    emit('submit', { ...form })
    resetForm()
    isOpen.value = false
}

function onCancel() {
    resetForm()
    isOpen.value = false
    emit('cancel')
}

function resetForm() {
    form.name = ''
    form.email = ''
    form.role = 'Viewer'
}
</script>

<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'w-full sm:max-w-md' }">
        <template #content="{ close }">
            <div class="flex flex-col gap-6 p-4 sm:p-6">
                <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-semibold">{{ title }}</h3>
                    <p class="text-muted text-sm">{{ user ? 'Update the details for this user.' : 'Fill in the details for the new user.' }}</p>
                </div>

                <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
                    <UFormField label="Name" required>
                        <UInput v-model="form.name" placeholder="John Doe" icon="i-lucide-user"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Email" required>
                        <UInput v-model="form.email" type="email" placeholder="john@example.com"
                            icon="i-lucide-mail" class="w-full" />
                    </UFormField>

                    <UFormField label="Role">
                        <USelect v-model="form.role" :items="roles" icon="i-lucide-shield"
                            class="w-full" />
                    </UFormField>

                    <div class="flex justify-end gap-2 pt-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="onCancel" />
                        <UButton type="submit" :label="user ? 'Save Changes' : 'Add User'" color="primary" :icon="user ? 'i-lucide-save' : 'i-lucide-user-plus'"
                            :disabled="!form.name.trim() || !form.email.trim()" />
                    </div>
                </form>
            </div>

            <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="absolute top-2 right-2"
                @click="close" />
        </template>
    </UModal>
</template>
