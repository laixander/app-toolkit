<script setup lang="ts">
definePageMeta({
    title: 'Email Signature',
    headerActions: [
        // { label: 'Export All', icon: 'i-lucide-download', event: 'exportAll', color: 'primary' },
        { label: 'Reset', icon: 'i-lucide-rotate-ccw', event: 'reset', color: 'neutral' },
        { label: 'History', icon: 'i-lucide-history', event: 'viewLogs' }
    ]
})

import { ref, computed, onMounted } from 'vue'

const toast = useToast()
const events = useEvents()
const logger = useLogger('emailSignature')

const isDrawerOpen = ref(false)

events.on('viewLogs', () => {
    isDrawerOpen.value = true
})

events.on('reset', () => {
    form.value = {
        fullName: 'John Doe',
        position: 'Software Engineer',
        email: 'john.doe@example.com',
        contactNumber: '+1 234 567 8900',
    }
    logger.addLog('Email Signature Generator reset to defaults', 'warn')
    toast.add({ title: 'Reset Successful', description: 'Form has been cleared.', color: 'success' })
})

onMounted(() => {
    logger.addLog('Email Signature Generator initialized', 'info')
})

const form = ref({
    fullName: 'John Doe',
    position: 'Software Engineer',
    email: 'john.doe@example.com',
    contactNumber: '+1 234 567 8900',
})

const emailHtml = computed(() => {
    return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: Helvetica, Arial, sans-serif; font-size:14px; color:#333;">
  <tr>
    <td align="left">
      <!-- Card -->
      <table cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#f5f6f8" style="max-width:600px; background-color:#f5f6f8;">
        <tr>
          <td style="padding:16px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed;">
              <tr valign="middle">
                <!-- Logo -->
                <td width="120" style="width:120px; min-width:120px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" height="110">
                    <tr>
                      <td align="center" valign="middle" bgcolor="#0B5CAB" style="background-color:#0B5CAB;">
                        <img 
                          src="https://centralizedinc.com/img/ccci-logo-colored.svg"
                          width="96"
                          alt="Company Logo"
                          style="display:block; width:96px; min-width:96px; max-width:96px;"
                        >
                      </td>
                    </tr>
                  </table>
                </td>
                <!-- Spacer -->
                <td width="16">&nbsp;</td>
                <!-- Details -->
                <td style="white-space:nowrap;">
                  <!-- Name -->
                  <div style="font-size:17px; font-weight:bold; color:#0B5CAB; line-height:1.2;">
                    ${form.value.fullName}
                  </div>
                  <!-- Title -->
                  <div style="font-size:11px; text-transform:uppercase; color:#666; margin-top:2px; letter-spacing:0.6px;">
                    ${form.value.position}
                  </div>
                  <!-- Divider -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;">
                    <tr>
                      <td style="height:1px; background:#ddd; font-size:0; line-height:0;">&nbsp;</td>
                    </tr>
                  </table>
                  <!-- CONTACT -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px; font-size:12px; white-space:nowrap;">
                    <tr>
                      <!-- EMAIL -->
                      <td width="18" valign="middle">
                        <img src="https://api.iconify.design/mdi:email-outline.svg"
                             width="14"
                             style="display:block; width:14px; min-width:14px; max-width:14px; opacity:0.75;">
                      </td>
                      <td valign="middle" style="padding-left:6px;">
                        <a href="mailto:${form.value.email}" style="color:#0B5CAB; text-decoration:none;">
                          ${form.value.email}
                        </a>
                      </td>
                      <td width="24">&nbsp;</td>
                      <!-- PHONE -->
                      <td width="18" valign="middle">
                        <img src="https://api.iconify.design/mdi:phone-outline.svg"
                             width="14"
                             style="display:block; width:14px; min-width:14px; max-width:14px; opacity:0.75;">
                      </td>
                      <td valign="middle" style="padding-left:6px;">
                        <a href="tel:${form.value.contactNumber.replace(/[^0-9+]/g, '')}" style="color:#0B5CAB; text-decoration:none;">
                          ${form.value.contactNumber}
                        </a>
                      </td>
                      <td width="24">&nbsp;</td>
                      <!-- WEBSITE -->
                      <td width="18" valign="middle">
                        <img src="https://api.iconify.design/mdi:web.svg"
                             width="14"
                             style="display:block; width:14px; min-width:14px; max-width:14px; opacity:0.75;">
                      </td>
                      <td valign="middle" style="padding-left:6px;">
                        <a href="https://centralizedinc.com" style="color:#0B5CAB; text-decoration:none;">
                          centralizedinc.com
                        </a>
                      </td>
                    </tr>
                  </table>
                  <!-- Tagline -->
                  <div style="font-size:11px; color:#888; margin-top:8px;">
                    Cloud • Software Development • AI • Digital Transformation
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
})

const highlightedHtml = computed(() => {
    let html = emailHtml.value;

    // escape < and >
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // highlight comments
    html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-[#848cb5] dark:text-[#565f89] italic">$1</span>');

    // highlight tags and attributes
    html = html.replace(/(&lt;\/?)([a-zA-Z0-9]+)([\s\S]*?)(&gt;)/g, (match, p1, p2, p3, p4) => {
        let attrs = p3.replace(/([a-zA-Z0-9-]+)(=)("[\s\S]*?"|'[\s\S]*?'|[^\s&]+)/g, '<span class="text-[#9854f1] dark:text-[#bb9af7]">$1</span><span class="text-[#007197] dark:text-[#89ddff]">$2</span><span class="text-[#587539] dark:text-[#9ece6a]">$3</span>');
        return `<span class="text-[#007197] dark:text-[#89ddff]">${p1}</span><span class="text-[#f52a65] dark:text-[#f7768e]">${p2}</span>${attrs}<span class="text-[#007197] dark:text-[#89ddff]">${p4}</span>`;
    });

    return html;
});

const copied = ref(false)

const copyRawHtml = async () => {
    try {
        await navigator.clipboard.writeText(emailHtml.value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
        logger.addLog('Copied HTML source to clipboard', 'info')
        toast.add({ title: 'HTML copied!', description: 'Raw HTML source copied to clipboard.', color: 'success' })
    } catch (error) {
        console.error('Failed to copy HTML text', error)
        logger.addLog('Failed to copy HTML source', 'error')
        toast.add({ title: 'Failed to copy', description: 'Could not copy the HTML source.', color: 'error' })
    }
}
</script>
<template>
    <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">Email Signature Generator</h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Generate and copy your personalized email
                signature.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Input Form -->
            <div class="lg:col-span-4 flex flex-col gap-6">
                <UCard variant="soft">
                    <template #header>
                        <div class="flex items-center gap-4">
                            <div class="rounded-none squircle flex items-center p-2 bg-primary dark:bg-primary-900"><UIcon name="i-lucide-user" class="size-6 text-white dark:text-primary" /></div>
                            <div class="flex flex-col">
                                <h2 class="font-semibold text-neutral-900 dark:text-white">Your Details</h2>
                                <p class="text-sm text-dimmed">Enter your details below.</p>
                            </div>
                        </div>
                    </template>

                    <div class="space-y-6">
                        <UFormField label="Full Name">
                            <UInput v-model="form.fullName" placeholder="e.g. John Doe" size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="Position">
                            <UInput v-model="form.position" placeholder="e.g. Software Engineer" size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="Email">
                            <UInput v-model="form.email" type="email" placeholder="e.g. john@example.com" size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="Contact #">
                            <UInput v-model="form.contactNumber" placeholder="e.g. +1 234 567 8900" size="lg" class="w-full" />
                        </UFormField>
                    </div>
                </UCard>

                <UCard variant="soft" class="flex-1">
                    <template #header>
                        <div class="flex items-center gap-4">
                            <div class="rounded-none squircle flex items-center p-2 bg-primary dark:bg-primary-900"><UIcon name="i-lucide-info" class="size-6 text-white dark:text-primary" /></div>
                            <div class="flex flex-col">
                                <h2 class="font-semibold text-neutral-900 dark:text-white">How to use it</h2>
                                <p class="text-sm text-dimmed">Instructions on how to use this tool.</p>
                            </div>
                        </div>
                    </template>
                    <div class="space-y-4">
                        <div class="flex gap-3">
                            <div class="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-medium text-xs mt-0.5">1</div>
                            <p class="text-sm text-neutral-600 dark:text-neutral-300">Fill in your personal details in the form above.</p>
                        </div>
                        <div class="flex gap-3">
                            <div class="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-medium text-xs mt-0.5">2</div>
                            <p class="text-sm text-neutral-600 dark:text-neutral-300">Review how your signature looks in the <strong class="text-neutral-900 dark:text-white font-medium">Preview</strong> panel.</p>
                        </div>
                        <div class="flex gap-3">
                            <div class="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-medium text-xs mt-0.5">3</div>
                            <p class="text-sm text-neutral-600 dark:text-neutral-300">Click the <strong class="text-neutral-900 dark:text-white font-medium">Copy HTML</strong> button, or manually highlight and copy the HTML source, then paste it into your email settings.</p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Preview & Actions -->
            <div class="lg:col-span-8 space-y-6">
                <UCard variant="soft">
                    <template #header>
                        <div class="flex items-center gap-4">
                            <div class="rounded-none squircle flex items-center p-2 bg-primary dark:bg-primary-900"><UIcon name="i-lucide-mail" class="size-6 text-white dark:text-primary" /></div>
                            <div class="flex flex-col">
                                <h2 class="font-semibold text-neutral-900 dark:text-white">Preview</h2>
                                <p class="text-sm text-dimmed">Preview of your email signature.</p>
                            </div>
                        </div>
                    </template>

                    <!-- Rendered HTML Preview -->
                    <div class="overflow-x-auto bg-white p-6 rounded-lg border border-neutral-200 dark:border-neutral-800"
                        v-html="emailHtml"></div>
                </UCard>

                <!-- Source Code Preview -->
                <UCard variant="soft" :ui="{ body: 'p-0 sm:p-0' }">
                    <template #header>
                        <div class="flex items-center gap-4">
                            <div class="rounded-none squircle flex items-center p-2 bg-primary dark:bg-primary-900"><UIcon name="i-lucide-code" class="size-6 text-white dark:text-primary" /></div>
                            <div class="flex flex-col flex-1">
                                <h2 class="font-semibold text-neutral-900 dark:text-white">HTML Source</h2>
                                <p class="text-sm text-dimmed">Copy the HTML source below</p>
                            </div>
                            <div class="flex gap-2">
                                <UButton size="sm" :variant="copied ? 'solid' : 'ghost'" :icon="copied ? 'i-lucide-clipboard-check' : 'i-lucide-copy'" :color="copied ? 'success' : 'primary'" @click="copyRawHtml">
                                    {{ copied ? 'Copied' : 'Copy HTML' }}
                                </UButton>
                            </div>
                        </div>
                    </template>
                    <div class="max-h-96 overflow-y-auto bg-[#e1e2e7] dark:bg-[#1a1b26] p-4 scrollbar">
                        <pre class="whitespace-pre-wrap font-mono text-[#3760bf] dark:text-[#a9b1d6]" v-html="highlightedHtml"></pre>
                    </div>
                </UCard>
            </div>
        </div>
    </div>

    <LogsDrawer v-model:open="isDrawerOpen" namespace="emailSignature" />
</template>